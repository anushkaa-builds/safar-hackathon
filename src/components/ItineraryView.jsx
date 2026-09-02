import React, { useState, useEffect } from "react";
import { 
  Calendar, MapPin, Clock, DollarSign, Users, ShieldAlert, Sparkles, 
  ArrowRightLeft, Hotel, Plane, Train, Bus, Download, Share2, CheckCircle2, ChevronRight, Check, ArrowRight
} from "lucide-react";
import { getTravelAndStayOptions } from "../services/itineraryGenerator";

export default function ItineraryView({ itinerary, onRegenerate, onOpenSOS }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activePlan, setActivePlan] = useState(itinerary);
  const [isFinalized, setIsFinalized] = useState(itinerary?.isFinalized ?? false);
  const [swapToast, setSwapToast] = useState("");
  const [transitTab, setTransitTab] = useState("flight");

  useEffect(() => {
    if (itinerary) {
      setActivePlan(itinerary);
      setIsFinalized(itinerary.isFinalized ?? false);
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

  const currentDay = activePlan.days[selectedDayIndex] || activePlan.days[0];
  const dest = activePlan.destination;

  // Fallbacks for options if not directly attached
  const travelOptions = activePlan.availableTravelOptions || getTravelAndStayOptions(dest.name, activePlan.city || "Delhi");
  const currentSelectedTravel = activePlan.selectedTravel || travelOptions.flights[0] || travelOptions.trains[0];
  const currentSelectedStay = activePlan.selectedStay || activePlan.stayRecommendation || travelOptions.stays[0];

  // Switch travel option directly
  function handleSelectTravel(opt) {
    const updated = { ...activePlan };
    updated.selectedTravel = opt;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].slot = `Morning (${opt.departureTime} - 12:30 PM)`;
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${opt.provider || opt.mode} & Check-in at ${currentSelectedStay.name}`;
        day1.activities[0].estCost = `${opt.price} (Included)`;
        day1.activities[0].description = `Depart at ${opt.departureTime} (${opt.route}). Arrive, transfer to ${currentSelectedStay.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setSwapToast(`✅ Travel updated to: ${opt.provider || opt.mode} (${opt.timing}, ${opt.price})`);
    setTimeout(() => setSwapToast(""), 3500);
  }

  // Switch stay option directly
  function handleSelectStay(stayOpt) {
    const updated = { ...activePlan };
    updated.selectedStay = stayOpt;
    updated.stayRecommendation = stayOpt;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${currentSelectedTravel.provider || currentSelectedTravel.mode} & Check-in at ${stayOpt.name}`;
        day1.activities[0].description = `Depart at ${currentSelectedTravel.departureTime} (${currentSelectedTravel.route}). Arrive, transfer to ${stayOpt.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setSwapToast(`✅ Accommodation updated to: ${stayOpt.name} (${stayOpt.price})`);
    setTimeout(() => setSwapToast(""), 3500);
  }

  // Finalize itinerary generation
  function handleFinalizeItinerary() {
    const updated = { ...activePlan };
    updated.isFinalized = true;
    updated.selectedTravel = currentSelectedTravel;
    updated.selectedStay = currentSelectedStay;
    if (updated.days && updated.days.length > 0) {
      const day1 = updated.days[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities[0].slot = `Morning (${currentSelectedTravel.departureTime} - 12:30 PM)`;
        day1.activities[0].title = `Departure from ${updated.city || "Origin"} via ${currentSelectedTravel.provider || currentSelectedTravel.mode} & Check-in at ${currentSelectedStay.name}`;
        day1.activities[0].estCost = `${currentSelectedTravel.price} (Included)`;
        day1.activities[0].description = `Depart at ${currentSelectedTravel.departureTime} (${currentSelectedTravel.route}). Arrive, transfer to ${currentSelectedStay.name}, settle in, and acclimatize with local refreshments.`;
      }
    }
    setActivePlan(updated);
    setIsFinalized(true);
    setSwapToast(`🎉 Final Itinerary Generated with ${currentSelectedTravel.provider || currentSelectedTravel.mode} & ${currentSelectedStay.name}!`);
    setTimeout(() => setSwapToast(""), 4500);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Swap overcrowded activity with offbeat serene alternative
  function handleSwap(dayIndex, activityId) {
    const updatedDays = [...activePlan.days];
    const activity = updatedDays[dayIndex].activities.find(a => a.id === activityId);
    
    if (activity && activity.offbeatAlternative) {
      const alt = activity.offbeatAlternative;
      activity.title = alt.name + " (✨ Sustainable Offbeat Gem)";
      activity.description = alt.tagline + ". " + alt.benefit;
      activity.crowdScore = alt.crowdScore || 25;
      activity.crowdLevel = "Low (Serene)";
      activity.isSwapped = true;

      setActivePlan({ ...activePlan, days: updatedDays });
      setSwapToast("✅ Swapped to serene offbeat gem: " + alt.name + "! Crowd reduced by ~70%.");
      setTimeout(() => setSwapToast(""), 4500);
    }
  }

  function handlePrint() {
    window.print();
  }

  // Renders the Travel and Stay selection cards
  const renderTravelAndStaySelection = (isAtTop = false) => (
    <div className={`rounded-3xl border-2 p-6 sm:p-8 space-y-6 shadow-xl ${
      isAtTop 
        ? "bg-gradient-to-br from-blue-50/70 via-white to-amber-50/70 border-blue-300 ring-2 ring-blue-400/20 animate-fade-in" 
        : "bg-white border-slate-200"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️🏨</span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {isAtTop ? "Step 2: Choose Travel & Stay Preferences" : "Modify / Switch Travel & Accommodation"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isAtTop ? `Select Your Travel & Stay for ${dest.name}` : "Travel & Accommodation Options"}
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            {isAtTop 
              ? "Pick your preferred flight/train and hotel below to generate your final optimized daily schedule."
              : "Review or switch your selected flight, train, or hotel anytime. Changes will update your schedule in real time."}
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
        {/* Multimodal Transit Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                ✈️
              </div>
              <h3 className="font-black text-slate-900 text-base">Travel & Transit Selection</h3>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-black">
              <button
                type="button"
                onClick={() => setTransitTab("flight")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  transitTab === "flight" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Flights ({travelOptions.flights.length})
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("train")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  transitTab === "train" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Trains ({travelOptions.trains.length})
              </button>
              <button
                type="button"
                onClick={() => setTransitTab("bus")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  transitTab === "bus" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
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
                  onClick={() => handleSelectTravel(opt)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2.5 ${
                    isSelected 
                      ? "bg-blue-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40" 
                      : "bg-white border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-slate-900 block">{opt.provider || opt.mode}</span>
                      <span className="text-xs text-slate-600 font-semibold">{opt.timing} • {opt.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-800 block">{opt.price}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTravel(opt);
                        }}
                        className={`mt-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300"
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          "Select"
                        )}
                      </button>
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Accommodation Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm">
              🏨
            </div>
            <h3 className="font-black text-slate-900 text-base">Accommodation & Stay Selection</h3>
          </div>

          <div className="space-y-3">
            {travelOptions.stays.map((stay) => {
              const isSelected = currentSelectedStay?.id === stay.id;
              return (
                <div 
                  key={stay.id} 
                  onClick={() => handleSelectStay(stay)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2.5 ${
                    isSelected 
                      ? "bg-amber-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40" 
                      : "bg-white border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                        {stay.type}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-1">{stay.name}</h4>
                      <p className="text-xs text-emerald-800 font-bold mt-0.5">{stay.price}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 block mb-1.5">
                        ⭐ {stay.rating}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStay(stay);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300"
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          "Select"
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1">{stay.description}</p>
                </div>
              );
            })}
          </div>

          {/* Budget Breakdown Summary */}
          <div className="pt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <h4 className="font-black text-[11px] text-slate-900 mb-1.5">Trip Budget Allocation:</h4>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-bold">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-900">
                <span>Stays (40%)</span>
                <p className="font-black text-[10px]">₹{activePlan.budgetBreakdown?.stay?.toLocaleString() || "10,000"}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900">
                <span>Transit (25%)</span>
                <p className="font-black text-[10px]">₹{activePlan.budgetBreakdown?.transit?.toLocaleString() || "6,250"}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
                <span>Visits (25%)</span>
                <p className="font-black text-[10px]">₹{activePlan.budgetBreakdown?.activities?.toLocaleString() || "6,250"}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-200 text-slate-800">
                <span>Buffer (10%)</span>
                <p className="font-black text-[10px]">₹{activePlan.budgetBreakdown?.buffer?.toLocaleString() || "2,500"}</p>
              </div>
            </div>
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
      {/* 🚀 1. IF NOT FINALIZED: SHOW TRAVEL & STAY SELECTION AT THE VERY TOP */}
      {!isFinalized && renderTravelAndStaySelection(true)}

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url(${dest.image})` }}
        />
        <div className="relative p-6 sm:p-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                {isFinalized ? "Final Itinerary" : "Draft Plan Preview"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs">
                {dest.category} Circuit
              </span>
              <span className="text-xs text-slate-300">Generated: {activePlan.generatedAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center gap-1.5 backdrop-blur-sm transition"
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
              <span className="font-black text-base text-white">{activePlan.duration} Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Budget per Person</span>
              <span className="font-black text-base text-emerald-300">₹{activePlan.budgetPerPerson.toLocaleString()}</span>
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
            <span className="font-black text-sm text-emerald-800 bg-white border border-blue-200 px-2.5 py-1 rounded-xl shadow-sm">
              {currentSelectedTravel.price}
            </span>
          </div>
          <div className="text-xs text-slate-700 font-semibold space-y-0.5 pt-1">
            <p className="text-slate-900 font-bold">Route: {currentSelectedTravel.route}</p>
            <p className="text-slate-600">Schedule: {currentSelectedTravel.timing} • {currentSelectedTravel.duration}</p>
            <p className="text-slate-500 text-[11px]">{currentSelectedTravel.cabinClass || currentSelectedTravel.stops}</p>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Integrated in Day 1 Departure
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {currentSelectedTravel.carbonScore || "Eco-Friendly"}
            </span>
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
            <p className="text-slate-600 text-[11px] line-clamp-1">{currentSelectedStay.description}</p>
            <p className="text-slate-500 text-[10px]">Tier: {currentSelectedStay.type}</p>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Integrated in Day 1 Check-in
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Confirmed Stay
            </span>
          </div>
        </div>
      </div>

      {/* Swap Success Toast */}
      {swapToast && (
        <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black text-sm flex items-center justify-between shadow-lg animate-fade-in">
          <span>{swapToast}</span>
          <button onClick={() => setSwapToast("")} className="text-emerald-800 font-bold px-2">✕</button>
        </div>
      )}

      {/* Health & Medical Advisory Notice (if user entered any) */}
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

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {activePlan.days.map((day, idx) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shrink-0 transition-all flex items-center gap-2 ${
              selectedDayIndex === idx
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105"
                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Day {day.dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Current Day Schedule */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Day Schedule</span>
            <h2 className="text-2xl font-black text-slate-900">{currentDay.title}</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            {currentDay.activities.length} Activities Planned
          </span>
        </div>

        {/* Activity Cards */}
        <div className="space-y-4">
          {currentDay.activities.map((act) => {
            const isCrowded = act.crowdScore > 75;
            return (
              <div 
                key={act.id} 
                className={`p-5 sm:p-6 rounded-2xl border-2 transition ${
                  act.isSwapped 
                    ? "bg-teal-50/50 border-teal-300 shadow-md"
                    : isCrowded 
                    ? "bg-rose-50/30 border-rose-200" 
                    : "bg-slate-50/60 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
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
                    <span className={`px-2.5 py-1 rounded-lg ${
                      act.crowdScore > 80 ? "bg-rose-100 text-rose-800" : act.crowdScore > 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {act.crowdScore}% ({act.crowdLevel})
                    </span>
                  </div>
                </div>

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
      </div>

      {/* 🚀 2. AFTER GENERATION / WHEN FINALIZED: MOVE TRAVEL & STAY SELECTION TO THE BOTTOM */}
      {isFinalized && renderTravelAndStaySelection(false)}
    </div>
  );
}