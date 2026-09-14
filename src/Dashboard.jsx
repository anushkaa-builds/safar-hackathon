import { useState, useEffect } from "react";
import PlanYatra from "./PlanYatra";
import ItineraryView from "./components/ItineraryView";
import AIAssistant from "./components/AIAssistant";
import ReviewsView from "./components/ReviewsView";
import AlertToast from "./components/AlertToast";
import EmergencyModal from "./components/EmergencyModal";
import MyBookingsModal from "./components/MyBookingsModal";
import ErrorBoundary from "./components/ErrorBoundary";
import monitorService from "./services/monitoringService";
import { generateSmartItinerary } from "./services/itineraryGenerator";
import { getPreferences, getSavedItinerary, saveItinerary, clearSavedItinerary } from "./services/preferences";
import {
  Compass, Calendar, Bot, Star, Ticket, LogOut,
  ShieldAlert, Menu, X, ArrowUpRight, Search, MapPin, Sparkles, PhoneCall
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("planner");
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll for sticky navbar styling
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    getSavedItinerary(userId).then((savedPlan) => {
      if (savedPlan) {
        setCurrentItinerary(savedPlan);
        monitorService.monitorUserItinerary(savedPlan);
        return;
      }
      getPreferences(userId).then((prefs) => {
        if (prefs) {
          const plan = generateSmartItinerary(prefs);
          setCurrentItinerary(plan);
          monitorService.monitorUserItinerary(plan);
        }
      });
    });

    const unsubscribe = monitorService.subscribe((alerts) => {
      setActiveAlerts(alerts);
      // Never interrupt the user with alert popups while in the planner
      const newSevere = alerts.find((a) => a.isNew);
      if (newSevere && activeTab !== "planner") {
        setToastAlert(newSevere);
      }
      const count = alerts.filter((a) => a.isNew).length;
      setUnreadAlertsCount(count);
    });

    return () => {
      unsubscribe();
    };
  }, [user, activeTab]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === "planner" || tabId === "assistant") {
      setToastAlert(null);
    }
    if (tabId === "assistant") {
      setUnreadAlertsCount(0);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDismissToast(alertId) {
    setToastAlert(null);
    if (alertId) {
      monitorService.dismissAlert(alertId);
    }
  }

  function handleItineraryReady(newPlan) {
    const userId = localStorage.getItem("safar_user_id") || "demo_user";
    saveItinerary(userId, newPlan);
    setCurrentItinerary(newPlan);
    setActiveTab("itinerary");
    monitorService.monitorUserItinerary(newPlan);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      plan = generateSmartItinerary({ destination: "Kashmir", holidays: 5, budget: 35000 });
    }
    setCurrentItinerary(plan);
    return plan;
  }

  function handleSwapFromToast() {
    if (currentItinerary && currentItinerary.days?.length > 0) {
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
    <div className="min-h-screen bg-[#F7F5F0] text-[#1E293B] flex flex-col font-sans selection:bg-[#E99A25]/20 selection:text-[#172536]">
      {/* Editorial Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-sm py-3"
            : "bg-[#F7F5F0]/80 backdrop-blur-xs border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => handleTabChange("planner")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#172536] text-[#F7F5F0] flex items-center justify-center font-serif text-lg font-bold group-hover:bg-[#E99A25] transition-colors">
              S
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#172536] block leading-none">
                SAFAR
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#64748B] block mt-0.5">
                India Travel Guide
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleTabChange("planner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeTab === "planner"
                  ? "text-[#172536] font-bold bg-[#E5E0D8]/60"
                  : "text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30"
              }`}
            >
              Explore
            </button>

            <button
              onClick={() => {
                handleTabChange("planner");
                setTimeout(() => {
                  const el = document.getElementById("hidden-gems-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30 transition"
            >
              Destinations
            </button>

            <button
              onClick={() => {
                handleTabChange("planner");
                setTimeout(() => {
                  const el = document.getElementById("plan-yatra-form");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30 transition"
            >
              Plan Trip
            </button>

            <button
              onClick={() => {
                handleTabChange("planner");
                setTimeout(() => {
                  const el = document.getElementById("experiences-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30 transition"
            >
              Experiences
            </button>

            <div className="h-4 w-px bg-[#E5E0D8] mx-1" />

            {/* Active Platform Functionality Tabs */}
            <button
              onClick={() => handleTabChange("itinerary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === "itinerary"
                  ? "text-[#172536] font-bold bg-[#E5E0D8]/60"
                  : "text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#172536]" />
              <span>Itinerary</span>
            </button>

            <button
              onClick={() => handleTabChange("assistant")}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === "assistant"
                  ? "text-[#172536] font-bold bg-[#E5E0D8]/60"
                  : "text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#2D5A46]" />
              <span>AI Copilot</span>
              {unreadAlertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#E99A25] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange("reviews")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "text-[#172536] font-bold bg-[#E5E0D8]/60"
                  : "text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/30"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-[#E99A25]" />
              <span>Reviews</span>
            </button>
          </nav>

          {/* Right Action Tools: Bookings, Emergency, Profile/Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bookings shortcut */}
            <button
              onClick={() => setBookingsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-[#172536] font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
              title="View your confirmed travel bookings & vouchers"
            >
              <Ticket className="w-3.5 h-3.5 text-[#2D5A46]" />
              <span className="hidden md:inline">My Bookings</span>
            </button>

            {/* Restrained Emergency SOS Button */}
            <button
              onClick={() => setSosOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Emergency SOS helpline (112, 108)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>SOS</span>
            </button>

            {/* Sign Out / User Account */}
            {onLogout ? (
              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[#64748B] hover:text-[#172536] hover:bg-[#E5E0D8]/40 text-xs font-medium transition flex items-center gap-1"
                title={`Signed in as ${userEmail}`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Sign Out</span>
              </button>
            ) : null}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#172536] hover:bg-[#E5E0D8]/50 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E0D8] bg-[#F7F5F0] px-4 pt-3 pb-4 space-y-1 animate-fade-in shadow-lg">
            <button
              onClick={() => handleTabChange("planner")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "planner" ? "bg-[#172536] text-white" : "text-[#172536] hover:bg-[#E5E0D8]/50"
              }`}
            >
              Explore & Plan Yatra
            </button>
            <button
              onClick={() => handleTabChange("itinerary")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === "itinerary" ? "bg-[#172536] text-white" : "text-[#172536] hover:bg-[#E5E0D8]/50"
              }`}
            >
              <span>My Itinerary</span>
              <Calendar className="w-4 h-4 opacity-60" />
            </button>
            <button
              onClick={() => handleTabChange("assistant")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === "assistant" ? "bg-[#172536] text-white" : "text-[#172536] hover:bg-[#E5E0D8]/50"
              }`}
            >
              <span>AI Copilot & Safety</span>
              <Bot className="w-4 h-4 text-[#2D5A46]" />
            </button>
            <button
              onClick={() => handleTabChange("reviews")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === "reviews" ? "bg-[#172536] text-white" : "text-[#172536] hover:bg-[#E5E0D8]/50"
              }`}
            >
              <span>Reviews & Tips</span>
              <Star className="w-4 h-4 text-[#E99A25]" />
            </button>
            <div className="pt-2 border-t border-[#E5E0D8] flex gap-2">
              <button
                onClick={() => {
                  setBookingsModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-white border border-[#E5E0D8] text-[#172536]"
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  setSosOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-rose-50 text-rose-800 border border-rose-200"
              >
                Emergency (112)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main View Container */}
      <main className="flex-grow">
        {activeTab === "planner" && (
          <PlanYatra onItineraryGenerated={handleItineraryReady} />
        )}
        {activeTab === "itinerary" && (
          <ErrorBoundary onReset={handleResetItinerary}>
            <ItineraryView
              itinerary={currentItinerary}
              onUpdateItinerary={handleUpdateItinerary}
              onResetItinerary={handleResetItinerary}
              onRegenerate={() => handleTabChange("planner")}
              onOpenSOS={() => setSosOpen(true)}
              onOpenMyBookings={() => setBookingsModalOpen(true)}
            />
          </ErrorBoundary>
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

      {/* Minimalist Editorial Footer (Section 17) */}
      <footer className="bg-[#172536] text-[#F7F5F0] pt-16 pb-12 mt-20 border-t border-[#22344a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand Ethos */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#E99A25] text-[#172536] flex items-center justify-center font-serif text-base font-bold">
                  S
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white">SAFAR</span>
              </div>
              <p className="font-serif text-base italic text-slate-300 leading-relaxed">
                "Find your next place to explore."
              </p>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Thoughtfully crafted travel discovery, intelligent route planning, and contextual safety for Indian journeys.
              </p>
            </div>

            {/* Explore Column */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#E99A25]">Explore</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    onClick={() => {
                      handleTabChange("planner");
                      setTimeout(() => {
                        const el = document.getElementById("hidden-gems-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="hover:text-white transition"
                  >
                    Curated Destinations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleTabChange("planner");
                      setTimeout(() => {
                        const el = document.getElementById("experiences-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="hover:text-white transition"
                  >
                    Local Experiences
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleTabChange("planner");
                      setTimeout(() => {
                        const el = document.getElementById("plan-yatra-form");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="hover:text-white transition"
                  >
                    Travel Planner
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleTabChange("planner");
                      setTimeout(() => {
                        const el = document.getElementById("curated-circuits-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="hover:text-white transition"
                  >
                    Featured Roadtrips
                  </button>
                </li>
              </ul>
            </div>

            {/* Support & Helplines */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#E99A25]">Support & Safety</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button onClick={() => setSosOpen(true)} className="hover:text-white transition flex items-center gap-1.5 text-rose-300 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS (112)
                  </button>
                </li>
                <li>
                  <a href="tel:1363" className="hover:text-white transition">Tourist Helpline (1363)</a>
                </li>
                <li>
                  <a href="tel:108" className="hover:text-white transition">Ambulance & Medical (108)</a>
                </li>
                <li>
                  <button onClick={() => setBookingsModalOpen(true)} className="hover:text-white transition">
                    Booking Confirmations & PNR
                  </button>
                </li>
              </ul>
            </div>

            {/* Social & Connect */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#E99A25]">Connect</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <a href="#instagram" className="hover:text-white transition flex items-center gap-1">
                    Instagram <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href="#facebook" className="hover:text-white transition flex items-center gap-1">
                    Facebook <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href="#x" className="hover:text-white transition flex items-center gap-1">
                    X (Twitter) <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <button onClick={() => handleTabChange("reviews")} className="hover:text-white transition">
                    Stories From The Road
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom attribution bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} Safar Travel Platform. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Made with care for Indian travellers</span>
              <span>·</span>
              <span className="text-[#E99A25]">Authentic routes & crowd intelligence</span>
            </p>
          </div>
        </div>
      </footer>

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
