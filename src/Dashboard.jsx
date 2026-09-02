import { useState, useEffect } from "react";
import PlanYatra from "./PlanYatra";
import ItineraryView from "./components/ItineraryView";
import AIAssistant from "./components/AIAssistant";
import ReviewsView from "./components/ReviewsView";
import AlertToast from "./components/AlertToast";
import EmergencyModal from "./components/EmergencyModal";
import MyBookingsModal from "./components/MyBookingsModal";
import monitorService from "./services/monitoringService";
import { generateSmartItinerary } from "./services/itineraryGenerator";
import { getPreferences } from "./services/preferences";
import { ShieldAlert, Compass, Calendar, Bot, Star } from "lucide-react";

const tabs = [
  { id: "planner", label: "🎯 Plan Yatra", icon: Compass },
  { id: "itinerary", label: "📅 My Itinerary", icon: Calendar },
  { id: "assistant", label: "💬 AI Assistant", icon: Bot },
  { id: "reviews", label: "⭐ Reviews & Tips", icon: Star },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("planner");
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    getPreferences(userId).then((prefs) => {
      if (prefs) {
        const plan = generateSmartItinerary(prefs);
        setCurrentItinerary(plan);
      } else {
        const defaultPlan = generateSmartItinerary({ destination: "Kashmir", holidays: 5, budget: 450 });
        setCurrentItinerary(defaultPlan);
      }
    });

    const unsubscribe = monitorService.subscribe((alerts) => {
      setActiveAlerts(alerts);
      const newSevere = alerts.find(a => a.isNew);
      if (newSevere) {
        setToastAlert(newSevere);
      }
      const count = alerts.filter(a => a.isNew).length || (alerts.length > 0 ? 1 : 0);
      setUnreadAlertsCount(prev => (prev === 0 ? count : prev));
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    if (tabId === "assistant") {
      setUnreadAlertsCount(0);
      setToastAlert(null);
    }
  }

  function handleDismissToast() {
    setToastAlert(null);
    setUnreadAlertsCount(0);
  }

  function handleItineraryReady(newPlan) {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    saveItinerary(userId, newPlan);
    setCurrentItinerary(newPlan);
    setActiveTab("itinerary");
    monitorService.startMonitoring(newPlan.destination.name);
  }

  function handleUpdateItinerary(updatedPlan) {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    setCurrentItinerary(updatedPlan);
    saveItinerary(userId, updatedPlan);
  }

  async function handleResetItinerary() {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    await clearSavedItinerary(userId);
    const prefs = await getPreferences(userId);
    let plan;
    if (prefs) {
      plan = generateSmartItinerary(prefs);
    } else {
      plan = generateSmartItinerary({ destination: "Kashmir", holidays: 5, budget: 450 });
    }
    setCurrentItinerary(plan);
    return plan;
  }

  function handleSwapFromToast() {
    if (currentItinerary && currentItinerary.days.length > 0) {
      const updated = { ...currentItinerary };
      const targetAct = updated.days[0].activities[1];
      if (targetAct && targetAct.offbeatAlternative) {
        const alt = targetAct.offbeatAlternative;
        targetAct.title = alt.name + " (✨ Sustainable Offbeat Gem)";
        targetAct.description = alt.tagline + ". " + alt.benefit;
        targetAct.crowdScore = 25;
        targetAct.crowdLevel = "Low (Serene)";
        targetAct.isSwapped = true;
        handleUpdateItinerary(updated);
        setActiveTab("itinerary");
      }
    }
    setToastAlert(null);
    setUnreadAlertsCount(0);
  }

  const userEmail = user?.email || "Guest Yatri";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-amber-50/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-col items-center justify-center relative">

          {/* Top Left User & Bookings Access */}
          <div className="absolute left-4 sm:left-8 top-3 flex items-center gap-2">
            <button
              onClick={() => setBookingsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 font-black text-xs flex items-center gap-1.5 border border-slate-200 shadow-xs transition"
              title="View your confirmed bookings and PNR vouchers"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">My Bookings</span>
            </button>
          </div>

          {/* Top Right SOS & Logout */}
          <div className="absolute right-4 sm:right-8 top-3 flex items-center gap-2">
            <button
              onClick={() => setSosOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS Safety</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Logout</span>
              </button>
            )}
          </div>

          {/* 1. Main Heading in the Topmost Center */}
          <div
            onClick={() => handleTabChange("planner")}
            className="flex items-center gap-2 cursor-pointer mb-2.5"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md text-lg">
              🧭
            </div>
            <div className="text-center">
              <span className="font-black text-2xl text-slate-900 tracking-tight block leading-none">YatriSathi</span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wide block mt-0.5">AI Tourism & Real Booking Platform</span>
            </div>
          </div>

          {/* 2. The 4 Tabs located RIGHT BELOW the Main Heading */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-full">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const showCount = tab.id === "assistant" && unreadAlertsCount > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shrink-0 flex items-center gap-2 transition ${activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {showCount && (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md -ml-0.5">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="pb-16">
        {activeTab === "planner" && (
          <PlanYatra onItineraryGenerated={handleItineraryReady} />
        )}
        {activeTab === "itinerary" && (
          <ItineraryView
            itinerary={currentItinerary}
            onUpdateItinerary={handleUpdateItinerary}
            onResetItinerary={handleResetItinerary}
            onRegenerate={() => handleTabChange("planner")}
            onOpenSOS={() => setSosOpen(true)}
            onOpenMyBookings={() => setBookingsModalOpen(true)}
          />
        )}
        {activeTab === "assistant" && (
          <AIAssistant
            activeItinerary={currentItinerary}
            onSwapAlternative={handleSwapFromToast}
            onOpenSOS={() => setSosOpen(true)}
          />
        )}
        {activeTab === "reviews" && (
          <ReviewsView activeDestination={currentItinerary?.destination?.name || "Kashmir"} />
        )}
      </main>

      {/* Proactive Alert Floating Toast */}
      {toastAlert && (
        <AlertToast
          alert={toastAlert}
          onDismiss={handleDismissToast}
          onViewAssistant={() => handleTabChange("assistant")}
          onSwapRoute={handleSwapFromToast}
        />
      )}

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        destinationName={currentItinerary?.destination?.name || "Kashmir"}
      />

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={bookingsModalOpen}
        onClose={() => setBookingsModalOpen(false)}
      />
    </div>
  );
}
