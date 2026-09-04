import destinationsData from "../data/destinationsData";

export function getTravelAndStayOptions(destInput, originCity = "Delhi") {
  let matchedDest = null;
  if (typeof destInput === "string") {
    const rawDest = (destInput || "Kashmir").trim();
    matchedDest = destinationsData.find(
      d => d.name.toLowerCase().includes(rawDest.toLowerCase()) || rawDest.toLowerCase().includes(d.name.toLowerCase())
    );
    if (!matchedDest) {
      matchedDest = {
        name: rawDest,
        transport: {
          nearestAirport: `Nearest Regional Airport for ${rawDest}`,
          nearestRailway: `Nearest Railway Junction for ${rawDest}`,
          busConnectivity: `State Express Volvo Buses connecting ${rawDest}`,
        },
        stays: [
          { type: "Budget / Homestay", name: `${rawDest} Heritage Homestay`, price: "₹1,200 - ₹2,200/night", rating: 4.6 },
          { type: "Mid-Range Boutique", name: `${rawDest} Valley Boutique Resort`, price: "₹3,800 - ₹6,000/night", rating: 4.8 },
          { type: "Luxury / Premium", name: `${rawDest} Grand Palace Stay`, price: "₹11,000+/night", rating: 4.9 }
        ]
      };
    }
  } else {
    matchedDest = destInput;
  }

  const origin = originCity || "Delhi";
  const destName = matchedDest.name;

  // Multiple Flight Options
  const flights = [
    {
      id: "flight-1",
      type: "flight",
      provider: "IndiGo (6E-2041)",
      airline: "IndiGo",
      flightNumber: "6E-2041",
      mode: "✈️ Flight • IndiGo (6E-2041)",
      icon: "Plane",
      route: `${origin} ➔ ${destName}`,
      departureTime: "06:15 AM",
      arrivalTime: "08:45 AM",
      timing: "06:15 AM - 08:45 AM",
      duration: "2h 30m",
      stops: "Non-stop",
      price: "₹4,650",
      priceNum: 4650,
      cabinClass: "Economy (Saver)",
      baggage: "7kg Cabin + 15kg Check-in",
      tags: ["Fastest", "Non-stop", "Popular Choice"],
      carbonScore: "Moderate"
    },
    {
      id: "flight-2",
      type: "flight",
      provider: "Air India (AI-825)",
      airline: "Air India",
      flightNumber: "AI-825",
      mode: "✈️ Flight • Air India (AI-825)",
      icon: "Plane",
      route: `${origin} ➔ ${destName}`,
      departureTime: "09:30 AM",
      arrivalTime: "12:05 PM",
      timing: "09:30 AM - 12:05 PM",
      duration: "2h 35m",
      stops: "Non-stop",
      price: "₹5,420",
      priceNum: 5420,
      cabinClass: "Economy (Full Service)",
      baggage: "Hot Meals + 25kg Baggage Included",
      tags: ["Full Service", "Morning Flight", "Free Meals"],
      carbonScore: "Moderate"
    },
    {
      id: "flight-3",
      type: "flight",
      provider: "SpiceJet (SG-104)",
      airline: "SpiceJet",
      flightNumber: "SG-104",
      mode: "✈️ Flight • SpiceJet (SG-104)",
      icon: "Plane",
      route: `${origin} ➔ ${destName}`,
      departureTime: "02:15 PM",
      arrivalTime: "04:50 PM",
      timing: "02:15 PM - 04:50 PM",
      duration: "2h 35m",
      stops: "Non-stop",
      price: "₹3,980",
      priceNum: 3980,
      cabinClass: "Economy (Value Fare)",
      baggage: "7kg Cabin Baggage",
      tags: ["Best Value", "Afternoon", "Budget Friendly"],
      carbonScore: "Moderate"
    }
  ];

  // Multiple Train Options
  const nearestRail = matchedDest.transport?.nearestRailway || `${destName} Junction`;
  const trains = [
    {
      id: "train-1",
      type: "train",
      provider: "Vande Bharat Express (22439)",
      trainName: "Vande Bharat Express",
      trainNumber: "22439",
      mode: "🚆 Train • Vande Bharat Express (22439)",
      icon: "Train",
      route: `${origin} ➔ ${nearestRail}`,
      departureTime: "06:00 AM",
      arrivalTime: "02:00 PM",
      timing: "06:00 AM - 02:00 PM",
      duration: "8h 00m",
      stops: "Superfast Express (4 Stops)",
      price: "₹1,680",
      priceNum: 1680,
      cabinClass: "AC Chair Car (CC)",
      baggage: "Complimentary Hot Breakfast & Lunch",
      tags: ["High Speed", "Scenic Route", "Recommended"],
      carbonScore: "Low (Eco-Friendly)"
    },
    {
      id: "train-2",
      type: "train",
      provider: "Rajdhani Express (12425)",
      trainName: "Rajdhani Superfast Express",
      trainNumber: "12425",
      mode: "🚆 Train • Rajdhani Express (12425)",
      icon: "Train",
      route: `${origin} ➔ ${nearestRail}`,
      departureTime: "08:40 PM",
      arrivalTime: "06:10 AM",
      timing: "08:40 PM - 06:10 AM",
      duration: "9h 30m",
      stops: "Overnight Express",
      price: "₹2,150",
      priceNum: 2150,
      cabinClass: "3-Tier AC (3AC Sleeper)",
      baggage: "Bedroll & Dinner Included",
      tags: ["Overnight Sleep", "Comfortable", "Top Rated"],
      carbonScore: "Low (Eco-Friendly)"
    },
    {
      id: "train-3",
      type: "train",
      provider: "Superfast Mail Express (12952)",
      trainName: "Superfast Mail Express",
      trainNumber: "12952",
      mode: "🚆 Train • Superfast Mail (12952)",
      icon: "Train",
      route: `${origin} ➔ ${nearestRail}`,
      departureTime: "11:45 AM",
      arrivalTime: "09:15 PM",
      timing: "11:45 AM - 09:15 PM",
      duration: "9h 30m",
      stops: "Semi-Fast (8 Stops)",
      price: "₹820",
      priceNum: 820,
      cabinClass: "Sleeper (SL) / 3AC",
      baggage: "Standard Rail Booking",
      tags: ["Budget Choice", "Daytime Scenic"],
      carbonScore: "Low (Eco-Friendly)"
    }
  ];

  // Bus / Road Options
  const buses = [
    {
      id: "bus-1",
      type: "bus",
      provider: "State RTC Volvo 9600 AC Sleeper",
      mode: "🚌 Bus • State RTC Volvo AC Sleeper",
      icon: "Bus",
      route: `${origin} ISBT ➔ ${destName}`,
      departureTime: "07:30 PM",
      arrivalTime: "08:30 AM",
      timing: "07:30 PM - 08:30 AM",
      duration: "13h 00m",
      stops: "Overnight (2 Rest Stops)",
      price: "₹1,350",
      priceNum: 1350,
      cabinClass: "AC Sleeper (Upper/Lower)",
      baggage: "Direct Central Drop",
      tags: ["Overnight", "Direct Drop", "State Managed"],
      carbonScore: "Low"
    },
    {
      id: "bus-2",
      type: "bus",
      provider: "Intercity Scania Luxury Express",
      mode: "🚌 Bus • Intercity Scania AC Coach",
      icon: "Bus",
      route: `${origin} ➔ ${destName}`,
      departureTime: "08:30 PM",
      arrivalTime: "09:15 AM",
      timing: "08:30 PM - 09:15 AM",
      duration: "12h 45m",
      stops: "Overnight (1 Rest Stop)",
      price: "₹1,100",
      priceNum: 1100,
      cabinClass: "AC Semi-Sleeper",
      baggage: "Water Bottle & Blanket Provided",
      tags: ["Budget Friendly", "Reclining Seats"],
      carbonScore: "Low"
    }
  ];

  const stayData = matchedDest.stays || [];
  const stays = [
    {
      id: "stay-budget",
      tierKey: "budget",
      type: stayData[0]?.type || "Budget / Homestay",
      name: stayData[0]?.name || `${destName} Heritage Homestay`,
      price: stayData[0]?.price || "₹1,200 - ₹2,000/night",
      rating: stayData[0]?.rating || 4.6,
      amenities: ["Free High-Speed WiFi", "Local Homemade Breakfast", "Hot Water & Room Heating", "Scenic Mountain/Ghat Views"],
      description: "Cozy local heritage homestay hosted by friendly residents with authentic regional meals.",
      tags: ["Best Value", "Authentic Local Experience"]
    },
    {
      id: "stay-mid",
      tierKey: "mid",
      type: stayData[1]?.type || "Mid-Range Boutique Resort",
      name: stayData[1]?.name || `${destName} Valley Boutique Resort`,
      price: stayData[1]?.price || "₹3,800 - ₹6,000/night",
      rating: stayData[1]?.rating || 4.8,
      amenities: ["Panoramic Balcony View", "Complimentary Buffet Breakfast", "24/7 Room Service & Heating", "Central Location"],
      description: "Charming boutique retreat with scenic vistas, contemporary comfort, and exceptional hospitality.",
      tags: ["Most Popular", "Couples & Families", "Top Rated"]
    },
    {
      id: "stay-luxury",
      tierKey: "luxury",
      type: stayData[2]?.type || "Luxury / Royal Palace Resort",
      name: stayData[2]?.name || `${destName} Grand Palace Stay`,
      price: stayData[2]?.price || "₹11,000+/night",
      rating: stayData[2]?.rating || 4.95,
      amenities: ["5-Star Luxury Spa & Heated Pool", "Multi-Cuisine Fine Dining", "Private Chauffeur Pickup", "Luxury Heritage Suite"],
      description: "World-class luxury featuring royal architecture, private gardens, and five-star amenities.",
      tags: ["Luxury Experience", "5-Star Hospitality", "Premium"]
    }
  ];

  return { flights, trains, buses, stays };
}

// ---------------------------------------------------------------------------
// Return Transit Options (reversed route: destination → origin)
// Same data shape as getTravelAndStayOptions but with "ret-" prefixed IDs and
// adjusted timings / slightly varied prices so the return cards feel distinct.
// ---------------------------------------------------------------------------
export function getReturnTransitOptions(destInput, originCity = "Delhi") {
  let matchedDest = null;
  if (typeof destInput === "string") {
    const rawDest = (destInput || "Kashmir").trim();
    matchedDest = destinationsData.find(
      d => d.name.toLowerCase().includes(rawDest.toLowerCase()) || rawDest.toLowerCase().includes(d.name.toLowerCase())
    );
    if (!matchedDest) {
      matchedDest = { name: rawDest, transport: {} };
    }
  } else {
    matchedDest = destInput;
  }

  const origin = originCity || "Delhi";
  const destName = matchedDest.name;
  const nearestRail = matchedDest.transport?.nearestRailway || `${destName} Junction`;

  // Return Flights (destination → origin)
  const flights = [
    {
      id: "ret-flight-1",
      type: "flight",
      provider: "IndiGo (6E-2042)",
      airline: "IndiGo",
      flightNumber: "6E-2042",
      mode: `✈️ Flight • IndiGo (6E-2042)`,
      icon: "Plane",
      route: `${destName} ➔ ${origin}`,
      departureTime: "07:30 AM",
      arrivalTime: "10:05 AM",
      timing: "07:30 AM - 10:05 AM",
      duration: "2h 35m",
      stops: "Non-stop",
      price: "₹4,850",
      priceNum: 4850,
      cabinClass: "Economy (Saver)",
      baggage: "7kg Cabin + 15kg Check-in",
      tags: ["Fastest Return", "Non-stop", "Morning"],
      carbonScore: "Moderate"
    },
    {
      id: "ret-flight-2",
      type: "flight",
      provider: "Air India (AI-826)",
      airline: "Air India",
      flightNumber: "AI-826",
      mode: `✈️ Flight • Air India (AI-826)`,
      icon: "Plane",
      route: `${destName} ➔ ${origin}`,
      departureTime: "01:15 PM",
      arrivalTime: "03:55 PM",
      timing: "01:15 PM - 03:55 PM",
      duration: "2h 40m",
      stops: "Non-stop",
      price: "₹5,650",
      priceNum: 5650,
      cabinClass: "Economy (Full Service)",
      baggage: "Hot Meals + 25kg Baggage Included",
      tags: ["Full Service", "Afternoon Return", "Free Meals"],
      carbonScore: "Moderate"
    },
    {
      id: "ret-flight-3",
      type: "flight",
      provider: "SpiceJet (SG-105)",
      airline: "SpiceJet",
      flightNumber: "SG-105",
      mode: `✈️ Flight • SpiceJet (SG-105)`,
      icon: "Plane",
      route: `${destName} ➔ ${origin}`,
      departureTime: "04:45 PM",
      arrivalTime: "07:20 PM",
      timing: "04:45 PM - 07:20 PM",
      duration: "2h 35m",
      stops: "Non-stop",
      price: "₹3,750",
      priceNum: 3750,
      cabinClass: "Economy (Value Fare)",
      baggage: "7kg Cabin Baggage",
      tags: ["Best Value", "Evening Return", "Budget Friendly"],
      carbonScore: "Moderate"
    }
  ];

  // Return Trains (destination → origin)
  const trains = [
    {
      id: "ret-train-1",
      type: "train",
      provider: "Vande Bharat Express (22440)",
      trainName: "Vande Bharat Express",
      trainNumber: "22440",
      mode: "🚆 Train • Vande Bharat Express (22440)",
      icon: "Train",
      route: `${nearestRail} ➔ ${origin}`,
      departureTime: "05:45 AM",
      arrivalTime: "01:45 PM",
      timing: "05:45 AM - 01:45 PM",
      duration: "8h 00m",
      stops: "Superfast Express (4 Stops)",
      price: "₹1,620",
      priceNum: 1620,
      cabinClass: "AC Chair Car (CC)",
      baggage: "Complimentary Hot Breakfast & Lunch",
      tags: ["High Speed", "Scenic Route", "Recommended"],
      carbonScore: "Low (Eco-Friendly)"
    },
    {
      id: "ret-train-2",
      type: "train",
      provider: "Rajdhani Express (12426)",
      trainName: "Rajdhani Superfast Express",
      trainNumber: "12426",
      mode: "🚆 Train • Rajdhani Express (12426)",
      icon: "Train",
      route: `${nearestRail} ➔ ${origin}`,
      departureTime: "07:00 PM",
      arrivalTime: "04:30 AM",
      timing: "07:00 PM - 04:30 AM",
      duration: "9h 30m",
      stops: "Overnight Express",
      price: "₹2,080",
      priceNum: 2080,
      cabinClass: "3-Tier AC (3AC Sleeper)",
      baggage: "Bedroll & Dinner Included",
      tags: ["Overnight Sleep", "Comfortable", "Top Rated"],
      carbonScore: "Low (Eco-Friendly)"
    },
    {
      id: "ret-train-3",
      type: "train",
      provider: "Superfast Mail Express (12951)",
      trainName: "Superfast Mail Express",
      trainNumber: "12951",
      mode: "🚆 Train • Superfast Mail (12951)",
      icon: "Train",
      route: `${nearestRail} ➔ ${origin}`,
      departureTime: "10:30 AM",
      arrivalTime: "08:00 PM",
      timing: "10:30 AM - 08:00 PM",
      duration: "9h 30m",
      stops: "Semi-Fast (8 Stops)",
      price: "₹790",
      priceNum: 790,
      cabinClass: "Sleeper (SL) / 3AC",
      baggage: "Standard Rail Booking",
      tags: ["Budget Choice", "Daytime Scenic"],
      carbonScore: "Low (Eco-Friendly)"
    }
  ];

  // Return Buses (destination → origin)
  const buses = [
    {
      id: "ret-bus-1",
      type: "bus",
      provider: "State RTC Volvo 9600 AC Sleeper",
      mode: "🚌 Bus • State RTC Volvo AC Sleeper",
      icon: "Bus",
      route: `${destName} ➔ ${origin} ISBT`,
      departureTime: "06:00 PM",
      arrivalTime: "07:00 AM",
      timing: "06:00 PM - 07:00 AM",
      duration: "13h 00m",
      stops: "Overnight (2 Rest Stops)",
      price: "₹1,280",
      priceNum: 1280,
      cabinClass: "AC Sleeper (Upper/Lower)",
      baggage: "Direct Central Drop",
      tags: ["Overnight", "Direct Drop", "State Managed"],
      carbonScore: "Low"
    },
    {
      id: "ret-bus-2",
      type: "bus",
      provider: "Intercity Scania Luxury Express",
      mode: "🚌 Bus • Intercity Scania AC Coach",
      icon: "Bus",
      route: `${destName} ➔ ${origin}`,
      departureTime: "07:30 PM",
      arrivalTime: "08:15 AM",
      timing: "07:30 PM - 08:15 AM",
      duration: "12h 45m",
      stops: "Overnight (1 Rest Stop)",
      price: "₹1,050",
      priceNum: 1050,
      cabinClass: "AC Semi-Sleeper",
      baggage: "Water Bottle & Blanket Provided",
      tags: ["Budget Friendly", "Reclining Seats"],
      carbonScore: "Low"
    }
  ];

  return { flights, trains, buses };
}

export function generateSmartItinerary(preferences = {}) {
  const rawDest = (preferences.destination || "Kashmir").trim();
  const originCity = preferences.city || preferences.currentCity || "Delhi";
  
  // Find match in catalog or construct dynamic destination object
  let matchedDest = destinationsData.find(
    d => d.name.toLowerCase().includes(rawDest.toLowerCase()) || rawDest.toLowerCase().includes(d.name.toLowerCase())
  );

  if (!matchedDest) {
    matchedDest = {
      id: rawDest.toLowerCase().replace(/\s+/g, '-'),
      name: rawDest,
      state: "India",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      tagline: `Explore the scenic beauty and rich culture of ${rawDest}`,
      category: "Custom Destination",
      altitude: 1200,
      altitudeUnit: "Moderate Elevation",
      safetyRisk: {
        level: "Low",
        riskType: "Standard Travel Awareness",
        amsRisk: "Low",
        advisory: "Stay hydrated and keep local emergency contacts handy.",
        helpline: "112 (National Emergency), 1363 (Tourist Police), 108 (Ambulance)"
      },
      transport: {
        nearestAirport: `Nearest Regional Airport for ${rawDest}`,
        nearestRailway: `Nearest Major Railway Junction for ${rawDest}`,
        busConnectivity: `State Express & Tourist Volvo Buses connecting ${rawDest}`,
        localTransit: "Pre-paid taxis, Auto-rickshaws, and Bike rentals"
      },
      stays: [
        { type: "Budget / Homestay", name: `${rawDest} Heritage Homestay`, price: "₹1,200 - ₹2,200/night", rating: 4.6 },
        { type: "Mid-Range Boutique", name: `${rawDest} Valley Boutique Resort`, price: "₹3,800 - ₹6,000/night", rating: 4.8 },
        { type: "Luxury / Premium", name: `${rawDest} Grand Palace Stay`, price: "₹11,000+/night", rating: 4.9 }
      ],
      attractions: [
        {
          id: `${rawDest}-attraction-1`,
          name: `${rawDest} Main Cultural Heritage Landmark`,
          timeSlot: "Morning (09:00 AM - 12:30 PM)",
          duration: "3 hours",
          cost: "₹100 - ₹300 per person",
          crowdLevel: "Moderate",
          crowdScore: 65,
          tags: ["Heritage", "Culture", "Photography"],
          description: `Explore the iconic architectural monument and historical center of ${rawDest}.`,
          offbeatAlternative: {
            name: `${rawDest} Quiet Nature Trail & Artisan Quarter`,
            tagline: "Serene local artisan enclave with authentic handicrafts and peaceful scenery",
            benefit: "Authentic local interactions and peaceful surroundings with minimal crowds.",
            distance: "8 km from city center",
            crowdScore: 20
          }
        },
        {
          id: `${rawDest}-attraction-2`,
          name: `${rawDest} Nature Viewpoint & Lake/Valley Walk`,
          timeSlot: "Afternoon (02:00 PM - 05:00 PM)",
          duration: "3 hours",
          cost: "Free",
          crowdLevel: "High",
          crowdScore: 78,
          tags: ["Nature", "Scenic View", "Outdoors"],
          description: `Panoramic vantage point offering sweeping scenic vistas of ${rawDest}.`,
          offbeatAlternative: {
            name: `${rawDest} Sunset Valley Sanctuary`,
            tagline: "Lush green peaceful forest clearing overlooking the sunset valley",
            benefit: "Fresh breeze, pristine environment, and tranquil photo spots.",
            distance: "12 km from center",
            crowdScore: 22
          }
        }
      ]
    };
  }

  const duration = Math.max(1, Math.min(14, Number(preferences.holidays) || 3));
  const budgetInr = Number(preferences.budget) || 0;
  const groupSize = preferences.travelType === "group" ? Math.max(2, Number(preferences.groupSize) || 2) : 1;

  const stayBudget = Math.round(budgetInr * 0.40);
  const transitBudget = Math.round(budgetInr * 0.25);
  const activitiesBudget = Math.round(budgetInr * 0.25);
  const bufferBudget = Math.round(budgetInr * 0.10);

  // Generate available multiple options
  const travelStayCatalog = getTravelAndStayOptions(matchedDest, originCity);

  // User's specific Selected Stay
  let selectedStay = preferences.selectedStay;
  if (!selectedStay) {
    if (budgetInr > 70000) selectedStay = travelStayCatalog.stays[2] || travelStayCatalog.stays[1];
    else if (budgetInr > 35000) selectedStay = travelStayCatalog.stays[1] || travelStayCatalog.stays[0];
    else selectedStay = travelStayCatalog.stays[0];
  }

  // User's specific Selected Travel (Flight / Train / Bus)
  let selectedTravel = preferences.selectedTravel;
  if (!selectedTravel) {
    selectedTravel = travelStayCatalog.flights[0] || travelStayCatalog.trains[0];
  }

  // Return transit selection (if provided by the user)
  const selectedReturnTravel = preferences.selectedReturnTravel || null;

  const departTime = selectedTravel?.departureTime || preferences.departTime || "08:00 AM";
  const medicalIssues = preferences.medicalIssues || [];
  const customMedicalInfo = preferences.customMedicalInfo || "";

  const days = [];
  const baseAttractions = matchedDest.attractions;

  for (let i = 1; i <= duration; i++) {
    const dayTheme = i === 1 ? `Departure via ${selectedTravel.provider || selectedTravel.mode}, Arrival & Acclimatization`
      : i === duration ? "Local Souvenirs, Cultural Markets & Farewell"
      : `Exploring Highlights & Scenic Circuit (Part ${i - 1})`;

    const primaryAttr = baseAttractions[(i - 1) % baseAttractions.length];
    const secondaryAttr = baseAttractions[i % baseAttractions.length];

    const activities = [
      {
        id: `day-${i}-morning`,
        slot: i === 1 ? `Morning (${departTime} - 12:30 PM)` : "Morning (08:30 AM - 12:00 PM)",
        title: i === 1 ? `Departure from ${originCity} via ${selectedTravel.provider || selectedTravel.mode} & Check-in at ${selectedStay.name}` : primaryAttr.name,
        type: i === 1 ? "Transit & Check-in" : "Sightseeing",
        crowdScore: i === 1 ? 40 : primaryAttr.crowdScore,
        crowdLevel: i === 1 ? "Low" : primaryAttr.crowdLevel,
        estCost: i === 1 ? `${selectedTravel.price || "Transit"} (Included)` : primaryAttr.cost,
        description: i === 1 
          ? `Depart at ${departTime} (${selectedTravel.route || originCity + " to " + matchedDest.name}). Arrive, transfer to ${selectedStay.name}, settle in, and acclimatize with local refreshments.${medicalIssues.length > 0 ? " (Health condition noted: relaxed pace on arrival)." : ""}`
          : primaryAttr.description,
        tags: i === 1 ? ["Transit", "Stay", "Arrival"] : primaryAttr.tags,
        isSwapped: false,
        offbeatAlternative: primaryAttr.offbeatAlternative
      },
      {
        id: `day-${i}-afternoon`,
        slot: "Afternoon (01:00 PM - 04:30 PM)",
        title: secondaryAttr.name,
        type: "Adventure & Sightseeing",
        crowdScore: secondaryAttr.crowdScore,
        crowdLevel: secondaryAttr.crowdLevel,
        estCost: secondaryAttr.cost,
        description: secondaryAttr.description,
        tags: secondaryAttr.tags,
        isSwapped: false,
        offbeatAlternative: secondaryAttr.offbeatAlternative
      },
      {
        id: `day-${i}-evening`,
        slot: "Evening (05:30 PM - 08:30 PM)",
        title: "Sunset Viewpoint & Authentic Local Food Crawl",
        type: "Food & Culture",
        crowdScore: 55,
        crowdLevel: "Moderate",
        estCost: "₹400 - ₹800 per person",
        description: "Taste authentic regional delicacies, stroll through pedestrian artisan markets, and enjoy golden hour reflections.",
        tags: ["Cuisine", "Artisans", "Sunset"],
        isSwapped: false,
        offbeatAlternative: null
      }
    ];

    days.push({
      dayNumber: i,
      title: `Day ${i}: ${dayTheme}`,
      activities
    });
  }

  return {
    destination: matchedDest,
    duration,
    budgetInr,
    budgetPerPerson: Math.round(budgetInr / groupSize),
    groupSize,
    departTime,
    medicalIssues,
    customMedicalInfo,
    travelType: preferences.travelType || "solo",
    budgetBreakdown: {
      stay: stayBudget,
      transit: transitBudget,
      activities: activitiesBudget,
      buffer: bufferBudget
    },
    stayRecommendation: selectedStay,
    selectedStay: selectedStay,
    selectedTravel: selectedTravel,
    selectedReturnTravel: selectedReturnTravel,
    availableTravelOptions: travelStayCatalog,
    availableStays: travelStayCatalog.stays,
    transitModes: [
      {
        mode: selectedTravel.mode,
        details: `${selectedTravel.route} • Timing: ${selectedTravel.timing} • ${selectedTravel.duration}`,
        duration: selectedTravel.duration,
        estCost: selectedTravel.price,
        tags: selectedTravel.tags,
        carbonScore: selectedTravel.carbonScore
      },
      ...travelStayCatalog.flights.filter(f => f.id !== selectedTravel.id).slice(0, 1).map(f => ({
        mode: f.mode,
        details: `${f.route} • Timing: ${f.timing} • ${f.duration}`,
        duration: f.duration,
        estCost: f.price,
        tags: f.tags,
        carbonScore: f.carbonScore
      })),
      ...travelStayCatalog.trains.filter(t => t.id !== selectedTravel.id).slice(0, 1).map(t => ({
        mode: t.mode,
        details: `${t.route} • Timing: ${t.timing} • ${t.duration}`,
        duration: t.duration,
        estCost: t.price,
        tags: t.tags,
        carbonScore: t.carbonScore
      }))
    ],
    days,
    generatedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  };
}