import { describe, it, expect } from "vitest";
import { generateSmartItinerary, getReturnTransitOptions } from "./itineraryGenerator.js";

// Helper to create preferences for a given duration and transport type
function makePrefs(duration, transportType = "flight") {
  // Build a selectedTravel stub matching the type
  const travelStubs = {
    flight: {
      id: "flight-1", type: "flight", provider: "IndiGo (6E-2041)",
      mode: "✈️ Flight • IndiGo (6E-2041)", route: "Delhi ➔ Kashmir",
      departureTime: "06:15 AM", arrivalTime: "08:45 AM",
      timing: "06:15 AM - 08:45 AM", duration: "2h 30m",
      price: "₹4,650", priceNum: 4650, cabinClass: "Economy (Saver)",
      tags: ["Fastest"], carbonScore: "Moderate"
    },
    train: {
      id: "train-1", type: "train", provider: "Vande Bharat Express (22439)",
      mode: "🚆 Train • Vande Bharat Express (22439)", route: "Delhi ➔ Kashmir Junction",
      departureTime: "06:00 AM", arrivalTime: "02:00 PM",
      timing: "06:00 AM - 02:00 PM", duration: "8h 00m",
      price: "₹1,680", priceNum: 1680, cabinClass: "AC Chair Car (CC)",
      tags: ["High Speed"], carbonScore: "Low (Eco-Friendly)"
    },
    bus: {
      id: "bus-1", type: "bus", provider: "State RTC Volvo 9600 AC Sleeper",
      mode: "🚌 Bus • State RTC Volvo AC Sleeper", route: "Delhi ISBT ➔ Kashmir",
      departureTime: "07:30 PM", arrivalTime: "08:30 AM",
      timing: "07:30 PM - 08:30 AM", duration: "13h 00m",
      price: "₹1,350", priceNum: 1350, cabinClass: "AC Sleeper (Upper/Lower)",
      tags: ["Overnight"], carbonScore: "Low"
    }
  };

  return {
    destination: "Kashmir",
    city: "Delhi",
    holidays: duration,
    budget: 35000,
    interests: ["Lakes & Valleys"],
    departTime: "08:00 AM",
    medicalIssues: ["None (Fit to travel)"],
    travelType: "solo",
    groupSize: 1,
    selectedTravel: travelStubs[transportType],
    selectedStay: {
      id: "stay-mid", tierKey: "mid", type: "Mid-Range Boutique Resort",
      name: "Kashmir Valley Boutique Resort", price: "₹3,800 - ₹6,000/night",
      rating: 4.8, amenities: [], description: "Charming boutique retreat", tags: []
    }
  };
}

// ─────────────────────────────────────────────────────────────
// TEST SUITE: Return Journey on Last Day
// ─────────────────────────────────────────────────────────────

describe("Return Journey on Last Day", () => {

  // ── 2-day trip ──────────────────────────────────────────────
  describe("2-day trip", () => {
    const itinerary = generateSmartItinerary(makePrefs(2));

    it("should have exactly 2 days", () => {
      expect(itinerary.days).toHaveLength(2);
    });

    it("should have a return journey activity on Day 2 (last day)", () => {
      const lastDay = itinerary.days[itinerary.days.length - 1];
      const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
      expect(returnAct).toBeDefined();
      expect(returnAct.type).toBe("Return Transit");
      expect(returnAct.tags).toContain("Return Transit");
      expect(returnAct.tags).toContain("Booking Reminder");
    });

    it("should include destination → origin in return activity title", () => {
      const lastDay = itinerary.days[itinerary.days.length - 1];
      const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
      expect(returnAct.title).toContain("Kashmir");
      expect(returnAct.title).toContain("Delhi");
      expect(returnAct.title).toContain("Return Journey");
    });

    it("should include return journey in the last day title", () => {
      const lastDay = itinerary.days[itinerary.days.length - 1];
      expect(lastDay.title).toContain("Return Journey");
      expect(lastDay.title).toContain("Delhi");
    });

    it("should NOT have a return journey activity on Day 1", () => {
      const day1 = itinerary.days[0];
      const returnAct = day1.activities.find(a => a.isReturnJourney === true);
      expect(returnAct).toBeUndefined();
    });
  });

  // ── 5-day trip ──────────────────────────────────────────────
  describe("5-day trip", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));

    it("should have exactly 5 days", () => {
      expect(itinerary.days).toHaveLength(5);
    });

    it("should have a return journey activity only on Day 5 (last day)", () => {
      const lastDay = itinerary.days[4];
      const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
      expect(returnAct).toBeDefined();
      expect(returnAct.type).toBe("Return Transit");
    });

    it("should NOT have return journey on Days 1–4", () => {
      for (let i = 0; i < 4; i++) {
        const day = itinerary.days[i];
        const returnAct = day.activities.find(a => a.isReturnJourney === true);
        expect(returnAct).toBeUndefined();
      }
    });

    it("should include checkout info on last day morning", () => {
      const lastDay = itinerary.days[4];
      const morningAct = lastDay.activities.find(a => a.id.endsWith("-morning"));
      expect(morningAct.type).toBe("Checkout & Shopping");
      expect(morningAct.description).toContain("Check out");
      expect(morningAct.description).toContain("Kashmir Valley Boutique Resort");
    });
  });

  // ── 10-day trip ─────────────────────────────────────────────
  describe("10-day trip", () => {
    const itinerary = generateSmartItinerary(makePrefs(10));

    it("should have exactly 10 days", () => {
      expect(itinerary.days).toHaveLength(10);
    });

    it("should have a return journey activity only on Day 10 (last day)", () => {
      const lastDay = itinerary.days[9];
      const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
      expect(returnAct).toBeDefined();
      expect(returnAct.type).toBe("Return Transit");
    });

    it("should NOT have return journey on Days 1–9", () => {
      for (let i = 0; i < 9; i++) {
        const day = itinerary.days[i];
        const returnAct = day.activities.find(a => a.isReturnJourney === true);
        expect(returnAct).toBeUndefined();
      }
    });

    it("should have booking reminder in last day return description", () => {
      const lastDay = itinerary.days[9];
      const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
      expect(returnAct.description).toContain("Booking Reminder");
    });
  });
});

// ─────────────────────────────────────────────────────────────
// TEST SUITE: Transport Mode Consistency
// ─────────────────────────────────────────────────────────────

describe("Transport Mode Consistency", () => {

  it("should default to return flight when outbound is flight", () => {
    const itinerary = generateSmartItinerary(makePrefs(3, "flight"));
    expect(itinerary.selectedReturnTravel).toBeDefined();
    expect(itinerary.selectedReturnTravel.type).toBe("flight");
    expect(itinerary.selectedReturnTravel.id).toMatch(/^ret-flight/);
  });

  it("should default to return train when outbound is train", () => {
    const itinerary = generateSmartItinerary(makePrefs(3, "train"));
    expect(itinerary.selectedReturnTravel).toBeDefined();
    expect(itinerary.selectedReturnTravel.type).toBe("train");
    expect(itinerary.selectedReturnTravel.id).toMatch(/^ret-train/);
  });

  it("should default to return bus when outbound is bus", () => {
    const itinerary = generateSmartItinerary(makePrefs(3, "bus"));
    expect(itinerary.selectedReturnTravel).toBeDefined();
    expect(itinerary.selectedReturnTravel.type).toBe("bus");
    expect(itinerary.selectedReturnTravel.id).toMatch(/^ret-bus/);
  });

  it("should have reversed route on return travel (destination → origin)", () => {
    const itinerary = generateSmartItinerary(makePrefs(3, "flight"));
    const returnRoute = itinerary.selectedReturnTravel.route;
    // Return route should go from destination back to origin
    expect(returnRoute).toContain("Kashmir");
    expect(returnRoute).toContain("Delhi");
    // The return route should be reversed (destination first)
    const kashmirIdx = returnRoute.indexOf("Kashmir");
    const delhiIdx = returnRoute.indexOf("Delhi");
    expect(kashmirIdx).toBeLessThan(delhiIdx);
  });
});

// ─────────────────────────────────────────────────────────────
// TEST SUITE: Return Transit Data Completeness
// ─────────────────────────────────────────────────────────────

describe("Return Transit Data Completeness", () => {

  it("should have selectedReturnTravel populated (non-null)", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));
    expect(itinerary.selectedReturnTravel).not.toBeNull();
    expect(itinerary.selectedReturnTravel).toBeDefined();
  });

  it("should have availableReturnTravelOptions with flights, trains, and buses", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));
    const retOpts = itinerary.availableReturnTravelOptions;
    expect(retOpts).toBeDefined();
    expect(retOpts.flights).toBeDefined();
    expect(retOpts.flights.length).toBeGreaterThan(0);
    expect(retOpts.trains).toBeDefined();
    expect(retOpts.trains.length).toBeGreaterThan(0);
    expect(retOpts.buses).toBeDefined();
    expect(retOpts.buses.length).toBeGreaterThan(0);
  });

  it("selectedReturnTravel should have valid departure and arrival times", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));
    const ret = itinerary.selectedReturnTravel;
    expect(ret.departureTime).toBeTruthy();
    expect(ret.arrivalTime).toBeTruthy();
    expect(ret.duration).toBeTruthy();
    expect(ret.price).toBeTruthy();
    expect(ret.route).toBeTruthy();
  });

  it("return activity cost should include 'Return Ticket' label", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));
    const lastDay = itinerary.days[itinerary.days.length - 1];
    const returnAct = lastDay.activities.find(a => a.isReturnJourney === true);
    expect(returnAct.estCost).toContain("Return Ticket");
  });

  it("should include city (origin) in the returned itinerary", () => {
    const itinerary = generateSmartItinerary(makePrefs(5));
    expect(itinerary.city).toBe("Delhi");
  });
});
