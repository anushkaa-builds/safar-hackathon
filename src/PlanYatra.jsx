import { useState } from "react";
import { savePreferences } from "./services/preferences";
import { generateSmartItinerary } from "./services/itineraryGenerator";
import DestinationPicker from "./DestinationPicker";
import { Sparkles, MapPin, Compass, Calendar, DollarSign, Users, ArrowRight } from "lucide-react";

const interestOptions = [
  "🌸 Lakes & Valleys",
  "🏔️ Mountain Snow",
  "🏺 Handicrafts & Culture",
  "🍛 Authentic Cuisine",
  "🛶 Heritage Rides",
  "🥾 Nature Trekking",
  "🌊 Coastal Beaches",
  "🕉️ Spiritual Ghats"
];

function getOrCreateUserId() {
  let id = localStorage.getItem("safar_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("safar_user_id", id);
  }
  return id;
}

export default function PlanYatra({ onItineraryGenerated }) {
  const [name, setName] = useState("Atharva");
  const [age, setAge] = useState("21");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gender, setGender] = useState("Male");
  const [currentCity, setCurrentCity] = useState("Delhi");
  const [destination, setDestination] = useState("Kashmir");

  const [durationPreset, setDurationPreset] = useState(5);
  const [customDays, setCustomDays] = useState("");
  const [budget, setBudget] = useState(450);

  const [selectedInterests, setSelectedInterests] = useState(["🌸 Lakes & Valleys", "🏔️ Mountain Snow"]);
  const [customInterest, setCustomInterest] = useState("");

  const [departDate, setDepartDate] = useState("2026-10-15");
  const [travelType, setTravelType] = useState("solo");
  const [groupSize, setGroupSize] = useState(1);

  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function toggleInterest(tag) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleDurationPreset(days) {
    setDurationPreset(days);
    setCustomDays("");
  }

  function handlePreFill(presetName) {
    if (presetName === "kashmir") {
      setName("Atharva");
      setDestination("Kashmir");
      setDurationPreset(5);
      setBudget(450);
      setSelectedInterests(["🌸 Lakes & Valleys", "🏔️ Mountain Snow"]);
      setTravelType("solo");
    } else if (presetName === "manali") {
      setName("Priya & Friends");
      setDestination("Manali");
      setDurationPreset(4);
      setBudget(350);
      setSelectedInterests(["🏔️ Mountain Snow", "🥾 Nature Trekking"]);
      setTravelType("group");
      setGroupSize(3);
    } else if (presetName === "goa") {
      setName("Rahul");
      setDestination("Goa");
      setDurationPreset(3);
      setBudget(300);
      setSelectedInterests(["🌊 Coastal Beaches", "🍛 Authentic Cuisine"]);
      setTravelType("solo");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Synthesizing AI Itinerary & Checking GIS Risk...");
    setIsGenerating(true);

    const finalHolidays = customDays ? Number(customDays) : durationPreset;

    const customInterestsList = customInterest
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalInterests = [...selectedInterests, ...customInterestsList];
    const userId = getOrCreateUserId();

    const data = {
      name,
      age: Number(age),
      gender,
      city: currentCity,
      destination,
      holidays: finalHolidays,
      budget,
      interests: finalInterests,
      departDate,
      travelType,
      groupSize: travelType === "group" ? Number(groupSize) : 1,
    };

    await savePreferences(userId, data);
    const itinerary = generateSmartItinerary(data);

    setIsGenerating(false);
    setStatus("✅ Plan ready! Redirecting to My Itinerary...");

    if (onItineraryGenerated) {
      setTimeout(() => {
        onItineraryGenerated(itinerary);
      }, 500);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
      >
        {/* Header & Preset Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">SIH 2026 • AI Engine</span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Plan Your Yatra</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
              <span className="text-slate-500 pl-2">Demo Presets:</span>
              <button type="button" onClick={() => handlePreFill("kashmir")} className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 shadow-sm">
                Kashmir 5D
              </button>
              <button type="button" onClick={() => handlePreFill("manali")} className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 shadow-sm">
                Manali 4D
              </button>
              <button type="button" onClick={() => handlePreFill("goa")} className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 shadow-sm">
                Goa 3D
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
            Fill in your travel preferences to generate a multimodal, crowd-optimized itinerary with real-time hazard detection.
          </p>
        </div>

        {/* Name / Age / Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Yatri Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm font-semibold"
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm font-semibold"
              placeholder="e.g. 21"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Gender</label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={
                    gender === g
                      ? "flex-1 py-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-xs shadow-sm"
                      : "flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:border-slate-300 text-xs"
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current City / Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Destination Circuit</label>
            <div className="relative">
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onClick={() => setPickerOpen(true)}
                className="w-full bg-slate-50 border-2 border-slate-300 shadow-sm rounded-2xl px-4 py-3 text-sm font-semibold cursor-pointer pr-14"
                placeholder="Click to choose a destination"
                required
              />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="absolute right-2.5 top-2.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] shadow-sm"
              >
                BROWSE
              </button>
            </div>
            <DestinationPicker
              isOpen={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onSelect={(destName) => setDestination(destName)}
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Origin City (Where you live)</label>
            <input
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm font-semibold"
              placeholder="e.g. Delhi, Mumbai, Bengaluru"
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="block font-black text-slate-900 text-sm sm:text-base">Trip Duration</label>
          <div className="grid grid-cols-4 gap-3">
            {[3, 5, 7, 10].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => handleDurationPreset(d)}
                className={
                  durationPreset === d && !customDays
                    ? "py-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-sm shadow-sm"
                    : "py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:border-slate-300 text-sm"
                }
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex justify-between items-center">
            <label className="font-black text-slate-900 text-sm sm:text-base">Estimated Total Budget</label>
            <span className="font-black text-emerald-800 text-base sm:text-lg">
              ₹{(budget * 83).toLocaleString()} (${budget} USD)
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="1500"
            step="50"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <p className="text-[11px] text-slate-600 font-bold">
            💡 Auto-divided: Stays (40%), Multimodal Transit (25%), Activities & Food (25%), Buffer (10%).
          </p>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="block font-black text-slate-900 text-sm sm:text-base">Travel Interests & Style</label>
          <div className="flex flex-wrap gap-2.5">
            {interestOptions.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleInterest(tag)}
                className={
                  selectedInterests.includes(tag)
                    ? "px-4 py-2.5 rounded-2xl font-black bg-teal-600 text-white text-xs sm:text-sm shadow-md"
                    : "px-4 py-2.5 rounded-2xl font-bold bg-slate-100 text-slate-700 border-2 border-slate-200 text-xs sm:text-sm hover:border-slate-300"
                }
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Custom interests (e.g. Scuba diving, Monastery meditation, Photography)"
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold"
          />
        </div>

        {/* Departure & Party Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Departure Date</label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm">Party Type</label>
            <div className="flex gap-2">
              {["solo", "group"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTravelType(t)}
                  className={
                    travelType === t
                      ? "flex-1 py-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-sm capitalize shadow-sm"
                      : "flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:border-slate-300 text-sm capitalize"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            {travelType === "group" && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-500 font-bold">Group Size:</span>
                <input
                  type="number"
                  min="2"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="w-20 bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            {isGenerating ? (
              <span>⚡ Synthesizing AI Multimodal Plan...</span>
            ) : (
              <>
                <span>Generate Optimized Yatra Plan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {status && <p className="text-center font-bold text-xs text-slate-700">{status}</p>}
      </form>
    </div>
  );
}