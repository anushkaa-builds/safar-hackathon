class ProactiveMonitoringService {
  constructor() {
    this.listeners = [];
    this.activeAlerts = [];
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

  startMonitoring(destinationName = "Kashmir") {
    if (this.timer) clearInterval(this.timer);
    this.activeAlerts = this.generateInitialAlerts(destinationName);
    this.notify();

    this.timer = setInterval(() => {
      this.simulateDynamicEvent(destinationName);
    }, 25000);
  }

  stopMonitoring() {
    if (this.timer) clearInterval(this.timer);
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
        message: "You are traveling in high altitude (>2,000m). Keep hydrated (3-4L water/day). Avoid sudden exertion during Day 1.",
        actionLabel: "View Altitude Precautions",
        timestamp: "Just now",
        isNew: true
      });
    }

    alerts.push({
      id: "alert-crowd-" + Date.now(),
      type: "crowd",
      severity: "high",
      title: "🚨 Real-Time Overcrowding Surge Detected",
      location: dest.includes("kashmir") ? "Dal Lake & Gulmarg Phase 1" : dest.includes("manali") ? "Solang Valley" : dest.includes("goa") ? "Baga Beach" : "Main Tourist Center",
      currentCrowd: "92% Capacity (Severe Queue > 75 mins)",
      message: "Heavy footfall surge detected. The system recommends rerouting to nearby serene alternative with 75% less crowd!",
      alternative: dest.includes("kashmir") ? "Doodhpathri / Nigeen Lake" : dest.includes("manali") ? "Sethan Valley" : dest.includes("goa") ? "Butterfly Beach" : "Artisan Heritage Trail",
      actionLabel: "🔀 1-Click Reroute Available",
      timestamp: "2 mins ago",
      isNew: true
    });

    alerts.push({
      id: "alert-weather-" + Date.now(),
      type: "weather",
      severity: "info",
      title: "⛅ Live Weather & Safety Forecast",
      message: "Clear skies with pleasant mountain breeze (18°C / 64°F). Great conditions for outdoor photography.",
      timestamp: "5 mins ago",
      isNew: false
    });

    return alerts;
  }

  simulateDynamicEvent(destination) {
    const randomSeed = Math.random();
    let newAlert = null;

    if (randomSeed > 0.6) {
      newAlert = {
        id: "dynamic-weather-" + Date.now(),
        type: "weather",
        severity: "warning",
        title: "🌧️ Weather Alert: Light Showers Forecasted",
        message: "Localized showers predicted in " + destination + " around 03:30 PM. Indoor museum / heritage stops recommended.",
        timestamp: "Live update",
        isNew: true
      };
    } else {
      newAlert = {
        id: "dynamic-traffic-" + Date.now(),
        type: "transit",
        severity: "info",
        title: "🛣️ Traffic Flow Optimization",
        message: "Main bypass route is clear. Multimodal transit on schedule with zero reported roadblocks.",
        timestamp: "Live update",
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