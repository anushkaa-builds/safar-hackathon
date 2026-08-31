import destinationsData from "../data/destinationsData";

export function generateSmartItinerary(preferences) {
  const rawDest = (preferences.destination || "Kashmir").trim();
  
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
  const budgetInr = (Number(preferences.budget) || 500) * 83;
  const groupSize = preferences.travelType === "group" ? Math.max(2, Number(preferences.groupSize) || 2) : 1;

  const stayBudget = Math.round(budgetInr * 0.40);
  const transitBudget = Math.round(budgetInr * 0.25);
  const activitiesBudget = Math.round(budgetInr * 0.25);
  const bufferBudget = Math.round(budgetInr * 0.10);

  let selectedStay = matchedDest.stays[0];
  if (budgetInr > 70000) selectedStay = matchedDest.stays[2] || matchedDest.stays[1];
  else if (budgetInr > 35000) selectedStay = matchedDest.stays[1] || matchedDest.stays[0];

  const departTime = preferences.departTime || "08:00 AM";
  const medicalIssues = preferences.medicalIssues || [];
  const customMedicalInfo = preferences.customMedicalInfo || "";

  const transitModes = [
    {
      mode: "✈️ Flight / Air Connector",
      details: "Nearest: " + matchedDest.transport.nearestAirport,
      duration: "2h 30m avg",
      estCost: "₹" + Math.min(transitBudget, 4500 + Math.floor(Math.random() * 2000)).toLocaleString(),
      tags: ["Fastest", "Comfortable"],
      carbonScore: "Moderate"
    },
    {
      mode: "🚆 Train (Vande Bharat / Superfast Express)",
      details: "Direct rail link: " + matchedDest.transport.nearestRailway,
      duration: "8h - 12h",
      estCost: "₹" + Math.floor(transitBudget * 0.45).toLocaleString() + " (3AC / Chair Car)",
      tags: ["Eco-Friendly", "Scenic", "Recommended"],
      carbonScore: "Low"
    },
    {
      mode: "🚌 State Highway Volvo / Multi-Axle Bus",
      details: matchedDest.transport.busConnectivity,
      duration: "10h - 14h",
      estCost: "₹" + Math.floor(transitBudget * 0.25).toLocaleString(),
      tags: ["Budget", "Overnight"],
      carbonScore: "Low"
    }
  ];

  const days = [];
  const baseAttractions = matchedDest.attractions;

  for (let i = 1; i <= duration; i++) {
    const dayTheme = i === 1 ? `Departure at ${departTime}, Arrival & Acclimatization`
      : i === duration ? "Local Souvenirs, Cultural Markets & Farewell"
      : `Exploring Highlights & Scenic Circuit (Part ${i - 1})`;

    const primaryAttr = baseAttractions[(i - 1) % baseAttractions.length];
    const secondaryAttr = baseAttractions[i % baseAttractions.length];

    const activities = [
      {
        id: `day-${i}-morning`,
        slot: i === 1 ? `Morning (${departTime} - 12:00 PM)` : "Morning (08:30 AM - 12:00 PM)",
        title: i === 1 ? `Departure from ${preferences.city || "Origin"} & Check-in at ${selectedStay.name}` : primaryAttr.name,
        type: i === 1 ? "Transit & Check-in" : "Sightseeing",
        crowdScore: i === 1 ? 40 : primaryAttr.crowdScore,
        crowdLevel: i === 1 ? "Low" : primaryAttr.crowdLevel,
        estCost: i === 1 ? "Included in stay" : primaryAttr.cost,
        description: i === 1 
          ? `Depart at ${departTime}. Settle in, freshen up, and take it easy with warm herbal tea.${medicalIssues.length > 0 ? " (Health condition noted: lighter pace on arrival day)." : ""}`
          : primaryAttr.description,
        tags: i === 1 ? ["Stay", "Arrival"] : primaryAttr.tags,
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
    transitModes,
    days,
    generatedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  };
}