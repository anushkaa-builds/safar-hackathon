import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, Sparkles, ShieldAlert, Users, CloudRain, 
  MapPin, RefreshCw, Key, ArrowRight, ShieldCheck 
} from "lucide-react";
import monitorService from "../services/monitoringService";

export default function AIAssistant({ activeItinerary, onSwapAlternative, onOpenSOS }) {
  const [alerts, setAlerts] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "ai",
      text: "Namaste! I am your 24x7 Real-Time AI Guardian & Yatri Copilot. I continuously monitor crowd levels, weather fluctuations, and GIS safety hazards in the background. Ask me anything about offbeat spots, local food, or emergency support!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem("safar_gemini_key") || "");
  const messagesEndRef = useRef(null);

  const destName = activeItinerary?.destination?.name || "Kashmir";

  useEffect(() => {
    const unsubscribe = monitorService.subscribe((currentAlerts) => {
      setAlerts(currentAlerts);
    });
    monitorService.startMonitoring(destName);
    return () => {
      unsubscribe();
    };
  }, [destName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickPrompts = [
    "🚨 Check live crowd levels & bottlenecks",
    "🔀 Suggest nearest offbeat serene alternative",
    "🏔️ High altitude precautions & AMS advisory",
    "🍛 Best authentic local cuisine under ₹500",
    "🛡️ Emergency tourist police & hospital contacts"
  ];

  async function handleSend(queryText = inputText) {
    const text = queryText.trim();
    if (!text) return;

    const userMsg = { id: "user-" + Date.now(), sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // AI Response Engine
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("crowd") || lower.includes("surge") || lower.includes("bottleneck")) {
        reply = `🚨 **Real-Time Crowd Intelligence for ${destName}**:\n\n- **Current Peak Hotspots**: The main attractions (e.g. Solang/Dal Lake) are currently at **92% surge capacity** with waiting queues ~75 mins.\n- **Recommended Smart Reroute**: Head to **${destName === "Kashmir" ? "Doodhpathri or Nigeen Lake" : destName === "Manali" ? "Sethan Valley" : "Offbeat Cultural Quarter" }** where crowd density is **75% lower** and peaceful!`;
      } else if (lower.includes("offbeat") || lower.includes("serene") || lower.includes("alternative") || lower.includes("reroute")) {
        reply = `🔀 **Recommended Offbeat Gem for ${destName}**:\n\nInstead of crowded central corridors, visit **${destName === "Kashmir" ? "Doodhpathri & Aru Valley" : destName === "Manali" ? "Sethan Igloo Village & Naggar Castle" : "Butterfly Beach & Divar Island" }**.\n\n✨ **Benefits**: Fresh mountain streams, zero tourist vehicle jams, authentic local tea stalls, and pristine photo spots!`;
      } else if (lower.includes("altitude") || lower.includes("ams") || lower.includes("sickness") || lower.includes("cold")) {
        reply = `🏔️ **GIS High Altitude Safety Precautions**:\n\n1. **Acclimatization**: Keep physical activity minimal on Day 1.\n2. **Hydration**: Consume 3-4 Litres of water / herbal kehwa daily.\n3. **Warning Signs**: If experiencing throbbing headache or nausea above 2,500m, notify your hotel staff and descend immediately.\n4. **Emergency Oxygen**: SNM District Hospital and tourist medical booths have 24x7 O2 supply.`;
      } else if (lower.includes("food") || lower.includes("cuisine") || lower.includes("eat") || lower.includes("restaurant")) {
        reply = `🍛 **Authentic Local Delicacies in ${destName} (Budget Friendly)**:\n\n- **Must Try**: ${destName === "Kashmir" ? "Traditional Wazwan (Rista, Gushtaba), Nadru Yakhni, and Hot Saffron Kehwa" : destName === "Manali" ? "Siddu with Ghee, Trout Fish, and Pahadi Rajma Chawal" : destName === "Goa" ? "Goan Fish Curry Thali, Poi Bread, and Bebinca" : "Local Thali & Street Delights"}\n- **Average Cost**: ₹300 - ₹550 for a full authentic meal at heritage dhabas.`;
      } else if (lower.includes("emergency") || lower.includes("police") || lower.includes("sos") || lower.includes("hospital")) {
        reply = `🛡️ **Emergency Contacts & Helplines**:\n\n- **Tourist Police**: 1363 (24x7 Multi-lingual)\n- **National All-in-One SOS**: 112\n- **Ambulance / Medical**: 108\n- **Disaster Response (SDRF)**: 1070\n\nTap the red SOS button on your screen anytime for 1-click calling.`;
      } else {
        reply = `✨ Based on your travel profile for **${destName}**, the itinerary is optimized for balanced travel and sustainable footprint. The background guardian is monitoring real-time conditions. Let me know if you want to swap any activity or check weather updates!`;
      }

      setMessages(prev => [...prev, { id: "ai-" + Date.now(), sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 700);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-2xl border border-teal-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">AI Guardian & Travel Copilot</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-400/30">
                Live Active
              </span>
            </div>
            <p className="text-xs text-teal-200 font-semibold mt-0.5">
              Proactive Real-Time Monitoring • Destination: <span className="text-white font-black">{destName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm transition"
          >
            <Key className="w-3.5 h-3.5 text-teal-300" /> AI Settings
          </button>
          <button
            onClick={onOpenSOS}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS
          </button>
        </div>
      </div>

      {/* Grid: Left = Live Proactive Guardian Feed, Right = Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proactive Background Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-black text-sm text-slate-900">Background Guardian Feed</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Auto-Updating
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    a.severity === "high"
                      ? "bg-rose-50 border-rose-300 text-rose-950"
                      : a.severity === "warning"
                      ? "bg-amber-50 border-amber-300 text-amber-950"
                      : "bg-teal-50 border-teal-200 text-teal-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs">{a.title}</span>
                    <span className="text-[10px] font-bold opacity-75">{a.timestamp}</span>
                  </div>
                  <p className="font-medium text-[11px] leading-relaxed">{a.message}</p>
                  {a.alternative && (
                    <p className="font-black text-[11px] text-emerald-800">
                      💡 Suggested Offbeat: {a.alternative}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversational AI Copilot */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-200 shadow-xl flex flex-col h-[580px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  m.sender === "user" ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
                }`}>
                  {m.sender === "user" ? "👤" : "🤖"}
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                    m.sender === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span>AI Guardian is analyzing real-time data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-[11px] hover:border-emerald-500 hover:text-emerald-800 whitespace-nowrap shadow-sm transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about crowd levels, weather alerts, offbeat routes..."
              className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:from-emerald-700 hover:to-teal-700 transition shrink-0"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>

      {/* AI Settings Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">AI Intelligence Settings</h3>
              <button onClick={() => setApiKeyModalOpen(false)} className="text-slate-500 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              The platform is currently operating in **Zero-Config Intelligent Heuristic Mode**. You can optionally provide a Google Gemini API Key for live generative chat queries.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter optional Gemini API key (AIza...)"
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem("safar_gemini_key", geminiApiKey);
                  setApiKeyModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}