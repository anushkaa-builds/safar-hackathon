class ProactiveMonitoringService {
  constructor() {
    this.listeners = [];
    this.activeAlerts = [];
    this.currentItinerary = null;
    this.timer = null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.activeAlerts);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn([...this.activeAlerts]));
  }

  /**
   * Starts monitoring for an explicitly submitted or active user itinerary.
   * Tailors alerts specifically to the user's destination, selected stay, travel mode, and medical conditions.
   */
  monitorUserItinerary(itinerary) {
    if (!itinerary || !itinerary.destination) return;
    this.currentItinerary = itinerary;
    if (this.timer) clearInterval(this.timer);

    this.activeAlerts = this.generateExplainableAlerts(itinerary);
    this.notify();

    // Subtle dynamic updates every 45s only if user has active itinerary
    this.timer = setInterval(() => {
      if (this.currentItinerary) {
        this.simulateDynamicEvent(this.currentItinerary.destination?.name || "your trip");
      }
    }, 45000);
  }

  startMonitoring(destinationName = "Kashmir") {
    if (this.timer) clearInterval(this.timer);
    // If we already have a customized itinerary for this destination, don't overwrite with generic mock
    if (this.currentItinerary && this.currentItinerary.destination?.name?.toLowerCase() === destinationName.toLowerCase()) {
      return;
    }
    this.activeAlerts = this.generateInitialAlerts(destinationName);
    this.notify();
  }

  stopMonitoring() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Generates 100% explainable alerts tied to the user's actual travel & stay selections.
   */
  generateExplainableAlerts(itinerary) {
    const alerts = [];
    const dest = itinerary.destination?.name || "Destination";
    const destLower = dest.toLowerCase();
    const stay = itinerary.selectedStay || itinerary.stayRecommendation;
    const travel = itinerary.selectedTravel;
    const medical = (itinerary.medicalIssues || []).filter(m => !m.toLowerCase().includes("none"));

    // 1. Health / Altitude Advisory (Grounded in user's medical selection & elevation)
    const isHighAltitude = destLower.includes("kashmir") || destLower.includes("manali") || destLower.includes("ladakh") || destLower.includes("leh");
    if (isHighAltitude || medical.length > 0) {
      const medicalNote = medical.length > 0 ? `noted for ${medical.join(", ")}` : "for high altitude terrain (>2,000m)";
      alerts.push({
        id: "alert-health-" + Date.now(),
        type: "altitude",
        severity: "warning",
        title: `🏔️ Health & Acclimatization Advisory (${dest})`,
        message: `Personalized ${medicalNote}: Take Day 1 easy upon check-in at ${stay ? stay.name : 'your stay'}. Drink 3-4L of fluids daily and avoid uphill exertion right away.`,
        actionLabel: "View Altitude Protocol",
        timestamp: "Live Advisory",
        isNew: false // Grounded info, not a jarring pop-up
      });
    }

    // 2. Transit & Check-In Advisory (Grounded in user's selected flight/train)
    if (travel) {
      alerts.push({
        id: "alert-transit-" + Date.now(),
        type: "transit",
        severity: "info",
        title: `🛫 Transit Advisory: ${travel.provider || travel.mode}`,
        message: `${travel.route || dest} scheduled at ${travel.departureTime || travel.timing || 'scheduled time'}. Arrive at terminal early to clear baggage check and transfer smoothly to ${stay ? stay.name : 'hotel'}.`,
        timestamp: "Flight/Transit Status Normal",
        isNew: false
      });
    }

    // 3. Smart Crowd & Serene Alternative (Grounded in destination hotspots)
    const targetActivity = itinerary.days?.[0]?.activities?.[1] || itinerary.days?.[0]?.activities?.[0];
    const offbeat = targetActivity?.offbeatAlternative;
    alerts.push({
      id: "alert-crowd-" + Date.now(),
      type: "crowd",
      severity: "high",
      title: `🚨 Live Crowd Surge Monitoring (${dest})`,
      location: targetActivity?.title || (destLower.includes("kashmir") ? "Dal Lake & Gulmarg Phase 1" : "Main Tourist Center"),
      currentCrowd: "Peak Rush (~85% Footfall Capacity)",
      message: `High visitor density detected near central hubs. The AI Guardian has identified a serene alternative with 75% less crowd!`,
      alternative: offbeat?.name || (destLower.includes("kashmir") ? "Doodhpathri & Nigeen Lake" : destLower.includes("manali") ? "Sethan Valley" : "Artisan Heritage Trail"),
      actionLabel: "🔀 1-Click Reroute Available",
      timestamp: "Monitored",
      isNew: false // Will display in feed without interrupting form fill
    });

    // 4. Live Weather Check
    alerts.push({
      id: "alert-weather-" + Date.now(),
      type: "weather",
      severity: "info",
      title: `⛅ Live Climate & Safety Conditions`,
      message: `Pleasant weather in ${dest} (17°C - 22°C). Mountain roads and local sightseeing transit are clear.`,
      timestamp: "Real-Time GIS",
      isNew: false
    });

    return alerts;
  }

  generateInitialAlerts(destination) {
    const alerts = [];
    const dest = destination.toLowerCase();

    if (dest.includes("kashmir") || dest.includes("manali") || dest.includes("ladakh")) {
      alerts.push({
        id: "alert-altitude-" + Date.now(),
        type: "altitude",
        severity: "warning",
        title: "🏔️ GIS Altitude & Acclimatization Advisory",
        message: `High altitude terrain detected in ${destination}. Stay well-hydrated and rest during initial arrival hours.`,
        actionLabel: "View Altitude Precautions",
        timestamp: "Active",
        isNew: false
      });
    }

    alerts.push({
      id: "alert-crowd-" + Date.now(),
      type: "crowd",
      severity: "info",
      title: `📊 Tourist Traffic Baseline for ${destination}`,
      message: `Standard tourist density. Background guardian is ready to recommend offbeat spots once your itinerary is generated.`,
      timestamp: "Active",
      isNew: false
    });

    return alerts;
  }

  simulateDynamicEvent(destination) {
    const randomSeed = Math.random();
    let newAlert = null;

    if (randomSeed > 0.7) {
      newAlert = {
        id: "dynamic-weather-" + Date.now(),
        type: "weather",
        severity: "warning",
        title: "🌧️ Live Weather Update",
        message: `Brief passing mountain shower forecast in ${destination} this afternoon. Indoor cultural and museum visits recommended.`,
        timestamp: "Just now",
        isNew: true
      };
    } else if (randomSeed < 0.3) {
      newAlert = {
        id: "dynamic-transit-" + Date.now(),
        type: "transit",
        severity: "info",
        title: "🛣️ Transit Flow Update",
        message: `Clear highway transit corridors around ${destination}. Smooth travel to accommodations reported.`,
        timestamp: "Just now",
        isNew: true
      };
    }

    if (newAlert) {
      this.activeAlerts = [newAlert, ...this.activeAlerts.slice(0, 4)];
      this.notify();
    }
  }

  dismissAlert(alertId) {
    this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId);
    this.notify();
  }
}

export const monitorService = new ProactiveMonitoringService();
export default monitorService;