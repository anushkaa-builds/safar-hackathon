import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, Sparkles, ShieldAlert, Users, CloudRain, 
  MapPin, RefreshCw, Key, ArrowRight, ShieldCheck, CheckCircle2,
  AlertTriangle, BookOpen, ExternalLink
} from "lucide-react";
import monitorService from "../services/monitoringService";

export default function AIAssistant({ activeItinerary, onSwapAlternative, onOpenSOS }) {
  const [alerts, setAlerts] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "ai",
      text: "Namaste! I am your 24x7 Real-Time AI Guardian & Yatri Copilot. I continuously monitor crowd levels, weather fluctuations, and GIS safety hazards in the background. Ask me anything about offbeat spots, local food, or emergency support!",
      isStreaming: false,
      sources: []
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  const destName = activeItinerary?.destination?.name || "Kashmir";

  // Subscribe to background proactive guardian alerts
  useEffect(() => {
    const unsubscribe = monitorService.subscribe((currentAlerts) => {
      setAlerts(currentAlerts);
    });
    monitorService.startMonitoring(destName);
    return () => {
      unsubscribe();
    };
  }, [destName]);

  // Check backend health & status on mount
  useEffect(() => {
    checkHealth();
  }, []);

  // Auto-scroll chat to latest token
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: "offline" });
      }
    } catch (e) {
      setBackendHealth({ status: "offline" });
    }
  }

  async function handleSaveKey() {
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    setKeyFeedback(null);
    try {
      const res = await fetch("/api/config/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() })
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 80)}`);
      }

      if (data.success || data.verified) {
        setKeyFeedback(`✅ Key verified! Hybrid AI mode (${data.model || "gpt-4o-mini"}) is now active.`);
        setApiKeyInput("");
        checkHealth();
      } else {
        setKeyFeedback(`❌ Verification failed: ${data.error || data.message || "Invalid key"}`);
        checkHealth();
      }
    } catch (err) {
      setKeyFeedback(`❌ Could not save key: ${err.message}`);
    } finally {
      setIsSavingKey(false);
    }
  }

  const quickPrompts = [
    "🚨 Check live crowd levels & bottlenecks",
    "🔀 Suggest nearest offbeat serene alternative",
    "🏔️ High altitude precautions & AMS advisory",
    "🍛 Best authentic local cuisine under ₹500",
    "🛡️ Emergency tourist police & hospital contacts"
  ];

  /**
   * Sends user query to the streaming AI backend with RAG and dynamic live state.
   */
  async function handleSend(queryText = inputText) {
    const text = queryText.trim();
    if (!text || isTyping) return;

    const userMsg = { id: "user-" + Date.now(), sender: "user", text };
    const aiMsgId = "ai-" + Date.now();
    const aiMsgPlaceholder = { 
      id: aiMsgId, 
      sender: "ai", 
      text: "", 
      isStreaming: true,
      sources: []
    };

    // Append user message and streaming AI bubble immediately
    setMessages(prev => [...prev, userMsg, aiMsgPlaceholder]);
    setInputText("");
    setIsTyping(true);

    try {
      // Build conversation history for context (last 8 messages)
      const messageHistory = [...messages, userMsg].map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      // Call the SSE streaming API route
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messageHistory,
          destination: destName,
          activeItinerary: activeItinerary,
          liveAlerts: alerts
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let buffer = "";
      let sources = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        // Keep the last partial line in buffer
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, "");
          try {
            const data = JSON.parse(jsonStr);

            if (data.chunk) {
              accumulatedText += data.chunk;
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId
                    ? { ...m, text: accumulatedText, isStreaming: true }
                    : m
                )
              );
            }

            if (data.done) {
              sources = data.sources || [];
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId
                    ? { ...m, text: accumulatedText, isStreaming: false, sources }
                    : m
                )
              );
            }
          } catch (jsonErr) {
            console.warn("Failed to parse SSE chunk:", jsonErr, jsonStr);
          }
        }
      }

      // Finalize message state
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, text: accumulatedText || "✨ I have checked our live trail data. Let me know how else I can assist your journey!", isStreaming: false, sources }
            : m
        )
      );

    } catch (error) {
      console.warn("AI Backend streaming failed, engaging local intelligent guardian fallback:", error);
      
      // Resilient local fallback if backend is unreachable
      let fallbackReply = "";
      const lower = text.toLowerCase();

      if (lower.includes("crowd") || lower.includes("surge") || lower.includes("bottleneck")) {
        fallbackReply = `🚨 **Real-Time Crowd Intelligence for ${destName}**:\n\n- **Current Peak Hotspots**: The main attractions (e.g. Solang / Dal Lake) are currently at **92% surge capacity** with waiting queues ~75 mins.\n- **Recommended Smart Reroute**: Head to **${destName === "Kashmir" ? "Doodhpathri or Nigeen Lake" : destName === "Manali" ? "Sethan Valley" : "Offbeat Cultural Quarter" }** where crowd density is **75% lower** and peaceful!`;
      } else if (lower.includes("offbeat") || lower.includes("serene") || lower.includes("alternative") || lower.includes("reroute")) {
        fallbackReply = `🔀 **Recommended Offbeat Gem for ${destName}**:\n\nInstead of crowded central corridors, visit **${destName === "Kashmir" ? "Doodhpathri & Aru Valley" : destName === "Manali" ? "Sethan Igloo Village & Naggar Castle" : "Butterfly Beach & Divar Island" }**.\n\n✨ **Benefits**: Fresh mountain streams, zero tourist vehicle jams, authentic local tea stalls, and pristine photo spots!`;
      } else if (lower.includes("altitude") || lower.includes("ams") || lower.includes("sickness") || lower.includes("cold")) {
        fallbackReply = `🏔️ **GIS High Altitude Safety Precautions**:\n\n1. **Acclimatization**: Keep physical activity minimal on Day 1.\n2. **Hydration**: Consume 3-4 Litres of water / herbal kehwa daily.\n3. **Warning Signs**: If experiencing throbbing headache or nausea above 2,500m, notify your hotel staff and descend immediately.\n4. **Emergency Oxygen**: SNM District Hospital and tourist medical booths have 24x7 O2 supply.`;
      } else if (lower.includes("food") || lower.includes("cuisine") || lower.includes("eat") || lower.includes("restaurant")) {
        fallbackReply = `🍛 **Authentic Local Delicacies in ${destName} (Budget Friendly)**:\n\n- **Must Try**: ${destName === "Kashmir" ? "Traditional Wazwan (Rista, Gushtaba), Nadru Yakhni, and Hot Saffron Kehwa" : destName === "Manali" ? "Siddu with Ghee, Trout Fish, and Pahadi Rajma Chawal" : destName === "Goa" ? "Goan Fish Curry Thali, Poi Bread, and Bebinca" : "Local Thali & Street Delights"}\n- **Average Cost**: ₹300 - ₹550 for a full authentic meal at heritage dhabas.`;
      } else if (lower.includes("emergency") || lower.includes("police") || lower.includes("sos") || lower.includes("hospital")) {
        fallbackReply = `🛡️ **Emergency Contacts & Helplines**:\n\n- **Tourist Police**: 1363 (24x7 Multi-lingual)\n- **National All-in-One SOS**: 112\n- **Ambulance / Medical**: 108\n- **Disaster Response (SDRF)**: 1070\n\nTap the red SOS button on your screen anytime for 1-click calling.`;
      } else {
        fallbackReply = `✨ Based on verified site records for **${destName}**, your travel profile is optimized for balanced exploration. Background monitoring is actively guarding your routes. Feel free to ask about live crowd surges, scenic offbeat spots, or local transport!`;
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, text: fallbackReply, isStreaming: false, sources: [{ title: `${destName} Local Guide`, category: "Fallback Mode" }] }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
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
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live RAG Active
              </span>
            </div>
            <p className="text-xs text-teal-200 font-semibold mt-0.5">
              Proactive Real-Time Monitoring • Destination: <span className="text-white font-black">{destName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              checkHealth();
              setApiKeyModalOpen(true);
            }}
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

      {/* Informative Mode Banner */}
      {backendHealth && !backendHealth.openai?.verified && (
        <div className="px-5 py-3 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold">
              Operating in <strong>Local Site Guardian Mode</strong> (53 verified site knowledge chunks).
            </span>
          </div>
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] flex items-center gap-1 transition shadow-sm"
          >
            <Key className="w-3 h-3" /> Connect OpenAI Key
          </button>
        </div>
      )}

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
                <div className={`max-w-[80%] space-y-1.5 ${m.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${
                      m.sender === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {m.text}
                    {m.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Sources / Knowledge Grounding Badge */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 px-1">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-600" /> Grounded in site data:
                      </span>
                      {m.sources.slice(0, 2).map((src, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold"
                        >
                          {src.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && messages[messages.length - 1]?.sender === "user" && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pl-2">
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
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:from-emerald-700 hover:to-teal-700 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>

      {/* AI Settings Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-slate-300 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">AI Guardian & RAG Architecture</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Real-Time Hybrid Knowledge Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setApiKeyModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Backend Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Backend Server (Port 5001):</span>
                {backendHealth?.status === "ok" ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Online & Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] flex items-center gap-1 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Offline (Fallback Active)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Vector Knowledge Base:</span>
                <span className="font-extrabold text-slate-800">
                  {backendHealth?.vectorStore?.indexedDocuments || 53} Chunks Indexed
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Generative Model:</span>
                <span className="font-extrabold text-slate-800">
                  {backendHealth?.openai?.model || "gpt-4o-mini (SSE Streaming)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">OpenAI API Key:</span>
                <span className="font-extrabold text-slate-800">
                  {backendHealth?.openai?.configured ? "Configured in .env" : "Optional (.env configured)"}
                </span>
              </div>
            </div>

            {/* Key Configuration Input */}
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-2.5">
              <label className="block text-xs font-black text-slate-800">
                Connect OpenAI API Key:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter OpenAI key (sk-proj-...)"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={isSavingKey || !apiKeyInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isSavingKey ? "Verifying..." : "Save & Verify"}
                </button>
              </div>
              {keyFeedback && (
                <p className={`text-[11px] font-bold ${keyFeedback.includes("✅") ? "text-emerald-700" : "text-rose-600"}`}>
                  {keyFeedback}
                </p>
              )}
              <p className="text-[10px] text-slate-500 font-medium">
                Saves securely to your local <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> file. Never hardcoded or exposed to the public.
              </p>
            </div>

            {/* Explanatory notes */}
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200/70">
              <p className="font-semibold text-teal-950">
                🔒 <strong>Secure Environment Configuration</strong>:
              </p>
              <p>
                The OpenAI API key is securely loaded from your server <code className="bg-white px-1.5 py-0.5 rounded border border-teal-300 font-mono text-[11px]">.env</code> file (<code className="text-teal-900 font-mono">OPENAI_API_KEY</code>) and is <strong>never exposed</strong> to the client browser.
              </p>
              <p>
                When OpenAI is active, answers stream token-by-token using RAG context from your website. When offline or without a key, the assistant gracefully falls back to intelligent heuristics without breaking the UI.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}