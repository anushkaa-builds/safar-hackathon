import React, { useState } from "react";
import { 
  Calendar, MapPin, Clock, DollarSign, Users, ShieldAlert, Sparkles, 
  ArrowRightLeft, Hotel, Plane, Train, Bus, Download, Share2, CheckCircle2, ChevronRight
} from "lucide-react";

export default function ItineraryView({ itinerary, onRegenerate, onOpenSOS }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activePlan, setActivePlan] = useState(itinerary);
  const [swapToast, setSwapToast] = useState("");

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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
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
                AI-Optimized Route
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
              <span className="text-white/70 block">Travel Party</span>
              <span className="font-black text-base text-white capitalize">{activePlan.travelType} ({activePlan.groupSize} {activePlan.groupSize === 1 ? "Person" : "People"})</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-white/70 block">Altitude & GIS Risk</span>
              <span className="font-black text-base text-amber-300">{dest.altitudeUnit}</span>
            </div>
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

      {/* Multimodal Transport & Stays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multimodal Transit Breakdown */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
              🚆
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Multimodal Transportation</h3>
              <p className="text-xs text-slate-500 font-semibold">Origin & intra-city connectivity</p>
            </div>
          </div>

          <div className="space-y-3">
            {activePlan.transitModes.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{t.mode}</span>
                  <span className="font-black text-xs text-emerald-700">{t.estCost}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{t.details} • {t.duration}</p>
                <div className="flex gap-1.5">
                  {t.tags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stay & Hotel Recommendations */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
              🏨
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Recommended Stay</h3>
              <p className="text-xs text-slate-500 font-semibold">Matched to your ₹{activePlan.budgetBreakdown.stay.toLocaleString()} stay budget</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                  {activePlan.stayRecommendation.type}
                </span>
                <h4 className="font-black text-base text-slate-900 mt-1">{activePlan.stayRecommendation.name}</h4>
              </div>
              <span className="text-xs font-black text-amber-900 bg-white px-2.5 py-1 rounded-lg shadow-sm">
                ⭐ {activePlan.stayRecommendation.rating}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700">Price: {activePlan.stayRecommendation.price}</p>
            <p className="text-[11px] text-slate-600 font-medium">Includes complimentary regional breakfast, sanitized rooms, and local mountain view.</p>
          </div>

          {/* Budget Breakdown Chart */}
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
        </div>
      </div>
    </div>
  );
}