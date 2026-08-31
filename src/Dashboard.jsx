import { useState, useEffect } from "react";
import PlanYatra from "./PlanYatra";
import ItineraryView from "./components/ItineraryView";
import AIAssistant from "./components/AIAssistant";
import ReviewsView from "./components/ReviewsView";
import AlertToast from "./components/AlertToast";
import EmergencyModal from "./components/EmergencyModal";
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("planner");
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [sosOpen, setSosOpen] = useState(false);
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
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function handleItineraryReady(newPlan) {
    setCurrentItinerary(newPlan);
    setActiveTab("itinerary");
    monitorService.startMonitoring(newPlan.destination.name);
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
        setCurrentItinerary(updated);
        setActiveTab("itinerary");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-amber-50/30">
      {/* Top Navbar: Centered Heading with Tabs located right below */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-col items-center justify-center relative">
          {/* Top SOS button in absolute top-right position */}
          <div className="absolute right-4 sm:right-8 top-3">
            <button
              onClick={() => setSosOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition shrink-0"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">SOS Safety</span>
            </button>
          </div>

          {/* 1. Main Heading in the Topmost Center */}
          <div 
            onClick={() => setActiveTab("planner")}
            className="flex items-center gap-2 cursor-pointer mb-2.5"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md text-lg">
              🧭
            </div>
            <div className="text-center">
              <span className="font-black text-2xl text-slate-900 tracking-tight block leading-none">YatriSathi</span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wide block mt-0.5">AI-Powered Tourism Optimization Platform</span>
            </div>
          </div>

          {/* 2. The 4 Tabs located RIGHT BELOW the Main Heading */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-full">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const hasAlerts = tab.id === "assistant" && activeAlerts.length > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shrink-0 flex items-center gap-2 transition ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {hasAlerts && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
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
            onRegenerate={() => setActiveTab("planner")}
            onOpenSOS={() => setSosOpen(true)}
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
          onDismiss={() => setToastAlert(null)}
          onViewAssistant={() => setActiveTab("assistant")}
          onSwapRoute={handleSwapFromToast}
        />
      )}

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        destinationName={currentItinerary?.destination?.name || "Kashmir"}
      />
    </div>
  );
}