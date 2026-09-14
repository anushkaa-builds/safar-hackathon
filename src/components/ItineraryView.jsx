import { useState, useEffect } from "react";
import {
  Calendar, MapPin, Clock, DollarSign, Users, ShieldAlert, Sparkles,
  ArrowRightLeft, Hotel, Plane, Train, Bus, Download, Share2, CheckCircle2, ChevronRight, Check,
  ArrowDown, ArrowRight, ArrowUp, CreditCard, Edit3, GripVertical, Plus, RotateCcw, Search, Trash2, X
} from "lucide-react";
import { getTravelAndStayOptions, getReturnTransitOptions } from "../services/itineraryGenerator";
import { searchRealHotels, searchRealFlights } from "../services/realSearchService";
import BookingModal from "./BookingModal";

export const SLOT_PRESETS = [
  "Morning (09:00 AM - 12:30 PM)",
  "Afternoon (01:30 PM - 05:00 PM)",
  "Evening (05:30 PM - 08:30 PM)",
  "Night (09:00 PM - 11:00 PM)"
];

export default function ItineraryView({ itinerary, onRegenerate, onOpenSOS, onOpenMyBookings, onUpdateItinerary, onResetItinerary }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activePlan, setActivePlan] = useState(itinerary);
  const [isFinalized, setIsFinalized] = useState(itinerary?.isFinalized ?? false);
  const [swapToast, setSwapToast] = useState("");
  const [transitTab, setTransitTab] = useState("flight");

  // Day Title Editing State
  const [isEditingDayTitle, setIsEditingDayTitle] = useState(false);
  const [dayTitleInput, setDayTitleInput] = useState("");

  // Activity Drag-and-Drop Reordering State
  const [draggedActIndex, setDraggedActIndex] = useState(null);
  const [dragOverActIndex, setDragOverActIndex] = useState(null);

  // Activity Edit Modal State
  const [editingActivity, setEditingActivity] = useState(null);

  // Activity Add Modal State
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    slot: SLOT_PRESETS[0],
    type: "Sightseeing",
    estCost: "₹200 - ₹500 per person",
    crowdLevel: "Low",
    crowdScore: 30,
    description: "",
    tags: "Sightseeing, Leisure"
  });

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
      setIsFinalized(itinerary.isFinalized ?? false);
    }
  }, [itinerary]);

  if (!activePlan || !activePlan.days || activePlan.days.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center bg-white rounded-3xl border border-[#E5E0D8] shadow-sm my-12">
        <div className="w-16 h-16 bg-[#172536]/5 text-[#172536] rounded-2xl mx-auto flex items-center justify-center text-3xl mb-5">
          🧭
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172536] mb-3">No Active Itinerary Found</h2>
        <p className="text-slate-600 font-sans text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          Begin your journey in Plan Yatra to select your destination, budget, and travel preferences for an authentic, curated itinerary.
        </p>
        <button
          onClick={onRegenerate}
          className="px-6 py-3.5 rounded-xl bg-[#172536] hover:bg-[#22354d] text-[#F7F5F0] font-sans font-semibold text-sm shadow-sm transition inline-flex items-center gap-2"
        >
          <span>Go to Plan Yatra</span>
          <ArrowRight className="w-4 h-4 text-[#E99A25]" />
        </button>
      </div>
    );
  }

  const safeDayIndex = Math.min(selectedDayIndex, activePlan.days.length - 1);
  const currentDay = activePlan.days[safeDayIndex] || activePlan.days[0];
  const dest = activePlan.destination;

  const travelOptions = activePlan.availableTravelOptions || getTravelAndStayOptions(dest.name, activePlan.city || "Delhi");
  const returnTravelOptions = activePlan.availableReturnTravelOptions || getReturnTransitOptions(dest.name, activePlan.city || "Delhi");
  const currentSelectedTravel = activePlan.selectedTravel || travelOptions.flights[0] || travelOptions.trains[0];
  const currentSelectedStay = activePlan.selectedStay || activePlan.stayRecommendation || travelOptions.stays[0];
  const currentSelectedReturnTravel = activePlan.selectedReturnTravel || returnTravelOptions.flights[0] || returnTravelOptions.trains[0];

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

  function handleSelectReturnTravel(opt) {
    const updated = { ...activePlan };
    updated.selectedReturnTravel = opt;
    // Update the last day's return journey activity
    if (updated.days && updated.days.length > 0) {
      const lastDay = updated.days[updated.days.length - 1];
      const returnActivity = lastDay.activities?.find(a => a.isReturnJourney);
      if (returnActivity) {
        const originCity = updated.city || "Delhi";
        const destName = dest.name || "Destination";
        returnActivity.slot = `Evening (${opt.departureTime || "04:00 PM"} - ${opt.arrivalTime || "Late Night"})`;
        returnActivity.title = `Return Journey: ${destName} to ${originCity} via ${opt.provider || opt.mode}`;
        returnActivity.estCost = `${opt.price || "Transit"} (Return Ticket)`;
        returnActivity.description = `Depart from ${destName} at ${opt.departureTime || "04:00 PM"} via ${opt.provider || opt.mode} (${opt.route || destName + " to " + originCity}). Duration: ${opt.duration || "~8 hours"}. Arrive at ${originCity} by ${opt.arrivalTime || "late night"}. 💡 Booking Reminder: Book your return ${opt.type || "ticket"} in advance for the best fares and confirmed seats!`;
      }
      // Also update the day title
      lastDay.title = `Day ${lastDay.dayNumber}: Return Journey to ${updated.city || "Delhi"} via ${opt.provider || opt.mode} & Farewell`;
    }
    setActivePlan(updated);
    setSwapToast(`✅ Return travel updated to: ${opt.provider || opt.mode} (${opt.timing}, ${opt.price})`);
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
    updated.selectedReturnTravel = currentSelectedReturnTravel;
    if (updated.days && updated.days.length > 0) {
      // Finalize Day 1 (outbound)
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].slot = `Morning (${currentSelectedTravel.departureTime || '08:00 AM'} - 12:30 PM)`;
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${currentSelectedTravel.provider || currentSelectedTravel.mode} & Check-in at ${currentSelectedStay.name}`;
        day1.activities[0].estCost = `${currentSelectedTravel.price} (Included)`;
        day1.activities[0].description = `Depart at ${currentSelectedTravel.departureTime || '08:00 AM'} (${currentSelectedTravel.route}). Arrive, transfer to ${currentSelectedStay.name}, settle in, and acclimatize with local refreshments.`;
      }
      // Finalize Last Day (return journey)
      const lastDay = updated.days[updated.days.length - 1];
      const returnActivity = lastDay.activities?.find(a => a.isReturnJourney);
      if (returnActivity && currentSelectedReturnTravel) {
        const originCity = updated.city || "Delhi";
        const destName = dest.name || "Destination";
        returnActivity.slot = `Evening (${currentSelectedReturnTravel.departureTime || "04:00 PM"} - ${currentSelectedReturnTravel.arrivalTime || "Late Night"})`;
        returnActivity.title = `Return Journey: ${destName} to ${originCity} via ${currentSelectedReturnTravel.provider || currentSelectedReturnTravel.mode}`;
        returnActivity.estCost = `${currentSelectedReturnTravel.price || "Transit"} (Return Ticket)`;
        returnActivity.description = `Depart from ${destName} at ${currentSelectedReturnTravel.departureTime || "04:00 PM"} via ${currentSelectedReturnTravel.provider || currentSelectedReturnTravel.mode} (${currentSelectedReturnTravel.route || destName + " to " + originCity}). Duration: ${currentSelectedReturnTravel.duration || "~8 hours"}. Arrive at ${originCity} by ${currentSelectedReturnTravel.arrivalTime || "late night"}. 💡 Booking Reminder: Book your return ${currentSelectedReturnTravel.type || "ticket"} in advance for the best fares and confirmed seats!`;
        lastDay.title = `Day ${lastDay.dayNumber}: Return Journey to ${originCity} via ${currentSelectedReturnTravel.provider || currentSelectedReturnTravel.mode} & Farewell`;
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
    <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-sm ${isAtTop
        ? "bg-white border-[#E5E0D8] animate-fade-in"
        : "bg-white border-[#E5E0D8]"
      }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️🏨</span>
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#172536] bg-[#172536]/5 border border-[#172536]/15 px-2.5 py-0.5 rounded-full">
              {isAtTop ? "Step 2: Travel & Accommodations" : "Bookings & Transport Options"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#172536] mt-1.5">
            {isAtTop ? `Select Travel & Stay for ${dest.name}` : "Live Booking & Options Directory"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Choose curated options or search verified real hotels & flights with instant booking vouchers.
          </p>
        </div>

        {isAtTop && (
          <button
            type="button"
            onClick={handleFinalizeItinerary}
            className="px-5 py-3 rounded-xl bg-[#172536] hover:bg-[#22354d] text-[#F7F5F0] font-sans font-semibold text-sm shadow-sm flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-[#E99A25]" />
            <span>Generate Detailed Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Travel & Transit Selection */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#172536] text-[#F7F5F0] flex items-center justify-center font-bold text-xs">
                ✈️
              </div>
              <h3 className="font-serif font-bold text-[#172536] text-base">Travel & Transit</h3>
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
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E5E0D8]/30 bg-[#172536] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: `url(${dest.image})` }}
        />
        <div className="relative p-6 sm:p-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E99A25] text-[#172536] font-sans font-semibold text-xs uppercase tracking-wider">
                {isFinalized ? "Confirmed Circuit" : "Draft Itinerary"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 font-sans font-medium text-xs">
                {dest.category} Circuit
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15 font-sans font-medium text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E99A25]" /> Interactive Route
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onResetItinerary && (
                <button
                  onClick={handleResetToAI}
                  title="Reset custom modifications to baseline"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 font-sans font-medium text-xs flex items-center gap-1.5 backdrop-blur-sm transition border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans font-medium text-xs flex items-center gap-1.5 backdrop-blur-sm transition border border-white/10"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
              <button
                onClick={onOpenSOS}
                className="px-3.5 py-2 rounded-xl bg-rose-700/80 hover:bg-rose-700 text-white font-sans font-medium text-xs flex items-center gap-1.5 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">{dest.name} Journey</h1>
            <p className="text-sm sm:text-base text-[#F7F5F0]/80 font-sans mt-1.5 max-w-2xl">{dest.tagline}</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-white/60 font-sans block text-[11px]">Duration</span>
              <span className="font-serif font-bold text-base text-white mt-0.5 block">{activePlan.days.length} Days</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-white/60 font-sans block text-[11px]">Est. Budget / Person</span>
              <span className="font-serif font-bold text-base text-[#E99A25] mt-0.5 block">₹{activePlan.budgetPerPerson?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-white/60 font-sans block text-[11px]">Departure Time</span>
              <span className="font-sans font-semibold text-sm text-white mt-0.5 block">{currentSelectedTravel?.departureTime || activePlan.departTime || "08:00 AM"}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-white/60 font-sans block text-[11px]">Party</span>
              <span className="font-sans font-semibold text-sm text-white capitalize mt-0.5 block">{activePlan.travelType} ({activePlan.groupSize} {activePlan.groupSize === 1 ? "Person" : "People"})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 CONFIRMED SELECTIONS SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Travel Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-2.5 relative hover:border-slate-300 transition">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">✈️</span>
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#172536] bg-[#172536]/10 px-2 py-0.5 rounded">
                  Outbound Travel
                </span>
                <h4 className="font-serif font-bold text-base text-[#172536] mt-1">{currentSelectedTravel.provider || currentSelectedTravel.mode}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="font-serif font-bold text-sm text-[#172536] bg-[#F7F5F0] border border-[#E5E0D8] px-2.5 py-1 rounded-lg block">
                {currentSelectedTravel.price}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-700 font-sans space-y-0.5 pt-1">
            <p className="font-medium text-slate-900">Route: {currentSelectedTravel.route}</p>
            <p className="text-slate-500">Schedule: {currentSelectedTravel.timing || currentSelectedTravel.departureTime} • {currentSelectedTravel.duration}</p>
            <p className="text-slate-400 text-[11px]">{currentSelectedTravel.cabinClass || currentSelectedTravel.stops}</p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#E5E0D8]/60">
            <span className="text-[11px] font-sans font-medium text-[#2D5A46] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Day 1 Outbound Route
            </span>
            <button
              type="button"
              onClick={() => handleOpenBookingModal(currentSelectedTravel, "flight")}
              className="px-3.5 py-1.5 rounded-lg bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <CreditCard className="w-3 h-3 text-[#E99A25]" />
              <span>Book Ticket</span>
            </button>
          </div>
        </div>

        {/* Selected Stay Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-2.5 relative hover:border-slate-300 transition">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏨</span>
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B47012] bg-[#E99A25]/15 px-2 py-0.5 rounded">
                  Accommodation
                </span>
                <h4 className="font-serif font-bold text-base text-[#172536] mt-1">{currentSelectedStay.name}</h4>
              </div>
            </div>
            <span className="text-xs font-sans font-bold text-[#B47012] bg-[#F7F5F0] border border-[#E5E0D8] px-2.5 py-1 rounded-lg">
              ★ {currentSelectedStay.rating}
            </span>
          </div>
          <div className="text-xs text-slate-700 font-sans space-y-0.5 pt-1">
            <p className="font-medium text-[#2D5A46]">Price: {currentSelectedStay.price}</p>
            <p className="text-slate-500 text-[11px] line-clamp-1">{currentSelectedStay.description || currentSelectedStay.address}</p>
            <p className="text-slate-400 text-[10px]">Tier: {currentSelectedStay.type}</p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#E5E0D8]/60">
            <span className="text-[11px] font-sans font-medium text-[#2D5A46] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Day 1 Check-in Confirmed
            </span>
            <button
              type="button"
              onClick={() => handleOpenBookingModal(currentSelectedStay, "hotel")}
              className="px-3.5 py-1.5 rounded-lg bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <CreditCard className="w-3 h-3 text-[#E99A25]" />
              <span>Book Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmed Return Travel Card */}
      {currentSelectedReturnTravel && (
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-2.5 relative hover:border-slate-300 transition">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔙</span>
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#172536] bg-[#172536]/10 px-2 py-0.5 rounded">
                  Return Transit
                </span>
                <h4 className="font-serif font-bold text-base text-[#172536] mt-1">{currentSelectedReturnTravel.provider || currentSelectedReturnTravel.mode}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="font-serif font-bold text-sm text-[#172536] bg-[#F7F5F0] border border-[#E5E0D8] px-2.5 py-1 rounded-lg block">
                {currentSelectedReturnTravel.price}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-700 font-sans space-y-0.5 pt-1">
            <p className="font-medium text-slate-900">Route: {currentSelectedReturnTravel.route}</p>
            <p className="text-slate-500">Schedule: {currentSelectedReturnTravel.timing || currentSelectedReturnTravel.departureTime} • {currentSelectedReturnTravel.duration}</p>
            <p className="text-slate-400 text-[11px]">{currentSelectedReturnTravel.cabinClass || currentSelectedReturnTravel.stops}</p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#E5E0D8]/60">
            <span className="text-[11px] font-sans font-medium text-[#2D5A46] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Day {activePlan.duration || activePlan.days.length} Return Route
            </span>
            <button
              type="button"
              onClick={() => handleOpenBookingModal(currentSelectedReturnTravel, "flight")}
              className="px-3.5 py-1.5 rounded-lg bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <CreditCard className="w-3 h-3 text-[#E99A25]" />
              <span>Book Return Ticket</span>
            </button>
          </div>
        </div>
      )}

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
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-sans text-xs sm:text-sm shrink-0 transition-all flex items-center gap-2 ${safeDayIndex === idx
                  ? "bg-[#172536] text-white shadow-sm font-semibold"
                  : "bg-white text-slate-700 border border-[#E5E0D8] hover:border-slate-300 font-medium"
                }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#E99A25]" />
              <span>Day {day.dayNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${safeDayIndex === idx ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                {day.activities?.length || 0}
              </span>
            </button>
          ))}

          {/* Add Day Button */}
          <button
            onClick={handleAddDay}
            className="px-4 py-2.5 rounded-xl font-sans font-medium text-xs sm:text-sm shrink-0 bg-[#172536]/5 text-[#172536] border border-dashed border-[#172536]/30 hover:bg-[#172536]/10 transition flex items-center gap-1.5"
            title="Add a new day to the itinerary"
          >
            <Plus className="w-4 h-4 text-[#172536]" />
            <span>Add Day</span>
          </button>
        </div>
      </div>

      {/* CURRENT DAY SCHEDULE & ACTIVITIES */}
      <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Day Header with Edit Title, Day Reordering, Delete Day, and Add Activity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B47012]">
                Day {currentDay.dayNumber} Schedule
              </span>
              <span className="text-[10px] font-sans font-medium text-slate-500 bg-[#F7F5F0] border border-[#E5E0D8] px-2 py-0.5 rounded-full">
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
                  className="px-3 py-1.5 text-lg font-serif font-bold text-[#172536] border-2 border-[#172536] rounded-xl focus:outline-none w-full max-w-lg shadow-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#172536] text-white font-bold hover:bg-[#22354d] transition shrink-0"
                  title="Save Title"
                >
                  <Check className="w-4 h-4 text-[#E99A25]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingDayTitle(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#172536]">{currentDay.title}</h2>
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
            <div className="flex items-center bg-[#F7F5F0] border border-[#E5E0D8] rounded-xl p-1 gap-1">
              <button
                onClick={() => handleMoveDay(-1)}
                disabled={safeDayIndex === 0}
                className="px-2.5 py-1 rounded-lg text-xs font-sans font-medium text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                title="Move Day Earlier"
              >
                <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                <span className="hidden sm:inline">Move Left</span>
              </button>
              <button
                onClick={() => handleMoveDay(1)}
                disabled={safeDayIndex === activePlan.days.length - 1}
                className="px-2.5 py-1 rounded-lg text-xs font-sans font-medium text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
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
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans font-medium text-xs flex items-center gap-1 transition"
                title="Delete this entire day"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Day</span>
              </button>
            )}

            {/* Add Activity Button */}
            <button
              onClick={handleOpenAddActivity}
              className="px-4 py-2 rounded-xl bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#E99A25]" />
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
                  className={`p-5 sm:p-6 rounded-2xl border transition-all relative group ${isBeingDragged
                      ? "opacity-40 border-dashed border-slate-400 scale-[0.99]"
                      : isDragTarget
                        ? "border-[#172536] bg-[#172536]/5 shadow-sm scale-[1.01]"
                        : act.isSwapped
                          ? "bg-[#2D5A46]/5 border-[#2D5A46]/30 shadow-xs"
                          : isCrowded
                            ? "bg-rose-50/40 border-rose-200"
                            : "bg-[#FAF8F5] border-[#E5E0D8] hover:border-slate-300 shadow-xs"
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

                      <span className="px-3 py-1 rounded-lg bg-[#172536] text-[#F7F5F0] font-sans font-medium text-xs">
                        {act.slot}
                      </span>
                      <span className="text-xs font-sans font-medium text-slate-600 bg-white border border-[#E5E0D8] px-2.5 py-1 rounded-lg">
                        {act.type}
                      </span>
                      {act.isSwapped && (
                        <span className="text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#2D5A46] text-white">
                          Alternative Gem
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Crowd Meter Badge */}
                      <div className="flex items-center gap-1.5 text-xs font-sans font-medium">
                        <span className="text-slate-500">Live Crowd:</span>
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${act.crowdScore > 80 ? "bg-rose-100 text-rose-800" : act.crowdScore > 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-[#2D5A46]"
                          }`}>
                          {act.crowdScore}% ({act.crowdLevel})
                        </span>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEditActivity(safeDayIndex, actIdx, act)}
                        className="p-1.5 rounded-lg bg-white border border-[#E5E0D8] text-slate-700 hover:bg-[#172536]/5 hover:text-[#172536] shadow-xs transition"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(safeDayIndex, actIdx)}
                        className="p-1.5 rounded-lg bg-white border border-[#E5E0D8] text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-xs transition"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Activity Info */}
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-lg text-[#172536]">{act.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Estimated Cost & Tags */}
                  <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-sans font-medium text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-[#2D5A46]" />
                      <span>Est. Fee: {act.estCost}</span>
                    </div>

                    {/* Sustainable 1-Click Reroute Button */}
                    {act.offbeatAlternative && !act.isSwapped && (
                      <button
                        onClick={() => handleSwap(selectedDayIndex, act.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#E99A25]/15 border border-[#E99A25]/30 hover:bg-[#E99A25]/25 text-[#B47012] font-sans font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Avoid Surge: Swap with {act.offbeatAlternative.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            }))}
        </div>
      </div>

    {/* Multimodal Transport & Stays Grid with Interactive Multiple Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Multimodal Transit Breakdown with Multiple Flight/Train Selection */}
      <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172536] text-white flex items-center justify-center font-bold text-xs">
              ✈️
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#172536] text-base">Travel & Transit Options</h3>
              <p className="text-xs text-slate-500 font-sans">Switch transit mode or carrier anytime:</p>
            </div>
          </div>

          {/* Sub-tab switcher for Itinerary view */}
          <div className="flex gap-1 bg-[#F7F5F0] border border-[#E5E0D8] p-1 rounded-xl text-[10px] font-sans font-medium">
            <button
              type="button"
              onClick={() => setTransitTab("flight")}
              className={`px-2.5 py-1 rounded-lg transition ${
                transitTab === "flight" ? "bg-[#172536] text-white shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Flights
            </button>
            <button
              type="button"
              onClick={() => setTransitTab("train")}
              className={`px-2.5 py-1 rounded-lg transition ${
                transitTab === "train" ? "bg-[#172536] text-white shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Trains
            </button>
            <button
              type="button"
              onClick={() => setTransitTab("bus")}
              className={`px-2.5 py-1 rounded-lg transition ${
                transitTab === "bus" ? "bg-[#172536] text-white shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
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
                className={`p-3.5 rounded-xl border transition space-y-2 ${
                  isSelected 
                    ? "bg-[#172536]/5 border-[#172536] shadow-xs" 
                    : "bg-[#FAF8F5] border-[#E5E0D8] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-serif font-bold text-xs text-[#172536] block">{opt.provider || opt.mode}</span>
                    <span className="text-[11px] text-slate-500 font-sans">{opt.timing} • {opt.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-xs text-[#172536] block">{opt.price}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectTravel(opt)}
                      className={`mt-1 px-3 py-1 rounded-lg text-[10px] font-sans font-medium transition ${
                        isSelected
                          ? "bg-[#172536] text-white cursor-default"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-[#E5E0D8]"
                      }`}
                    >
                      {isSelected ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E5E0D8] text-[10px] text-slate-500 font-sans">
                  <span>{opt.route}</span>
                  <span>•</span>
                  <span>{opt.cabinClass || opt.stops}</span>
                  {opt.tags?.map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#172536]/5 text-[#172536] border border-[#172536]/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stay & Hotel Recommendations with Select Buttons */}
      <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E99A25]/20 text-[#B47012] flex items-center justify-center font-bold text-xs">
            🏨
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#172536] text-base">Accommodation Options</h3>
            <p className="text-xs text-slate-500 font-sans">Select your preferred hotel or heritage stay:</p>
          </div>
        </div>

        <div className="space-y-3">
          {travelOptions.stays.map((stay) => {
            const isSelected = currentSelectedStay?.id === stay.id;
            return (
              <div 
                key={stay.id} 
                className={`p-3.5 rounded-xl border transition space-y-2 ${
                  isSelected 
                    ? "bg-[#E99A25]/5 border-[#E99A25] shadow-xs" 
                    : "bg-[#FAF8F5] border-[#E5E0D8] hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-sans font-bold uppercase text-[#B47012] bg-[#E99A25]/15 px-1.5 py-0.5 rounded">
                      {stay.type}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-[#172536] mt-1">{stay.name}</h4>
                    <p className="text-[11px] text-[#2D5A46] font-sans font-medium mt-0.5">{stay.price}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-sans font-bold text-[#B47012] bg-white px-2 py-0.5 rounded-md border border-[#E5E0D8] block mb-1.5">
                      ★ {stay.rating}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectStay(stay)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-sans font-medium transition ${
                        isSelected
                          ? "bg-[#172536] text-white cursor-default"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-[#E5E0D8]"
                      }`}
                    >
                      {isSelected ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                </div>
                {stay.description && (
                  <p className="text-[10px] text-slate-500 font-sans line-clamp-1 pt-1 border-t border-[#E5E0D8]/50">{stay.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget Breakdown Chart */}
        {activePlan.budgetBreakdown && (
          <div className="pt-2 border-t border-[#E5E0D8]">
            <h4 className="font-serif font-bold text-xs text-[#172536] mb-2.5">Budget Distribution:</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-sans">
              <div className="p-2 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-slate-800">
                <span className="text-slate-500 block">Stays (40%)</span>
                <p className="font-serif font-bold text-xs text-[#172536] mt-0.5">₹{activePlan.budgetBreakdown.stay?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-slate-800">
                <span className="text-slate-500 block">Transit (25%)</span>
                <p className="font-serif font-bold text-xs text-[#172536] mt-0.5">₹{activePlan.budgetBreakdown.transit?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-slate-800">
                <span className="text-slate-500 block">Visits (25%)</span>
                <p className="font-serif font-bold text-xs text-[#172536] mt-0.5">₹{activePlan.budgetBreakdown.activities?.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] text-slate-800">
                <span className="text-slate-500 block">Buffer (10%)</span>
                <p className="font-serif font-bold text-xs text-[#172536] mt-0.5">₹{activePlan.budgetBreakdown.buffer?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* STRIPE & PNR BOOKING MODAL */}
      {bookingModalState.isOpen && (
        <BookingModal
          isOpen={bookingModalState.isOpen}
          onClose={() => setBookingModalState({ isOpen: false, item: null, type: "hotel" })}
          item={bookingModalState.item}
          type={bookingModalState.type}
          destination={dest?.name || "Destination"}
          onBookingComplete={handleBookingSuccess}
        />
      )}

      {/* EDIT ACTIVITY MODAL */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E5E0D8] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#172536]" />
                <h3 className="font-serif font-bold text-lg text-[#172536]">Edit Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  value={editingActivity.data.title}
                  onChange={(e) => setEditingActivity({
                    ...editingActivity,
                    data: { ...editingActivity.data, title: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] font-sans font-medium text-sm focus:border-[#172536] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={editingActivity.data.slot}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      data: { ...editingActivity.data, slot: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                  >
                    {SLOT_PRESETS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingActivity.data.type}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      data: { ...editingActivity.data, type: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Nature">Nature</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Estimated Cost</label>
                  <input
                    type="text"
                    value={editingActivity.data.estCost}
                    onChange={(e) => setEditingActivity({
                      ...editingActivity,
                      data: { ...editingActivity.data, estCost: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                    placeholder="₹300 - ₹600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Crowd Score ({editingActivity.data.crowdScore}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={editingActivity.data.crowdScore}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      const level = score > 75 ? "High (Peak)" : score > 45 ? "Moderate" : "Low (Serene)";
                      setEditingActivity({
                        ...editingActivity,
                        data: { ...editingActivity.data, crowdScore: score, crowdLevel: level }
                      });
                    }}
                    className="w-full accent-[#172536] mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Description & Details</label>
                <textarea
                  rows="3"
                  value={editingActivity.data.description}
                  onChange={(e) => setEditingActivity({
                    ...editingActivity,
                    data: { ...editingActivity.data, description: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans text-xs focus:border-[#172536] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingActivity.data.tags}
                  onChange={(e) => setEditingActivity({
                    ...editingActivity,
                    data: { ...editingActivity.data, tags: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                  placeholder="Culture, Photography, Lake"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#E99A25]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {isAddingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E5E0D8] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#172536]" />
                <h3 className="font-serif font-bold text-lg text-[#172536]">Add Activity (Day {currentDay.dayNumber})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingActivity(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shikara Ride on Dal Lake at Sunset"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] font-sans font-medium text-sm focus:border-[#172536] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newActivity.slot}
                    onChange={(e) => setNewActivity({ ...newActivity, slot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                  >
                    {SLOT_PRESETS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Nature">Nature</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Estimated Cost</label>
                  <input
                    type="text"
                    value={newActivity.estCost}
                    onChange={(e) => setNewActivity({ ...newActivity, estCost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                    placeholder="₹500 per person"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Crowd Score ({newActivity.crowdScore}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={newActivity.crowdScore}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      const level = score > 75 ? "High (Peak)" : score > 45 ? "Moderate" : "Low (Serene)";
                      setNewActivity({ ...newActivity, crowdScore: score, crowdLevel: level });
                    }}
                    className="w-full accent-[#172536] mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Description & Highlights</label>
                <textarea
                  rows="3"
                  placeholder="Describe the experience, meeting location, or tips..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans text-xs focus:border-[#172536] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Scenic, Sunset, Lake"
                  value={newActivity.tags}
                  onChange={(e) => setNewActivity({ ...newActivity, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D8] font-sans font-medium text-xs focus:border-[#172536] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsAddingActivity(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172536] hover:bg-[#22354d] text-white font-sans font-medium text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E99A25]" />
                  <span>Add to Day {currentDay.dayNumber}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
