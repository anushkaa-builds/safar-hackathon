import { useState } from "react";
import { savePreferences } from "./services/preferences";
import { generateSmartItinerary } from "./services/itineraryGenerator";
import DestinationPicker from "./DestinationPicker";
import { Sparkles, MapPin, Compass, Calendar, Clock, HeartPulse, DollarSign, Users, ArrowRight, ExternalLink } from "lucide-react";

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

const medicalIssueOptions = [
  "None (Fit to travel)",
  "🫁 Asthma / Breathing difficulty",
  "❤️ High BP / Cardiac condition",
  "🤢 Motion / Mountain sickness (AMS)",
  "🩹 Diabetes / Dietary restriction",
  "👵 Senior citizen / Mobility assist"
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
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gender, setGender] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [destination, setDestination] = useState("");

  const [durationPreset, setDurationPreset] = useState(null);
  const [customDays, setCustomDays] = useState("");
  const [budget, setBudget] = useState(0); // USD equivalent (~37,350 INR)

  const [selectedInterests, setSelectedInterests] = useState([""]);
  const [customInterest, setCustomInterest] = useState("");

  const [departDate, setDepartDate] = useState("0000-00-00");
  const [departTime, setDepartTime] = useState("08:00");

  const [selectedMedicalIssues, setSelectedMedicalIssues] = useState(["None (Fit to travel)"]);
  const [customMedicalInfo, setCustomMedicalInfo] = useState("");

  const [travelType, setTravelType] = useState("solo");
  const [groupSize, setGroupSize] = useState(1);

  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function toggleInterest(tag) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleMedicalIssue(issue) {
    if (issue === "None (Fit to travel)") {
      setSelectedMedicalIssues(["None (Fit to travel)"]);
      return;
    }
    setSelectedMedicalIssues((prev) => {
      const filtered = prev.filter(i => i !== "None (Fit to travel)");
      return filtered.includes(issue) ? filtered.filter(i => i !== issue) : [...filtered, issue];
    });
  }

  function handleDurationPreset(days) {
    setDurationPreset(days);
    setCustomDays(String(days));
  }

  function handleCustomDaysChange(val) {
    setCustomDays(val);
    const num = Number(val);
    if ([3, 5, 7, 10].includes(num)) {
      setDurationPreset(num);
    } else {
      setDurationPreset(0);
    }
  }

  function handleBudgetChange(inrValue) {
    const usd = Math.round(Number(inrValue) / 83);
    setBudget(usd > 0 ? usd : 100);
  }

  function handlePreFill(presetName) {
    if (presetName === "kashmir") {
      setName("Anushka Yadav");
      setAge(20);
      setGender("Female");
      setCurrentCity("Delhi");
      setDestination("Kashmir");
      handleDurationPreset(5);
      setBudget(5000);
      setSelectedInterests(["🌸 Lakes & Valleys", "🏔️ Mountain Snow"]);
      setTravelType("solo");
      setDepartTime("07:30");
      setSelectedMedicalIssues(["None (Fit to travel)"]);
    } else if (presetName === "manali") {
      setName("Nehal & Friends");
      setDestination("Manali");
      handleDurationPreset(4);
      setBudget(15000);
      setSelectedInterests(["🏔️ Mountain Snow", "🥾 Nature Trekking"]);
      setTravelType("group");
      setGroupSize(3);
      setDepartTime("06:00");
      setSelectedMedicalIssues(["🤢 Motion / Mountain sickness (AMS)"]);
    } else if (presetName === "goa") {
      setName("Vaibhavi");
      setDestination("Goa");
      handleDurationPreset(3);
      setBudget(3000);
      setSelectedInterests(["🌊 Coastal Beaches", "🍛 Authentic Cuisine"]);
      setTravelType("solo");
      setDepartTime("09:00");
      setSelectedMedicalIssues(["None (Fit to travel)"]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Synthesizing AI Itinerary & Checking GIS Risk...");
    setIsGenerating(true);

    const finalHolidays = Number(customDays) || durationPreset || 3;

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
      departTime,
      medicalIssues: selectedMedicalIssues,
      customMedicalInfo,
      travelType,
      groupSize: travelType === "group" ? Number(groupSize) : 3,
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

  const budgetInr = Math.round(budget * 83);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination || "India")}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination || "India")}`;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
      >
        {/* Header & Quick Preset Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Intelligent Tourism Planner</span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Plan Your Yatra</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
              <span className="text-slate-500 pl-2">Quick Presets:</span>
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

        {/* Destination (With Google Maps connection) & Origin City */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-black text-slate-900 text-sm">Destination</label>
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> View on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm font-semibold pr-24"
                  placeholder="Type any place (e.g. Manali, Ooty, Kashmir...)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition"
                >
                  BROWSE
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                ✨ You can type any city/region manually or click BROWSE to select from popular circuits.
              </p>
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

          {/* Interactive Google Maps Preview */}
          {destination && (
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100 relative h-48 sm:h-56">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapsEmbedUrl}
                className="w-full h-full"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Google Maps Location: {destination}</span>
              </div>
            </div>
          )}
        </div>

        {/* Trip Duration (Presets + Direct Manual Days Fill Box) */}
        <div className="space-y-3">
          <label className="block font-black text-slate-900 text-sm sm:text-base">Trip Duration</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[3, 5, 7, 10].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => handleDurationPreset(d)}
                className={
                  Number(customDays) === d
                    ? "py-3 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-sm shadow-sm"
                    : "py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:border-slate-300 text-sm"
                }
              >
                {d} Days
              </button>
            ))}
            {/* Direct manual fill box for days */}
            <div className="col-span-2 sm:col-span-1 relative">
              <input
                type="number"
                min="1"
                max="30"
                value={customDays}
                onChange={(e) => handleCustomDaysChange(e.target.value)}
                placeholder="Custom"
                className="w-full h-full py-3 px-3 bg-slate-50 border-2 border-emerald-500 rounded-2xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
              />
              <span className="text-[10px] font-black text-slate-500 absolute right-2 top-3 pointer-events-none">Days</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-bold">
            💡 Click a preset above or manually type exact days in the box.
          </p>
        </div>

        {/* Estimated Total Budget (Slider + Direct Manual Amount Fill Box) */}
        <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <label className="font-black text-slate-900 text-sm sm:text-base block">Estimated Total Budget</label>
              <span className="text-[11px] text-slate-600 font-semibold">Adjust slider or type your exact amount below</span>
            </div>
            {/* Direct Manual Fill Box for Budget */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border-2 border-emerald-500 shadow-sm">
              <span className="font-black text-emerald-800 text-sm">₹</span>
              <input
                type="number"
                min="0"
                max="500000"
                step="any"
                value={budget === 0 ? "" : budget}
                placeholder="Enter Budget in INR"
                onChange={(e) => { const value = e.target.value; setBudget(value === "" ? 0 : Number(value));}}
                className="w-28 text-slate-900 font-black text-sm sm:text-base focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-500">({budget})</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="500000"
            step="500"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-1">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-950">
              <span>Stays (40%)</span>
              <p className="font-black">₹{Math.round(budgetInr * 0.4).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-950">
              <span>Transit (25%)</span>
              <p className="font-black">₹{Math.round(budgetInr * 0.25).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-950">
              <span>Sightseeing (25%)</span>
              <p className="font-black">₹{Math.round(budgetInr * 0.25).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <span>Buffer (10%)</span>
              <p className="font-black">₹{Math.round(budgetInr * 0.1).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Departure Date & Departure Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Departure Date
            </label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> Departure Time
            </label>
            <input
              type="time"
              value={departTime}
              onChange={(e) => setDepartTime(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold"
              required
            />
          </div>
        </div>

        {/* Medical Issues & Health Conditions */}
        <div className="space-y-3 p-5 rounded-2xl bg-rose-50/40 border border-rose-200">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <div>
              <label className="block font-black text-slate-900 text-sm sm:text-base">Medical Issues & Health Safety</label>
              <p className="text-[11px] text-slate-600 font-semibold">The AI will adapt your altitude pacing, transit comfort, and emergency advisories</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {medicalIssueOptions.map((issue) => (
              <button
                type="button"
                key={issue}
                onClick={() => toggleMedicalIssue(issue)}
                className={
                  selectedMedicalIssues.includes(issue)
                    ? "px-3.5 py-2 rounded-2xl font-black bg-rose-600 text-white text-xs shadow-sm"
                    : "px-3.5 py-2 rounded-2xl font-bold bg-white text-slate-700 border border-slate-300 text-xs hover:border-rose-400"
                }
              >
                {issue}
              </button>
            ))}
          </div>

          <input
            value={customMedicalInfo}
            onChange={(e) => setCustomMedicalInfo(e.target.value)}
            placeholder="Specific medical condition, allergies, or medication details (optional)"
            className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-semibold"
          />
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

        {/* Party Type & Group Size */}
        <div className="space-y-3">
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