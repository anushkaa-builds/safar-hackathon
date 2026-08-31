import destinationsData from "../data/destinationsData";

export function generateSmartItinerary(preferences) {
  const destName = preferences.destination || "Kashmir";
  const matchedDest = destinationsData.find(
    d => d.name.toLowerCase().includes(destName.toLowerCase()) || destName.toLowerCase().includes(d.name.toLowerCase())
  ) || destinationsData[0];

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
    const dayTheme = i === 1 ? "Arrival, Check-in & Orientation"
      : i === duration ? "Local Souvenirs, Cultural Markets & Farewell"
      : "Exploring Highlights & Scenic Circuit (Part " + (i - 1) + ")";

    const primaryAttr = baseAttractions[(i - 1) % baseAttractions.length];
    const secondaryAttr = baseAttractions[i % baseAttractions.length];

    const activities = [
      {
        id: "day-" + i + "-morning",
        slot: "Morning (08:30 AM - 12:00 PM)",
        title: i === 1 ? "Arrival in " + matchedDest.name + " & Check-in at " + selectedStay.name : primaryAttr.name,
        type: i === 1 ? "Transit & Check-in" : "Sightseeing",
        crowdScore: i === 1 ? 40 : primaryAttr.crowdScore,
        crowdLevel: i === 1 ? "Low" : primaryAttr.crowdLevel,
        estCost: i === 1 ? "Included in stay" : primaryAttr.cost,
        description: i === 1 ? "Settle in, freshen up, and acclimatize with complimentary welcome herbal tea." : primaryAttr.description,
        tags: i === 1 ? ["Stay", "Acclimatization"] : primaryAttr.tags,
        isSwapped: false,
        offbeatAlternative: primaryAttr.offbeatAlternative
      },
      {
        id: "day-" + i + "-afternoon",
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
        id: "day-" + i + "-evening",
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
      title: "Day " + i + ": " + dayTheme,
      activities
    });
  }

  return {
    destination: matchedDest,
    duration,
    budgetInr,
    budgetPerPerson: Math.round(budgetInr / groupSize),
    groupSize,
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