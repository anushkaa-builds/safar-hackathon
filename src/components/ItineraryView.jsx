import { useState } from "react";
import {
  Calendar, MapPin, Clock, DollarSign, Users, ShieldAlert, Sparkles,
  ArrowRightLeft, Hotel, Plane, Train, Bus, Download, Share2, CheckCircle2, ChevronRight, Check
} from "lucide-react";
import { getTravelAndStayOptions } from "../services/itineraryGenerator";
import { searchRealHotels, searchRealFlights } from "../services/realSearchService";
import BookingModal from "./BookingModal";

export default function ItineraryView({ itinerary, onRegenerate, onOpenSOS }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activePlan, setActivePlan] = useState(itinerary);
  const [swapToast, setSwapToast] = useState("");
  const [transitTab, setTransitTab] = useState("flight");

  // Live Search States
  const [staySearchTab, setStaySearchTab] = useState("ai");
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [liveHotels, setLiveHotels] = useState([]);
  const [liveFlights, setLiveFlights] = useState([]);
  const [isSearchingHotels, setIsSearchingHotels] = useState(false);

  // Booking Modal State
  const [bookingModalState, setBookingModalState] = useState({
    isOpen: false,
    item: null,
    type: "hotel"
  });

  useEffect(() => {
    if (itinerary) {
      setActivePlan(itinerary);
    }
  }, [itinerary]);

  if (!activePlan || !activePlan.days || activePlan.days.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-3xl border-2 border-slate-200 shadow-xl my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-4">
          🧭
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Itinerary Found</h2>
        <p className="text-slate-600 font-semibold mb-6">
          Head over to "Plan Yatra" to set your destination, budget, and travel preferences to generate a personalized AI itinerary.
        </p>
        <button
          onClick={onRegenerate}
          className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-lg transition"
        >
          Go to Plan Yatra →
        </button>
      </div>
    );
  }

  const safeDayIndex = Math.min(selectedDayIndex, activePlan.days.length - 1);
  const currentDay = activePlan.days[safeDayIndex] || activePlan.days[0];
  const dest = activePlan.destination;

  const travelOptions = activePlan.availableTravelOptions || getTravelAndStayOptions(dest.name, activePlan.city || "Delhi");
  const currentSelectedTravel = activePlan.selectedTravel || travelOptions.flights[0] || travelOptions.trains[0];
  const currentSelectedStay = activePlan.selectedStay || activePlan.stayRecommendation || travelOptions.stays[0];

  // Helper to trigger component state update and parent persistence
  function notifyPlanChange(updatedPlan, toastMessage = "") {
    setActivePlan(updatedPlan);
    if (onUpdateItinerary) {
      onUpdateItinerary(updatedPlan);
    }
    if (toastMessage) {
      setSwapToast(toastMessage);
      setTimeout(() => setSwapToast(""), 4000);
    }
  }

  async function handleSearchHotelsSubmit(e) {
    if (e) e.preventDefault();
    setIsSearchingHotels(true);
    const results = await searchRealHotels({ query: hotelSearchQuery, destination: dest.name });
    setLiveHotels(results);
    setIsSearchingHotels(false);
  }

  function handleSelectTravel(opt) {
    const updated = { ...activePlan };
    updated.selectedTravel = opt;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].slot = `Morning (${opt.departureTime || '08:00 AM'} - 12:30 PM)`;
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${opt.provider || opt.mode} & Check-in at ${currentSelectedStay.name}`;
        day1.activities[0].estCost = `${opt.price} (Included)`;
        day1.activities[0].description = `Depart at ${opt.departureTime || '08:00 AM'} (${opt.route}). Arrive, transfer to ${currentSelectedStay.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setSwapToast(`✅ Travel updated to: ${opt.provider || opt.mode} (${opt.timing}, ${opt.price})`);
    setTimeout(() => setSwapToast(""), 4000);
  }

  function handleSelectStay(stayOpt) {
    const updated = { ...activePlan };
    updated.selectedStay = stayOpt;
    updated.stayRecommendation = stayOpt;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${currentSelectedTravel.provider || currentSelectedTravel.mode} & Check-in at ${stayOpt.name}`;
        day1.activities[0].description = `Depart at ${currentSelectedTravel.departureTime || '08:00 AM'} (${currentSelectedTravel.route}). Arrive, transfer to ${stayOpt.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setSwapToast(`✅ Accommodation updated to: ${stayOpt.name} (${stayOpt.price})`);
    setTimeout(() => setSwapToast(""), 4000);
  }

  function handleFinalizeItinerary() {
    const updated = { ...activePlan };
    updated.isFinalized = true;
    updated.selectedTravel = currentSelectedTravel;
    updated.selectedStay = currentSelectedStay;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].slot = `Morning (${currentSelectedTravel.departureTime || '08:00 AM'} - 12:30 PM)`;
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${currentSelectedTravel.provider || currentSelectedTravel.mode} & Check-in at ${currentSelectedStay.name}`;
        day1.activities[0].estCost = `${currentSelectedTravel.price} (Included)`;
        day1.activities[0].description = `Depart at ${currentSelectedTravel.departureTime || '08:00 AM'} (${currentSelectedTravel.route}). Arrive, transfer to ${currentSelectedStay.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setIsFinalized(true);
    setSwapToast(`🎉 Final Itinerary Generated with ${currentSelectedTravel.provider || currentSelectedTravel.mode} & ${currentSelectedStay.name}!`);
    setTimeout(() => setSwapToast(""), 4500);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenBookingModal(itemToBook, type) {
    setBookingModalState({
      isOpen: true,
      item: itemToBook,
      type: type
    });
  }

  function handleBookingSuccess(confirmedRecord) {
    if (confirmedRecord.type === "hotel") {
      handleSelectStay(confirmedRecord.itemDetails || confirmedRecord);
    } else {
      handleSelectTravel(confirmedRecord.itemDetails || confirmedRecord);
    }
    setSwapToast(`✅ Real Booking Confirmed! PNR: ${confirmedRecord.pnr} saved to Supabase.`);
    setTimeout(() => setSwapToast(""), 6000);
  }

  function handleSwap(dayIndex, activityId) {
    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const activity = updatedDays[dayIndex].activities.find(a => a.id === activityId);

    if (activity && activity.offbeatAlternative) {
      const alt = activity.offbeatAlternative;
      activity.title = alt.name + " (✨ Sustainable Offbeat Gem)";
      activity.description = alt.tagline + ". " + alt.benefit;
      activity.crowdScore = alt.crowdScore || 25;
      activity.crowdLevel = "Low (Serene)";
      activity.isSwapped = true;

      notifyPlanChange({ ...activePlan, days: updatedDays }, "✅ Swapped to serene offbeat gem: " + alt.name + "! Crowd reduced by ~70%.");
    }
  }

  // --- ACTIVITY EDITING FUNCTIONS ---

  function handleStartEditActivity(dayIndex, actIndex, activity) {
    setEditingActivity({
      dayIndex,
      actIndex,
      data: {
        title: activity.title,
        slot: activity.slot,
        type: activity.type,
        estCost: activity.estCost,
        crowdLevel: activity.crowdLevel || "Moderate",
        crowdScore: activity.crowdScore || 50,
        description: activity.description,
        tags: Array.isArray(activity.tags) ? activity.tags.join(", ") : (activity.tags || "")
      }
    });
  }

  function handleSaveEditedActivity(e) {
    e.preventDefault();
    if (!editingActivity) return;

    const { dayIndex, actIndex, data } = editingActivity;
    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const target = updatedDays[dayIndex].activities[actIndex];

    if (target) {
      target.title = data.title;
      target.slot = data.slot;
      target.type = data.type;
      target.estCost = data.estCost;
      target.crowdLevel = data.crowdLevel;
      target.crowdScore = Number(data.crowdScore) || 50;
      target.description = data.description;
      target.tags = data.tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    setEditingActivity(null);
    notifyPlanChange({ ...activePlan, days: updatedDays }, "✅ Activity updated successfully!");
  }

  function handleDeleteActivity(dayIndex, actIndex) {
    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const actName = updatedDays[dayIndex].activities[actIndex]?.title || "Activity";
    updatedDays[dayIndex].activities.splice(actIndex, 1);
    notifyPlanChange({ ...activePlan, days: updatedDays }, `🗑️ Removed "${actName}"`);
  }

  function handleMoveActivity(dayIndex, actIndex, direction) {
    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const acts = updatedDays[dayIndex].activities;
    const targetIndex = actIndex + direction;

    if (targetIndex < 0 || targetIndex >= acts.length) return;

    const temp = acts[actIndex];
    acts[actIndex] = acts[targetIndex];
    acts[targetIndex] = temp;

    notifyPlanChange({ ...activePlan, days: updatedDays }, "↕️ Activity reordered.");
  }

  // --- HTML5 DRAG AND DROP HANDLERS ---

  function handleDragStart(e, index) {
    setDraggedActIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverActIndex !== index) {
      setDragOverActIndex(index);
    }
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    if (draggedActIndex === null || draggedActIndex === dropIndex) {
      setDraggedActIndex(null);
      setDragOverActIndex(null);
      return;
    }

    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const acts = updatedDays[safeDayIndex].activities;
    const [draggedItem] = acts.splice(draggedActIndex, 1);
    acts.splice(dropIndex, 0, draggedItem);

    setDraggedActIndex(null);
    setDragOverActIndex(null);
    notifyPlanChange({ ...activePlan, days: updatedDays }, "↕️ Activities reordered via drag-and-drop.");
  }

  function handleDragEnd() {
    setDraggedActIndex(null);
    setDragOverActIndex(null);
  }

  // --- ADD ACTIVITY FUNCTIONS ---

  function handleOpenAddActivity() {
    setNewActivity({
      title: "",
      slot: SLOT_PRESETS[0],
      type: "Sightseeing",
      estCost: "₹200 - ₹500 per person",
      crowdLevel: "Low",
      crowdScore: 30,
      description: "",
      tags: "Sightseeing, Leisure"
    });
    setIsAddingActivity(true);
  }

  function handleSaveNewActivity(e) {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const day = updatedDays[safeDayIndex];

    const actToAdd = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newActivity.title.trim(),
      slot: newActivity.slot,
      type: newActivity.type,
      estCost: newActivity.estCost,
      crowdLevel: newActivity.crowdLevel,
      crowdScore: Number(newActivity.crowdScore) || 35,
      description: newActivity.description.trim() || `Enjoy your custom activity: ${newActivity.title}`,
      tags: newActivity.tags.split(",").map(t => t.trim()).filter(Boolean),
      isSwapped: false,
      offbeatAlternative: null
    };

    day.activities.push(actToAdd);
    setIsAddingActivity(false);
    notifyPlanChange({ ...activePlan, days: updatedDays }, `✨ Added "${actToAdd.title}" to Day ${day.dayNumber}!`);
  }

  // --- DAY MANAGEMENT FUNCTIONS ---

  function handleStartEditDayTitle() {
    setDayTitleInput(currentDay.title);
    setIsEditingDayTitle(true);
  }

  function handleSaveDayTitle(e) {
    e.preventDefault();
    if (!dayTitleInput.trim()) return;

    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    updatedDays[safeDayIndex].title = dayTitleInput.trim();
    setIsEditingDayTitle(false);
    notifyPlanChange({ ...activePlan, days: updatedDays }, "✅ Day title updated.");
  }

  function handleAddDay() {
    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const nextDayNum = updatedDays.length + 1;

    const newDayObj = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum}: Exploring Local Hidden Gems & Cultural Spots`,
      activities: [
        {
          id: `day-${nextDayNum}-morning-${Date.now()}`,
          slot: "Morning (09:00 AM - 12:30 PM)",
          title: `Morning Heritage & Nature Exploration`,
          type: "Sightseeing",
          crowdScore: 35,
          crowdLevel: "Low",
          estCost: "₹250 per person",
          description: `Stroll through peaceful gardens, heritage courtyards, and local scenic trails.`,
          tags: ["Heritage", "Nature", "Relaxation"],
          isSwapped: false,
          offbeatAlternative: null
        },
        {
          id: `day-${nextDayNum}-afternoon-${Date.now()}`,
          slot: "Afternoon (01:30 PM - 05:00 PM)",
          title: `Artisan Markets & Local Craft Exploration`,
          type: "Food & Culture",
          crowdScore: 45,
          crowdLevel: "Moderate",
          estCost: "₹500 - ₹1,000",
          description: `Visit local craft workshops, taste traditional tea & snacks, and interact with native artisans.`,
          tags: ["Culture", "Artisans", "Local Market"],
          isSwapped: false,
          offbeatAlternative: null
        }
      ]
    };

    updatedDays.push(newDayObj);
    const updatedPlan = {
      ...activePlan,
      duration: updatedDays.length,
      days: updatedDays
    };

    setSelectedDayIndex(updatedDays.length - 1);
    notifyPlanChange(updatedPlan, `📅 Added Day ${nextDayNum} to your itinerary!`);
  }

  function handleDeleteDay() {
    if (activePlan.days.length <= 1) {
      alert("An itinerary must contain at least 1 day.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Day ${currentDay.dayNumber}? This cannot be undone.`)) {
      return;
    }

    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    updatedDays.splice(safeDayIndex, 1);

    // Renumber days sequentially
    updatedDays.forEach((d, idx) => {
      d.dayNumber = idx + 1;
      // If title begins with Day X, update the prefix
      if (d.title.startsWith("Day ")) {
        const colonIndex = d.title.indexOf(":");
        if (colonIndex !== -1) {
          d.title = `Day ${idx + 1}` + d.title.substring(colonIndex);
        }
      }
    });

    const newIndex = Math.max(0, safeDayIndex - 1);
    setSelectedDayIndex(newIndex);

    const updatedPlan = {
      ...activePlan,
      duration: updatedDays.length,
      days: updatedDays
    };

    notifyPlanChange(updatedPlan, `🗑️ Day deleted. Remaining days renumbered.`);
  }

  function handleMoveDay(direction) {
    const targetIdx = safeDayIndex + direction;
    if (targetIdx < 0 || targetIdx >= activePlan.days.length) return;

    const updatedDays = JSON.parse(JSON.stringify(activePlan.days));
    const temp = updatedDays[safeDayIndex];
    updatedDays[safeDayIndex] = updatedDays[targetIdx];
    updatedDays[targetIdx] = temp;

    // Renumber day numbers sequentially to keep timeline clean
    updatedDays.forEach((d, idx) => {
      d.dayNumber = idx + 1;
    });

    setSelectedDayIndex(targetIdx);
    notifyPlanChange({ ...activePlan, days: updatedDays }, "↔️ Day sequence reordered.");
  }

  async function handleResetToAI() {
    if (!window.confirm("Revert all customized edits and restore the original AI-generated itinerary?")) {
      return;
    }
    if (onResetItinerary) {
      const resetPlan = await onResetItinerary();
      if (resetPlan) {
        setActivePlan(resetPlan);
        setSelectedDayIndex(0);
        setSwapToast("🔄 Itinerary reset to original AI route.");
        setTimeout(() => setSwapToast(""), 4000);
      }
    }
  }

  function handlePrint() {
    window.print();
  }

  const renderTravelAndStaySelection = (isAtTop = false) => (
    <div className={`rounded-3xl border-2 p-6 sm:p-8 space-y-6 shadow-xl ${isAtTop
        ? "bg-gradient-to-br from-blue-50/70 via-white to-amber-50/70 border-blue-300 ring-2 ring-blue-400/20 animate-fade-in"
        : "bg-white border-slate-200"
      }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️🏨</span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {isAtTop ? "Step 2: Choose Travel & Stay Preferences" : "Real Booking & Multimodal Switcher"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isAtTop ? `Select Your Travel & Stay for ${dest.name}` : "Live Booking & Options Directory"}
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Choose from curated AI recommendations or search live verified real hotels & flights with instant Stripe checkout & PNR voucher.
          </p>
        </div>

        {isAtTop && (
          <button
            type="button"
            onClick={handleFinalizeItinerary}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Final Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Travel & Transit Selection */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                ✈️
              </div>
              <h3 className="font-black text-slate-900 text-base">Travel & Transit</h3>
            </div>

            {/* Travel Mode Sub-tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
              <button
                type="button"
                onClick={() => setTransitTab("flight")}
                className={`px-3 py-1.5 rounded-lg transition ${transitTab === "flight" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Flights ({travelOptions.flights.length})
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("train")}
                className={`px-3 py-1.5 rounded-lg transition ${transitTab === "train" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Trains ({travelOptions.trains.length})
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("bus")}
                className={`px-3 py-1.5 rounded-lg transition ${transitTab === "bus" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Buses ({travelOptions.buses.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(transitTab === "flight" ? travelOptions.flights : transitTab === "train" ? travelOptions.trains : travelOptions.buses).map((opt) => {
              const isSelected = currentSelectedTravel?.id === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-2xl border-2 transition space-y-2.5 ${isSelected
                      ? "bg-blue-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40"
                      : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-black text-sm text-slate-900 block">{opt.provider || opt.mode}</span>
                      <span className="text-xs text-slate-600 font-semibold">{opt.timing || opt.departureTime} • {opt.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-800 block">{opt.price}</span>
                      <span className="text-[10px] text-slate-500 font-bold">per traveler</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 font-bold">
                    <span>{opt.route}</span>
                    <span>•</span>
                    <span>{opt.cabinClass || opt.stops}</span>
                    {opt.tags?.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectTravel(opt)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition ${isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                        }`}
                    >
                      {isSelected ? "✓ Plan Selected" : "Select for Plan"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(opt, "flight")}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Book Real Ticket</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Accommodation & Real Hotel Search */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
                🏨
              </div>
              <h3 className="font-black text-slate-900 text-base">Accommodation & Stays</h3>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
              <button
                type="button"
                onClick={() => setStaySearchTab("ai")}
                className={`px-3 py-1.5 rounded-lg transition ${staySearchTab === "ai" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                AI Curated ({travelOptions.stays.length})
              </button>
              <button
                type="button"
                onClick={() => setStaySearchTab("live")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${staySearchTab === "live" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Search className="w-3 h-3" />
                <span>Live Search ({liveHotels.length})</span>
              </button>
            </div>
          </div>

          {staySearchTab === "live" && (
            <form onSubmit={handleSearchHotelsSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={hotelSearchQuery}
                  onChange={(e) => setHotelSearchQuery(e.target.value)}
                  placeholder={`Search hotels in ${dest.name} (e.g. Taj, Radisson, Resort)...`}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-semibold pl-8 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={isSearchingHotels}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shrink-0"
              >
                {isSearchingHotels ? "Searching..." : "Search"}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {(staySearchTab === "ai" ? travelOptions.stays : liveHotels).map((stay) => {
              const isSelected = currentSelectedStay?.id === stay.id;
              return (
                <div
                  key={stay.id}
                  className={`p-4 rounded-2xl border-2 transition space-y-2.5 ${isSelected
                      ? "bg-amber-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40"
                      : "bg-white border-slate-200 hover:border-amber-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {stay.image && (
                      <img
                        src={stay.image}
                        alt={stay.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                        {stay.type}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1 leading-snug">{stay.name}</h4>
                      <p className="text-xs text-emerald-800 font-bold mt-0.5">{stay.price}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 block mb-1">
                        ⭐ {stay.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{stay.description || stay.address}</p>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectStay(stay)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition ${isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                        }`}
                    >
                      {isSelected ? "✓ Stay Selected" : "Select for Plan"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBookingModal(stay, "hotel")}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Book Real Room</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAtTop && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleFinalizeItinerary}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate & Finalize Detailed Day-by-Day Itinerary</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {!isFinalized && renderTravelAndStaySelection(true)}

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url(${dest.image})` }}
        />
        <div className="relative p-6 sm:p-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                {isFinalized ? "Final Itinerary" : "Draft Plan Preview"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs">
                {dest.category} Circuit
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Editable & Cloud-Synced
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onResetItinerary && (
                <button
                  onClick={handleResetToAI}
                  title="Reset custom modifications to AI baseline"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-black text-xs flex items-center gap-1.5 backdrop-blur-sm transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to AI
                </button>
              )}
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center gap-1.5 backdrop-blur-sm transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Plan
              </button>
              <button
                onClick={onOpenSOS}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{dest.name} Yatra</h1>
            <p className="text-sm sm:text-lg text-emerald-200 font-semibold mt-1">{dest.tagline}</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Total Duration</span>
              <span className="font-black text-base text-white">{activePlan.days.length} Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Budget per Person</span>
              <span className="font-black text-base text-emerald-300">₹{activePlan.budgetPerPerson?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Departure Timing</span>
              <span className="font-black text-base text-white">{currentSelectedTravel?.departureTime || activePlan.departTime || "08:00 AM"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Travel Party</span>
              <span className="font-black text-base text-amber-300 capitalize">{activePlan.travelType} ({activePlan.groupSize} {activePlan.groupSize === 1 ? "Person" : "People"})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 CONFIRMED SELECTIONS SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Travel Card */}
        <div className="p-5 rounded-3xl bg-blue-50 border-2 border-blue-300 shadow-sm space-y-2 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-200 px-2 py-0.5 rounded-md">
                  Confirmed Travel Choice
                </span>
                <h4 className="font-black text-base text-slate-900 mt-0.5">{currentSelectedTravel.provider || currentSelectedTravel.mode}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-emerald-800 bg-white border border-blue-200 px-2.5 py-1 rounded-xl shadow-sm block">
                {currentSelectedTravel.price}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-700 font-semibold space-y-0.5 pt-1">
            <p className="text-slate-900 font-bold">Route: {currentSelectedTravel.route}</p>
            <p className="text-slate-600">Schedule: {currentSelectedTravel.timing || currentSelectedTravel.departureTime} • {currentSelectedTravel.duration}</p>
            <p className="text-slate-500 text-[11px]">{currentSelectedTravel.cabinClass || currentSelectedTravel.stops}</p>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Integrated in Day 1 Departure
            </span>
            <button
              type="button"
              onClick={() => handleOpenBookingModal(currentSelectedTravel, "flight")}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] flex items-center gap-1 shadow-xs transition"
            >
              <CreditCard className="w-3 h-3 text-emerald-400" /> Book Real Ticket
            </button>
          </div>
        </div>

        {/* Selected Stay Card */}
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-2 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏨</span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                  Confirmed Accommodation
                </span>
                <h4 className="font-black text-base text-slate-900 mt-0.5">{currentSelectedStay.name}</h4>
              </div>
            </div>
            <span className="text-xs font-black text-amber-900 bg-white border border-amber-200 px-2.5 py-1 rounded-xl shadow-sm">
              ⭐ {currentSelectedStay.rating}
            </span>
          </div>
          <div className="text-xs text-slate-700 font-semibold space-y-0.5 pt-1">
            <p className="text-emerald-800 font-bold">Price: {currentSelectedStay.price}</p>
            <p className="text-slate-600 text-[11px] line-clamp-1">{currentSelectedStay.description || currentSelectedStay.address}</p>
            <p className="text-slate-500 text-[10px]">Tier: {currentSelectedStay.type}</p>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Integrated in Day 1 Check-in
            </span>
            <button
              type="button"
              onClick={() => handleOpenBookingModal(currentSelectedStay, "hotel")}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] flex items-center gap-1 shadow-xs transition"
            >
              <CreditCard className="w-3 h-3 text-emerald-400" /> Book Real Room
            </button>
          </div>
        </div>
      </div>

      {/* Action / Notification Toast */}
      {swapToast && (
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black text-sm flex items-center justify-between shadow-lg animate-fade-in">
          <span>{swapToast}</span>
          <button onClick={() => setSwapToast("")} className="text-emerald-800 font-bold px-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Health & Medical Advisory Notice */}
      {activePlan.medicalIssues && activePlan.medicalIssues.length > 0 && !activePlan.medicalIssues.includes("None (Fit to travel)") && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0">
            ❤️
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Medical Safety Profile Active</h4>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Noted Conditions: <span className="font-bold text-rose-800">{activePlan.medicalIssues.join(", ")}</span>.
              {activePlan.customMedicalInfo ? ` "${activePlan.customMedicalInfo}"` : ""}
            </p>
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              💡 Itinerary pace and altitude checkpoints have been calibrated for your safety. Stay well-hydrated and carry essential prescriptions.
            </p>
          </div>
        </div>
      )}

      {/* GIS Safety Advisory & Acclimatization Alert */}
      {dest.safetyRisk && (
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">GIS Safety & Regional Advisory ({dest.safetyRisk.level} Risk)</h4>
              <p className="text-xs text-slate-700 font-medium">{dest.safetyRisk.advisory}</p>
            </div>
          </div>
          <button
            onClick={onOpenSOS}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 transition"
          >
            Emergency Contacts
          </button>
        </div>
      )}

      {/* DAY SELECTOR & MANAGEMENT BAR */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-center gap-2">
          {activePlan.days.map((day, idx) => (
            <button
              key={`day-tab-${day.dayNumber}-${idx}`}
              onClick={() => {
                setSelectedDayIndex(idx);
                setIsEditingDayTitle(false);
              }}
              className={`px-4 sm:px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shrink-0 transition-all flex items-center gap-2 ${safeDayIndex === idx
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105"
                  : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                }`}
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Day {day.dayNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${safeDayIndex === idx ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                {day.activities?.length || 0}
              </span>
            </button>
          ))}

          {/* Add Day Button */}
          <button
            onClick={handleAddDay}
            className="px-4 py-3 rounded-2xl font-black text-xs sm:text-sm shrink-0 bg-emerald-50 text-emerald-800 border-2 border-dashed border-emerald-400 hover:bg-emerald-100 transition flex items-center gap-1.5"
            title="Add a new day to the itinerary"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Day</span>
          </button>
        </div>
      </div>

      {/* CURRENT DAY SCHEDULE & ACTIVITIES */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Day Header with Edit Title, Day Reordering, Delete Day, and Add Activity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Day {currentDay.dayNumber} Schedule
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {currentDay.activities.length} {currentDay.activities.length === 1 ? "Activity" : "Activities"}
              </span>
            </div>

            {/* Editable Day Title */}
            {isEditingDayTitle ? (
              <form onSubmit={handleSaveDayTitle} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={dayTitleInput}
                  onChange={(e) => setDayTitleInput(e.target.value)}
                  className="px-3 py-1.5 text-lg font-black text-slate-900 border-2 border-emerald-500 rounded-xl focus:outline-none w-full max-w-lg shadow-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition shrink-0"
                  title="Save Title"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingDayTitle(false)}
                  className="p-2 rounded-xl bg-slate-200 text-slate-700 font-black hover:bg-slate-300 transition shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentDay.title}</h2>
                <button
                  onClick={handleStartEditDayTitle}
                  className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  title="Rename Day Title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Toolbar for the Day */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Day Reorder Buttons */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => handleMoveDay(-1)}
                disabled={safeDayIndex === 0}
                className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                title="Move Day Earlier"
              >
                <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                <span className="hidden sm:inline">Move Left</span>
              </button>
              <button
                onClick={() => handleMoveDay(1)}
                disabled={safeDayIndex === activePlan.days.length - 1}
                className="px-2 py-1 rounded-lg text-xs font-black text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                title="Move Day Later"
              >
                <span className="hidden sm:inline">Move Right</span>
                <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>

            {/* Delete Day Button */}
            {activePlan.days.length > 1 && (
              <button
                onClick={handleDeleteDay}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs flex items-center gap-1 transition"
                title="Delete this entire day"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Day</span>
              </button>
            )}

            {/* Add Activity Button */}
            <button
              onClick={handleOpenAddActivity}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Instruction Hint */}
        {currentDay.activities.length > 1 && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
            <span>Tip: Drag activity cards using the handle icon or use the Up/Down buttons to reorder your schedule.</span>
          </div>
        )}

        {/* Activity Cards List */}
        <div className="space-y-4">
          {currentDay.activities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
              <p className="text-slate-600 font-bold text-sm">No activities scheduled for this day yet.</p>
              <button
                onClick={handleOpenAddActivity}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow hover:bg-emerald-700 transition"
              >
                + Add First Activity
              </button>
            </div>
          ) : (
            currentDay.activities.map((act, actIdx) => {
              const isCrowded = act.crowdScore > 75;
              const isFirst = actIdx === 0;
              const isLast = actIdx === currentDay.activities.length - 1;
              const isBeingDragged = draggedActIndex === actIdx;
              const isDragTarget = dragOverActIndex === actIdx;

              return (
                <div
                  key={act.id || `act-${safeDayIndex}-${actIdx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, actIdx)}
                  onDragOver={(e) => handleDragOver(e, actIdx)}
                  onDrop={(e) => handleDrop(e, actIdx)}
                  onDragEnd={handleDragEnd}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all relative group ${isBeingDragged
                      ? "opacity-40 border-dashed border-slate-400 scale-[0.99]"
                      : isDragTarget
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md scale-[1.01]"
                        : act.isSwapped
                          ? "bg-teal-50/50 border-teal-300 shadow-md"
                          : isCrowded
                            ? "bg-rose-50/30 border-rose-200"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {/* Top Bar: Drag Handle, Slot, Category, Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                        {act.slot}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        {act.type}
                      </span>
                      {act.isSwapped && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Offbeat Gem
                        </span>
                      )}
                    </div>

                    {/* Crowd Meter Badge */}
                    <div className="flex items-center gap-2 text-xs font-black">
                      <span className="text-slate-500">Live Crowd:</span>
                      <span className={`px-2.5 py-1 rounded-lg ${act.crowdScore > 80 ? "bg-rose-100 text-rose-800" : act.crowdScore > 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                        {act.crowdScore}% ({act.crowdLevel})
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleStartEditActivity(safeDayIndex, actIdx, act)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition"
                    title="Edit Activity"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(safeDayIndex, actIdx)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-xs transition"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                  </div>

        {/* Main Activity Info */}
        <div className="mt-3">
          <h3 className="font-black text-lg text-slate-900">{act.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            {act.description}
          </p>
        </div>

        {/* Estimated Cost & Tags */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Est. Fee: {act.estCost}</span>
          </div>

          {/* Sustainable 1-Click Reroute Button */}
          {act.offbeatAlternative && !act.isSwapped && (
            <button
              onClick={() => handleSwap(selectedDayIndex, act.id)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Avoid Surge: Swap with {act.offbeatAlternative.name}
            </button>
          )}
        </div>
      </div>
      );
          })}
    </div>
      </div >

    {/* Multimodal Transport & Stays Grid with Interactive Multiple Options */ }
    < div className = "grid grid-cols-1 md:grid-cols-2 gap-6" >
      {/* Multimodal Transit Breakdown with Multiple Flight/Train Selection */ }
      < div className = "bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl space-y-4" >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                ✈️
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Travel & Transit Options</h3>
                <p className="text-xs text-slate-500 font-semibold">Multiple flights and trains. Switch selection anytime:</p>
              </div>
            </div>

            {/* Sub-tab switcher for Itinerary view */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-black">
              <button
                type="button"
                onClick={() => setTransitTab("flight")}
                className={`px-2 py-1 rounded-lg transition ${
                  transitTab === "flight" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                Flights
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("train")}
                className={`px-2 py-1 rounded-lg transition ${
                  transitTab === "train" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                Trains
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("bus")}
                className={`px-2 py-1 rounded-lg transition ${
                  transitTab === "bus" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                Buses
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(transitTab === "flight" ? travelOptions.flights : transitTab === "train" ? travelOptions.trains : travelOptions.buses).map((opt) => {
              const isSelected = currentSelectedTravel?.id === opt.id;
              return (
                <div 
                  key={opt.id} 
                  className={`p-3.5 rounded-2xl border-2 transition space-y-2 ${
                    isSelected 
                      ? "bg-blue-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-400" 
                      : "bg-slate-50/70 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-slate-900 block">{opt.provider || opt.mode}</span>
                      <span className="text-[11px] text-slate-600 font-medium">{opt.timing} • {opt.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xs text-emerald-700 block">{opt.price}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectTravel(opt)}
                        className={`mt-1 px-3 py-1 rounded-xl text-[10px] font-black transition ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs cursor-default"
                            : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/50 text-[9px] text-slate-600 font-bold">
                    <span>{opt.route}</span>
                    <span>•</span>
                    <span>{opt.cabinClass || opt.stops}</span>
                    {opt.tags?.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div >

    {/* Stay & Hotel Recommendations with Select Buttons */ }
    < div className = "bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl space-y-4" >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
              🏨
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Accommodation Options</h3>
              <p className="text-xs text-slate-500 font-semibold">Select your preferred hotel or resort:</p>
            </div>
          </div>

          <div className="space-y-3">
            {travelOptions.stays.map((stay) => {
              const isSelected = currentSelectedStay?.id === stay.id;
              return (
                <div 
                  key={stay.id} 
                  className={`p-3.5 rounded-2xl border-2 transition space-y-2 ${
                    isSelected 
                      ? "bg-amber-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-400" 
                      : "bg-slate-50/70 border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                        {stay.type}
                      </span>
                      <h4 className="font-black text-xs text-slate-900 mt-1">{stay.name}</h4>
                      <p className="text-[11px] text-emerald-800 font-bold mt-0.5">{stay.price}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-200 block mb-1.5">
                        ⭐ {stay.rating}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectStay(stay)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black transition ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs cursor-default"
                            : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 font-medium line-clamp-1">{stay.description}</p>
                </div>
              );
            })}
          </div>

  {/* Budget Breakdown Chart */ }
  <div className="pt-2">
    <h4 className="font-black text-xs text-slate-900 mb-2">Budget Distribution Breakdown:</h4>
    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
      <div className="p-2 rounded-xl bg-teal-100 text-teal-900">
        <span>Stays (40%)</span>
        <p className="font-black">₹{activePlan.budgetBreakdown.stay.toLocaleString()}</p>
      </div>
      <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
        <span>Transit (25%)</span>
        <p className="font-black">₹{activePlan.budgetBreakdown.transit.toLocaleString()}</p>
      </div>
      <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
        <span>Sightseeing (25%)</span>
        <p className="font-black">₹{activePlan.budgetBreakdown.activities.toLocaleString()}</p>
      </div>
      <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
        <span>Buffer (10%)</span>
        <p className="font-black">₹{activePlan.budgetBreakdown.buffer.toLocaleString()}</p>
      </div>
    </div>
  </div>
        </div >
      </div >
    </div >
  );
}
