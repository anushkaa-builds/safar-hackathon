import React, { useState, useMemo, useEffect } from "react";
import { savePreferences } from "./services/preferences";
import { generateSmartItinerary, getTravelAndStayOptions } from "./services/itineraryGenerator";
import DestinationPicker from "./DestinationPicker";
import {
  MapPin, Calendar, Clock, HeartPulse, ArrowRight, ExternalLink,
  Users, Search, ShieldAlert, Sparkles, Check, ChevronRight,
  ArrowUpRight, Star, Compass, Bed, Navigation, Sun, Mountain,
  Trees, ShieldCheck, AlertTriangle, ArrowRightLeft, Info
} from "lucide-react";

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

const experienceCategories = [
  { id: "all", label: "All" },
  { id: "adventure", label: "Adventure" },
  { id: "nature", label: "Nature & Wildlife" },
  { id: "heritage", label: "Heritage & Culture" },
  { id: "coastal", label: "Beaches & Coastal" },
  { id: "desert", label: "Desert" },
  { id: "food", label: "Food Trails" }
];

const curatedExperiences = [
  {
    id: "exp-1",
    title: "Dawn Shikara Ride through Floating Flower Markets",
    location: "Dal Lake, Srinagar",
    category: "nature",
    duration: "2.5 Hours",
    cost: "₹800 / boat",
    crowd: "Low at dawn",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80",
    tag: "Must Experience"
  },
  {
    id: "exp-2",
    title: "Full-Moon Midnight Walk on the Great White Rann",
    location: "Dhordo, Kutch",
    category: "desert",
    duration: "3 Hours",
    cost: "₹150 permit",
    crowd: "Serene",
    image: "https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=800&q=80",
    tag: "Editorial Pick"
  },
  {
    id: "exp-3",
    title: "Himalayan Trout Stream Walk & GHNP Pine Trail",
    location: "Tirthan Valley, Himachal",
    category: "adventure",
    duration: "4 Hours",
    cost: "₹100 permit",
    crowd: "Very Low",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    tag: "Offbeat Gem"
  },
  {
    id: "exp-4",
    title: "Subah-e-Banaras Morning Raga & Sunrise Boat",
    location: "Assi Ghat, Varanasi",
    category: "heritage",
    duration: "2 Hours",
    cost: "Free / ₹300 boat",
    crowd: "Peaceful",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    tag: "Cultural Legacy"
  },
  {
    id: "exp-5",
    title: "Secret Backwater Kayaking through Mangrove Canals",
    location: "Munroe Island, Kerala",
    category: "coastal",
    duration: "3.5 Hours",
    cost: "₹1,000 / person",
    crowd: "Untouched",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    tag: "Nature Pick"
  },
  {
    id: "exp-6",
    title: "Old Delhi Bazaars & Century-Old Street Food Walk",
    location: "Chandni Chowk, Delhi",
    category: "food",
    duration: "3 Hours",
    cost: "₹600 approx.",
    crowd: "Lively",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    tag: "Culinary Walk"
  }
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

  const [durationPreset, setDurationPreset] = useState(5);
  const [customDays, setCustomDays] = useState("5");
  const [budget, setBudget] = useState(25000);

  const [selectedInterests, setSelectedInterests] = useState([" "]);
  const [customInterest, setCustomInterest] = useState("");

  const [departDate, setDepartDate] = useState("");
  const [departTime, setDepartTime] = useState("");

  const [selectedMedicalIssues, setSelectedMedicalIssues] = useState(["None (Fit to travel)"]);
  const [customMedicalInfo, setCustomMedicalInfo] = useState("");

  const [travelType, setTravelType] = useState("solo");
  const [groupSize, setGroupSize] = useState(1);

  // Selected options state
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);

  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Active filter for Experiences section
  const [activeExpCategory, setActiveExpCategory] = useState("all");

  // Compute available travel and stays based on destination & origin
  const availableOptions = useMemo(() => {
    return getTravelAndStayOptions(destination || "Kashmir", currentCity || "Delhi");
  }, [destination, currentCity]);

  useEffect(() => {
    if (
      !selectedTravel ||
      (!availableOptions.flights.some((f) => f.id === selectedTravel.id) &&
        !availableOptions.trains.some((t) => t.id === selectedTravel.id) &&
        !availableOptions.buses.some((b) => b.id === selectedTravel.id))
    ) {
      setSelectedTravel(availableOptions.flights[0] || availableOptions.trains[0]);
    }
    if (!selectedStay || !availableOptions.stays.some((s) => s.id === selectedStay.id)) {
      if (budget > 70000) setSelectedStay(availableOptions.stays[2]);
      else if (budget > 35000) setSelectedStay(availableOptions.stays[1]);
      else setSelectedStay(availableOptions.stays[0]);
    }
  }, [availableOptions, budget]);

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
      const filtered = prev.filter((i) => i !== "None (Fit to travel)");
      return filtered.includes(issue) ? filtered.filter((i) => i !== issue) : [...filtered, issue];
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

  function handlePreFill(presetName) {
    if (presetName === "kashmir") {
      setName("Anushka Yadav");
      setAge(21);
      setGender("Female");
      setCurrentCity("Delhi");
      setDestination("Kashmir");
      handleDurationPreset(5);
      setBudget(35000);
      setSelectedInterests(["🌸 Lakes & Valleys", "🏔️ Mountain Snow"]);
      setTravelType("solo");
      setDepartTime("08:00");
      setSelectedMedicalIssues(["None (Fit to travel)"]);
      const opts = getTravelAndStayOptions("Kashmir", "Delhi");
      setSelectedTravel(opts.flights[0]);
      setSelectedStay(opts.stays[1]);
    } else if (presetName === "manali") {
      setName("Nehal & Friends");
      setAge(23);
      setGender("Male");
      setCurrentCity("Delhi");
      setDestination("Manali");
      handleDurationPreset(4);
      setBudget(25000);
      setSelectedInterests(["🏔️ Mountain Snow", "🥾 Nature Trekking"]);
      setTravelType("group");
      setGroupSize(3);
      setDepartTime("06:00");
      setSelectedMedicalIssues(["🤢 Motion / Mountain sickness (AMS)"]);
      const opts = getTravelAndStayOptions("Manali", "Delhi");
      setSelectedTravel(opts.trains[0]);
      setSelectedStay(opts.stays[0]);
    } else if (presetName === "goa") {
      setName("Vaibhavi");
      setAge(22);
      setGender("Female");
      setCurrentCity("Mumbai");
      setDestination("Goa");
      handleDurationPreset(3);
      setBudget(18000);
      setSelectedInterests(["🌊 Coastal Beaches", "🍛 Authentic Cuisine"]);
      setTravelType("solo");
      setDepartTime("09:00");
      setSelectedMedicalIssues(["None (Fit to travel)"]);
      const opts = getTravelAndStayOptions("Goa", "Mumbai");
      setSelectedTravel(opts.trains[1]);
      setSelectedStay(opts.stays[1]);
    } else if (presetName === "kutch") {
      setName("Tanmay");
      setAge(25);
      setGender("Male");
      setCurrentCity("Ahmedabad");
      setDestination("Kutch");
      handleDurationPreset(3);
      setBudget(16000);
      setSelectedInterests(["🏺 Handicrafts & Culture", "🍛 Authentic Cuisine"]);
      setTravelType("solo");
      setDepartTime("07:30");
      setSelectedMedicalIssues(["None (Fit to travel)"]);
      const opts = getTravelAndStayOptions("Kutch", "Ahmedabad");
      setSelectedTravel(opts.buses[0] || opts.trains[0]);
      setSelectedStay(opts.stays[0]);
    }

    setTimeout(() => {
      const el = document.getElementById("plan-yatra-form");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleSelectDestinationDirect(destName) {
    setDestination(destName);
    const el = document.getElementById("plan-yatra-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Preparing personalized itinerary with vetted stays and transit...");
    setIsGenerating(true);

    const finalHolidays = Number(customDays) || durationPreset || 3;

    const customInterestsList = customInterest
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalInterests = [...selectedInterests, ...customInterestsList];
    const userId = getOrCreateUserId();

    const data = {
      name: name || "Yatri",
      age: Number(age) || 24,
      gender: gender || "Male",
      city: currentCity || "Delhi",
      destination: destination || "Kashmir",
      holidays: finalHolidays,
      budget: Number(budget) || 25000,
      interests: finalInterests,
      departDate,
      departTime: departTime || "08:00 AM",
      medicalIssues: selectedMedicalIssues,
      customMedicalInfo,
      travelType,
      groupSize: travelType === "group" ? Math.max(2, Number(groupSize) || 2) : 1,
      selectedTravel: selectedTravel || availableOptions.flights[0] || availableOptions.trains[0],
      selectedStay: selectedStay || availableOptions.stays[0],
    };

    await savePreferences(userId, data);
    const itinerary = generateSmartItinerary(data);
    itinerary.isFinalized = false;

    setIsGenerating(false);
    setStatus("✅ Itinerary prepared! Loading your trip view...");

    if (onItineraryGenerated) {
      setTimeout(() => {
        onItineraryGenerated(itinerary);
      }, 350);
    }
  }

  const budgetInr = Number(budget) || 0;
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination || "India")}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination || "India")}`;

  const filteredExperiences = activeExpCategory === "all"
    ? curatedExperiences
    : curatedExperiences.filter((e) => e.category === activeExpCategory);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1E293B]">
      {/* ============================================================ */}
      {/* 1. HOMEPAGE HERO (Section 5) */}
      {/* ============================================================ */}
      <section className="relative min-h-[78vh] lg:min-h-[82vh] flex flex-col justify-end px-4 sm:px-6 lg:px-12 pb-12 sm:pb-16 pt-8">
        {/* Background Image with Authentic Real Landscape */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2000&q=85"
            alt="Misty Himalayan Valley and Calm Lake"
            className="w-full h-full object-cover object-center filter brightness-[0.88]"
          />
          {/* Subtle dark gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#172536]/60 via-transparent to-transparent hidden lg:block" />
        </div>

        {/* Hero Content & Headline */}
        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#F7F5F0] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#E99A25]" />
              <span>Independent & Responsible Tourism</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.12] tracking-tight">
              Discover India, <br />
              <span className="italic font-serif font-light text-[#FAF8F5]">Beyond the Ordinary.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed max-w-xl">
              Routes, stays and local experiences — planned around your trip with real-time crowd and safety intelligence.
            </p>
          </div>

          {/* Floating Travel Search Panel (Section 5) */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-[#E5E0D8] max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Where are you going */}
              <div className="sm:col-span-5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E5E0D8]">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                  Where are you going?
                </label>
                <div className="relative flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-[#E99A25] shrink-0 mr-2" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Kashmir, Kutch, Manali, Kerala..."
                    className="w-full text-xs sm:text-sm font-semibold text-[#172536] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="text-[10px] font-bold text-[#2D5A46] hover:text-[#172536] ml-2 shrink-0 underline cursor-pointer"
                  >
                    Browse
                  </button>
                </div>
              </div>

              {/* When */}
              <div className="sm:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E5E0D8]">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                  When?
                </label>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-[#64748B] shrink-0 mr-2" />
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full text-xs font-semibold text-[#172536] focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Travellers */}
              <div className="sm:col-span-2 px-3 py-2">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                  Travellers
                </label>
                <div className="flex items-center mt-1">
                  <Users className="w-4 h-4 text-[#64748B] shrink-0 mr-2" />
                  <select
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    className="w-full text-xs font-semibold text-[#172536] focus:outline-none bg-transparent"
                  >
                    <option value="solo">Solo Yatri</option>
                    <option value="group">Small Group</option>
                  </select>
                </div>
              </div>

              {/* Explore CTA Button */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("plan-yatra-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#E99A25] hover:bg-[#D4881A] text-[#172536] font-bold text-xs sm:text-sm tracking-wide shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DESTINATION DISCOVERY — "Explore India's Hidden Gems" (Section 7) */}
      {/* ============================================================ */}
      <section id="hidden-gems-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E99A25]">
              Authentic Landscapes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172536] font-normal tracking-tight">
              Explore India’s Hidden Gems
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md">
            Uncrowded circuits, artisan settlements, and serene highland valleys with reliable local logistics.
          </p>
        </div>

        {/* Asymmetrical Editorial Image Layout (1 large + 2 small + 1 medium) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1 Large Destination: Kutch */}
          <div
            onClick={() => handleSelectDestinationDirect("Kutch")}
            className="md:col-span-7 group relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] shadow-sm cursor-pointer border border-[#E5E0D8]"
          >
            <img
              src="https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80"
              alt="Kutch White Desert Salt Flat at Sunset"
              className="absolute inset-0 w-full h-full object-cover img-editorial"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/30 to-transparent" />

            <div className="absolute top-5 left-5">
              <span className="px-3 py-1 rounded-full bg-white/90 text-[#172536] text-[11px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
                Featured Circuit
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
              <span className="text-xs font-semibold text-[#E99A25] uppercase tracking-wider">
                Gujarat · Desert & Culture
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">Kutch & White Desert</h3>
              <p className="text-xs text-slate-300 line-clamp-2 max-w-lg">
                Endless salt crust under full-moon skies, heritage Hodka bhungas, and master Rogan fabric craftsmen.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#E99A25] group-hover:translate-x-1 transition-transform">
                <span>Explore Circuit</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Column: 2 Stacked Smaller Destinations (Tirthan & Kashmir) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Tirthan Valley */}
            <div
              onClick={() => handleSelectDestinationDirect("Tirthan Valley")}
              className="group relative rounded-2xl overflow-hidden min-h-[220px] shadow-sm cursor-pointer border border-[#E5E0D8] flex-1"
            >
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Tirthan Valley Pine Forest & Trout River"
                className="absolute inset-0 w-full h-full object-cover img-editorial"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/25 to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#E99A25] uppercase tracking-wider">
                  Himachal Pradesh · Low Crowd Alternate
                </span>
                <h4 className="font-serif text-xl font-normal text-white">Tirthan Valley</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Riverside chalets & GHNP trails</span>
                  <span className="text-xs font-bold text-[#E99A25] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            </div>

            {/* Kashmir Alpine */}
            <div
              onClick={() => handleSelectDestinationDirect("Kashmir")}
              className="group relative rounded-2xl overflow-hidden min-h-[220px] shadow-sm cursor-pointer border border-[#E5E0D8] flex-1"
            >
              <img
                src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80"
                alt="Kashmir Alpine Valley"
                className="absolute inset-0 w-full h-full object-cover img-editorial"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/25 to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] font-bold text-[#E99A25] uppercase tracking-wider">
                  Jammu & Kashmir · High Valleys
                </span>
                <h4 className="font-serif text-xl font-normal text-white">Doodhpathri & Gulmarg</h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Rolling alpine pastures & cedar forests</span>
                  <span className="text-xs font-bold text-[#E99A25] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PLAN YOUR JOURNEY (Section 8) */}
      {/* ============================================================ */}
      <section className="bg-[#172536] text-[#F7F5F0] py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E99A25]">
              Platform Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
              Plan Your Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Four foundational tools engineered to make Indian travel dependable, transparent, and seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* STAY */}
            <div className="p-6 rounded-2xl bg-[#22344a]/60 border border-white/10 hover:border-[#E99A25]/50 transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E99A25]/20 text-[#E99A25] flex items-center justify-center font-bold">
                <Bed className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-normal text-white">STAY</h3>
                <span className="text-xs font-semibold text-[#E99A25] block">Hotels · Homestays · Camps</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vetted heritage havelis, family-run apple orchard cottages, and desert bhungas with transparent nightly tariffs.
              </p>
            </div>

            {/* TRAVEL */}
            <div className="p-6 rounded-2xl bg-[#22344a]/60 border border-white/10 hover:border-[#E99A25]/50 transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A46]/30 text-emerald-400 flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-normal text-white">TRAVEL</h3>
                <span className="text-xs font-semibold text-[#E99A25] block">Bus · Train · Flight · Taxi</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scheduled IRCTC trains, domestic flights, Volvo bus connections, and verified local tourist taxi union rates.
              </p>
            </div>

            {/* ROUTES */}
            <div className="p-6 rounded-2xl bg-[#22344a]/60 border border-white/10 hover:border-[#E99A25]/50 transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-normal text-white">ROUTES</h3>
                <span className="text-xs font-semibold text-[#E99A25] block">Passes · Highway Safety</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live road clearance updates, altitude elevation profiles, and scenic mountain detour recommendations.
              </p>
            </div>

            {/* ITINERARY */}
            <div className="p-6 rounded-2xl bg-[#22344a]/60 border border-white/10 hover:border-[#E99A25]/50 transition space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-normal text-white">ITINERARY</h3>
                <span className="text-xs font-semibold text-[#E99A25] block">Personalized & Dynamic</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Day-by-day itineraries that automatically adapt to altitude acclimation, health sensitivities, and pacing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CURATED TRIPS (Section 10) */}
      {/* ============================================================ */}
      <section id="curated-circuits-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E99A25]">
              Curated Circuits
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172536] font-normal tracking-tight">
              Curated For Your Journey
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md">
            Realistic roadtrips and circuits with estimated budgets, vetted homestays, and day-by-day activities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trip 1: Kutch */}
          <div className="editorial-card overflow-hidden flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=600&q=80"
                alt="Kutch Desert"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute top-3 left-3 bg-[#172536]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Days · ₹8,500 approx.
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center text-[#E99A25] text-xs gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E99A25]" />
                  ))}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#172536]">Kutch Desert Escape</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Bhuj heritage walk, Hodka village bhunga stay, sunset over Dhordo salt flats & Rogan art studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePreFill("kutch")}
                className="text-xs font-bold text-[#172536] group-hover:text-[#E99A25] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Customize Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Trip 2: Kashmir */}
          <div className="editorial-card overflow-hidden flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80"
                alt="Kashmir Valley"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute top-3 left-3 bg-[#172536]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                5 Days · ₹18,500 approx.
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center text-[#E99A25] text-xs gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E99A25]" />
                  ))}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#172536]">Kashmir Alpine & Lakes</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Dal Lake historic houseboat, Gulmarg snow meadows, and serene Doodhpathri pine river walk.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePreFill("kashmir")}
                className="text-xs font-bold text-[#172536] group-hover:text-[#E99A25] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Customize Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Trip 3: Manali & Tirthan */}
          <div className="editorial-card overflow-hidden flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="Manali Hills"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute top-3 left-3 bg-[#172536]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                4 Days · ₹12,000 approx.
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center text-[#E99A25] text-xs gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E99A25]" />
                  ))}
                  <Star className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#172536]">Old Manali & Tirthan</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Avoid high Rohtang crowds by staying in riverside Gushaini and hiking to Great Himalayan National Park.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePreFill("manali")}
                className="text-xs font-bold text-[#172536] group-hover:text-[#E99A25] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Customize Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Trip 4: Goa & Coastal */}
          <div className="editorial-card overflow-hidden flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80"
                alt="Goa Beach"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute top-3 left-3 bg-[#172536]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Days · ₹14,000 approx.
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center text-[#E99A25] text-xs gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#E99A25]" />
                  ))}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#172536]">South Goa & Heritage</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Quiet sands of Agonda & Cola beach, Latin Quarter heritage walk in Fontainhas, and Goan seafood.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePreFill("goa")}
                className="text-xs font-bold text-[#172536] group-hover:text-[#E99A25] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Customize Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EXPERIENCES (Section 11) */}
      {/* ============================================================ */}
      <section id="experiences-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5E0D8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E99A25]">
              Local Immersion
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172536] font-normal tracking-tight">
              Experiences Across India
            </h2>
          </div>

          {/* Compact Filter Controls (Section 11) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {experienceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveExpCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeExpCategory === cat.id
                    ? "bg-[#172536] text-white shadow-xs"
                    : "bg-white text-[#64748B] border border-[#E5E0D8] hover:border-[#CBD5E1]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visually Rich Experience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => (
            <div key={exp.id} className="editorial-card overflow-hidden group flex flex-col justify-between">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover img-editorial"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#172536] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {exp.tag}
                </span>
                <span className="absolute bottom-3 right-3 bg-[#172536]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {exp.duration}
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#E99A25]" />
                      {exp.location}
                    </span>
                    <span className="font-bold text-[#2D5A46]">{exp.crowd}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#172536] leading-snug">
                    {exp.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#172536]">{exp.cost}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDestination(exp.location.split(",")[1]?.trim() || exp.location);
                      const el = document.getElementById("plan-yatra-form");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="font-bold text-[#E99A25] hover:text-[#D4881A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Plan Trip</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SMART CROWD & ALTERNATIVE DESTINATIONS (Section 12 & 13) */}
      {/* ============================================================ */}
      <section className="bg-[#FAF8F5] py-16 border-t border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A46]">
              Crowd Intelligence
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172536] font-normal tracking-tight">
              Smart Crowd & Alternative Destinations
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              When popular spots experience severe surge, our recommendation engine pairs you with serene, authentic alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pair 1: Manali -> Tirthan / Jibhi */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-rose-700 uppercase">High Activity</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Himachal Circuit</span>
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-[#172536]">Manali & Rohtang</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  High vehicular congestion at Atal Tunnel north portal and crowded Solang valley viewpoints.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#2D5A46]/10 border border-[#2D5A46]/20 space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D5A46]">
                  <span>Instead consider:</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#172536]">Tirthan Valley & Jibhi</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 Low Crowd
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Riverside trout cabins, fresh cedar breeze, and 80% fewer tourist vehicles.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectDestinationDirect("Tirthan Valley")}
                  className="w-full mt-2 py-2 rounded-lg bg-[#2D5A46] text-white text-xs font-bold hover:bg-[#1f4031] transition cursor-pointer"
                >
                  Plan Tirthan Instead →
                </button>
              </div>
            </div>

            {/* Pair 2: Dal Lake -> Doodhpathri / Nigeen */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-700 uppercase">Moderate Surge</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Kashmir Circuit</span>
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-[#172536]">Dal Lake Evening</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  Peak boulevard traffic and long wait times for Shikaras along Ghats 1 to 7.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#2D5A46]/10 border border-[#2D5A46]/20 space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D5A46]">
                  <span>Instead consider:</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#172536]">Nigeen Lake & Doodhpathri</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 Serene
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Motor-free waters at Nigeen and rolling alpine meadow walks in Doodhpathri.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectDestinationDirect("Kashmir")}
                  className="w-full mt-2 py-2 rounded-lg bg-[#2D5A46] text-white text-xs font-bold hover:bg-[#1f4031] transition cursor-pointer"
                >
                  Plan Kashmir Route →
                </button>
              </div>
            </div>

            {/* Pair 3: North Goa -> South Goa */}
            <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-rose-700 uppercase">High Activity</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Goa Coast</span>
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-[#172536]">Baga & Calangute</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  Crowded beach shacks, packed parking, and noisy commercial motorized sports.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#2D5A46]/10 border border-[#2D5A46]/20 space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D5A46]">
                  <span>Instead consider:</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#172536]">Cola Beach & Agonda</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 Untouched
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Emerald lagoon sheltered by volcanic hills, quiet dolphin sightings, and peaceful huts.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectDestinationDirect("Goa")}
                  className="w-full mt-2 py-2 rounded-lg bg-[#2D5A46] text-white text-xs font-bold hover:bg-[#1f4031] transition cursor-pointer"
                >
                  Plan South Goa Route →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PRACTICAL TRIP PLANNER FORM (Section 8 & 25) */}
      {/* ============================================================ */}
      <section id="plan-yatra-form" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
        >
          {/* Header & Quick Presets */}
          <div className="space-y-3 pb-6 border-b border-[#E5E0D8]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#E99A25] tracking-wider">
                  Travel Planner
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#172536] tracking-tight">
                  Plan Your Yatra
                </h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl text-xs font-semibold border border-[#E5E0D8]">
                <span className="text-[#64748B] pl-2 text-[11px]">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handlePreFill("kashmir")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5E0D8]/40 text-[#172536] text-[11px] shadow-xs transition cursor-pointer"
                >
                  Kashmir 5D
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFill("kutch")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5E0D8]/40 text-[#172536] text-[11px] shadow-xs transition cursor-pointer"
                >
                  Kutch 3D
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFill("manali")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5E0D8]/40 text-[#172536] text-[11px] shadow-xs transition cursor-pointer"
                >
                  Manali 4D
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFill("goa")}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5E0D8]/40 text-[#172536] text-[11px] shadow-xs transition cursor-pointer"
                >
                  Goa 3D
                </button>
              </div>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Provide your trip details. In the next step on <strong>My Itinerary</strong>, you can compare transit schedules, review confirmed stay options, and adjust daily activities.
            </p>
          </div>

          {/* Traveler Details: Name, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
                Yatri Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition"
                placeholder="e.g. Anushka Yadav"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition"
                placeholder="e.g. 24"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
                Gender
              </label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      gender === g
                        ? "border-[#172536] bg-[#172536] text-white"
                        : "border-[#E5E0D8] bg-[#FAF8F5] text-[#172536] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Destination & Origin City */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
                    Destination
                  </label>
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-[#2D5A46] hover:text-[#172536] flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" /> Google Maps <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold pr-24 focus:outline-none transition"
                    placeholder="Type any place (e.g. Kashmir, Kutch, Manali, Goa...)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#172536] hover:bg-[#22344a] text-white font-semibold text-[11px] shadow-xs transition cursor-pointer"
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

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
                  Origin City (Where you reside)
                </label>
                <input
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition"
                  placeholder="e.g. Delhi, Mumbai, Bengaluru, Ahmedabad"
                  required
                />
              </div>
            </div>

            {/* Google Maps Preview */}
            {destination && (
              <div className="rounded-2xl overflow-hidden border border-[#E5E0D8] bg-[#FAF8F5] relative h-40 sm:h-48">
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
                <div className="absolute bottom-2 left-2 bg-[#172536]/90 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-3 h-3 text-[#E99A25]" />
                  <span>Preview: {destination}</span>
                </div>
              </div>
            )}
          </div>

          {/* Trip Duration */}
          <div className="space-y-2">
            <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
              Trip Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[3, 5, 7, 10].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleDurationPreset(d)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    Number(customDays) === d
                      ? "border-[#172536] bg-[#172536] text-white"
                      : "border-[#E5E0D8] bg-[#FAF8F5] text-[#172536] hover:border-[#CBD5E1]"
                  }`}
                >
                  {d} Days
                </button>
              ))}
              <div className="col-span-2 sm:col-span-1 relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={(e) => handleCustomDaysChange(e.target.value)}
                  placeholder="Custom"
                  className="w-full h-full py-2.5 px-2 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl text-xs font-semibold text-[#172536] text-center focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 absolute right-2 top-2.5 pointer-events-none">
                  Days
                </span>
              </div>
            </div>
          </div>

          {/* Estimated Total Budget */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <label className="font-semibold text-[#172536] text-xs uppercase tracking-wider block">
                  Estimated Total Budget (INR)
                </label>
                <span className="text-[11px] text-[#64748B]">
                  Slide or enter your target budget for transparent cost allocation
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#E5E0D8] shadow-2xs">
                <span className="font-bold text-[#172536] text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  max="500000"
                  value={budget}
                  placeholder="Budget"
                  onChange={(e) => {
                    const val = e.target.value;
                    setBudget(val === "" ? "" : Number(val));
                  }}
                  className="w-24 text-[#172536] font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="200000"
              step="500"
              value={Number(budget) || 0}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E99A25]"
            />

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
              <div className="p-2 rounded-lg bg-white border border-[#E5E0D8]">
                <span className="text-slate-500">Stays (40%)</span>
                <p className="font-bold text-[#172536]">₹{Math.round(budgetInr * 0.4).toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E5E0D8]">
                <span className="text-slate-500">Transit (25%)</span>
                <p className="font-bold text-[#172536]">₹{Math.round(budgetInr * 0.25).toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E5E0D8]">
                <span className="text-slate-500">Sightseeing (25%)</span>
                <p className="font-bold text-[#172536]">₹{Math.round(budgetInr * 0.25).toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#E5E0D8]">
                <span className="text-slate-500">Buffer (10%)</span>
                <p className="font-bold text-[#172536]">₹{Math.round(budgetInr * 0.1).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Departure Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#E99A25]" /> Departure Date
              </label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E99A25]" /> Departure Time
              </label>
              <input
                type="time"
                value={departTime}
                onChange={(e) => setDepartTime(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Medical Issues & Health Safety */}
          <div className="space-y-3 p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-700" />
              <div>
                <label className="block font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Health Considerations & Altitude Safety
                </label>
                <p className="text-[11px] text-slate-600">
                  The planner adjusts altitude staging, mountain pass pacing, and hospital helpline advisories
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {medicalIssueOptions.map((issue) => (
                <button
                  type="button"
                  key={issue}
                  onClick={() => toggleMedicalIssue(issue)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedMedicalIssues.includes(issue)
                      ? "bg-rose-700 text-white shadow-2xs font-semibold"
                      : "bg-white text-slate-700 border border-rose-200 hover:border-rose-300"
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>

            <input
              value={customMedicalInfo}
              onChange={(e) => setCustomMedicalInfo(e.target.value)}
              placeholder="Specific medical conditions, allergies, or physical restrictions (optional)"
              className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Travel Interests */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
              Travel Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedInterests.includes(tag)
                      ? "bg-[#172536] text-white shadow-2xs font-semibold"
                      : "bg-[#FAF8F5] text-[#172536] border border-[#E5E0D8] hover:border-[#CBD5E1]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Other interests (e.g. Scuba diving, Monastery meditation, Temple architecture)"
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Party Type */}
          <div className="space-y-2">
            <label className="block font-semibold text-[#172536] text-xs uppercase tracking-wider">
              Party Type
            </label>
            <div className="flex gap-3">
              {["solo", "group"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTravelType(t)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold capitalize transition cursor-pointer ${
                    travelType === t
                      ? "border-[#172536] bg-[#172536] text-white"
                      : "border-[#E5E0D8] bg-[#FAF8F5] text-[#172536] hover:border-[#CBD5E1]"
                  }`}
                >
                  {t === "solo" ? "Solo Traveller" : "Small Group / Family"}
                </button>
              ))}
            </div>
            {travelType === "group" && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-[#64748B] font-semibold">Group Size:</span>
                <input
                  type="number"
                  min="2"
                  max="25"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="w-20 bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg px-3 py-1.5 text-xs font-bold text-center focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 bg-[#E99A25] hover:bg-[#D4881A] text-[#172536] font-bold text-sm sm:text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <span>Generating Itinerary & Checking Schedules...</span>
              ) : (
                <>
                  <span>Proceed to Travel & Stay Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {status && <p className="text-center font-semibold text-xs text-[#2D5A46]">{status}</p>}
        </form>
      </section>

      {/* ============================================================ */}
      {/* 8. STORIES FROM THE ROAD (Section 15) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5E0D8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E99A25]">
              Field Dispatches
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172536] font-normal tracking-tight">
              Stories From The Road
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md">
            Unfiltered travel journalism and observations contributed by travellers across the subcontinent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Story 1 */}
          <article className="editorial-card overflow-hidden group flex flex-col">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=800&q=80"
                alt="Kutch Landscape"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute bottom-3 left-3 bg-[#172536]/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                4 min read
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E99A25]">
                  Western Borders
                </span>
                <h3 className="font-serif text-xl font-normal text-[#172536] group-hover:text-[#E99A25] transition">
                  A Weekend in Kutch: Beyond the White Salt Flat
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  How driving 90 minutes past the tourist tents leads to ancient Harappan reservoirs in Dholavira and silent weaver hamlets.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-slate-400">
                <span>By Aisha Merchant</span>
                <span>2 days ago</span>
              </div>
            </div>
          </article>

          {/* Story 2 */}
          <article className="editorial-card overflow-hidden group flex flex-col">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Himalayan Trail"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute bottom-3 left-3 bg-[#172536]/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                6 min read
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D5A46]">
                  Mountain Acclimatization
                </span>
                <h3 className="font-serif text-xl font-normal text-[#172536] group-hover:text-[#E99A25] transition">
                  My First Himalayan Trek: What Nobody Tells You About Altitude
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Practical pacing advice, the importance of drinking garlic broth, and why crossing 3,000m should never be rushed.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-slate-400">
                <span>By Rohan Deshmukh</span>
                <span>5 days ago</span>
              </div>
            </div>
          </article>

          {/* Story 3 */}
          <article className="editorial-card overflow-hidden group flex flex-col">
            <div className="h-52 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
                alt="Varanasi Street"
                className="w-full h-full object-cover img-editorial"
              />
              <span className="absolute bottom-3 left-3 bg-[#172536]/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                5 min read
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E99A25]">
                  Ghats & Culinary Heritage
                </span>
                <h3 className="font-serif text-xl font-normal text-[#172536] group-hover:text-[#E99A25] transition">
                  Hidden Food Spots in Old Lucknow and Varanasi
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  From clay-pot malaiyo served at dawn in Thatheri Bazar to the subtleties of slow-cooked winter kebabs in Chowk.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-slate-400">
                <span>By Vikram Sethi</span>
                <span>1 week ago</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
