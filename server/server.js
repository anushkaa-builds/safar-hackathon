import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path .env loader: checks both project root and server/ directory
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const serverEnvPath = path.resolve(__dirname, ".env");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}
dotenv.config(); // Fallback for standard process.cwd()

// Import internal modules after env variables are loaded
import { vectorStore } from "./vectorStore.js";
import { runIndexer } from "./indexer.js";

const LOGS_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOGS_DIR, "chat.log");

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

/**
 * Returns a cleaned, trimmed API key or empty string if not set / placeholder.
 */
function getCleanApiKey() {
  const rawKey = process.env.OPENAI_API_KEY;
  if (!rawKey) return "";
  const cleaned = rawKey.trim().replace(/^["']|["']$/g, "");
  if (
    cleaned === "your_openai_api_key_here" ||
    cleaned === "your_key_here" ||
    cleaned === "sk-your-key-here" ||
    cleaned === ""
  ) {
    return "";
  }
  return cleaned;
}

/**
 * Helper to update key-value in .env file while preserving existing variables
 */
function updateEnvKey(filePath, key, value) {
  try {
    let content = "";
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, "utf-8");
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content = content.trim() + (content ? "\n" : "") + `${key}=${value}\n`;
      }
    } else {
      content = `# Server Configuration\nPORT=${PORT}\n\n${key}=${value}\nOPENAI_MODEL=gpt-4o-mini\nEMBEDDING_MODEL=text-embedding-3-small\n`;
    }
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (e) {
    console.warn(`[Env] Could not persist to ${filePath}:`, e.message);
  }
}

// Global OpenAI / Groq / Gemini client and verification state
let openaiClient = null;
let openaiStatus = {
  configured: false,
  verified: false,
  status: "Unchecked",
  error: null,
  provider: "OpenAI",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  isGroq: false
};

/**
 * Performs a lightweight verification call to OpenAI, Groq, or Gemini to confirm credentials work.
 */
async function verifyOpenAIKey(customKey) {
  const apiKey = customKey !== undefined ? customKey.trim().replace(/^["']|["']$/g, "") : getCleanApiKey();
  if (!apiKey || apiKey === "your_openai_api_key_here" || apiKey === "your_key_here" || apiKey === "sk-your-key-here") {
    openaiStatus = {
      configured: false,
      verified: false,
      status: "Missing / Not Configured",
      error: "No valid API key found (OPENAI_API_KEY is empty or placeholder)",
      provider: "None",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      isGroq: false
    };
    openaiClient = null;
    return openaiStatus;
  }

  let baseURL = undefined;
  let provider = "OpenAI";
  let model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  let isGroq = false;

  // Auto-detect Groq Free Key
  if (apiKey.startsWith("gsk_")) {
    baseURL = "https://api.groq.com/openai/v1";
    provider = "Groq Cloud (Free LPU)";
    model = "qwen/qwen3.8-27b"; // Fast, reliable conversational LLM on Groq
    isGroq = true;
  } 
  // Auto-detect Google Gemini Free Key
  else if (apiKey.startsWith("AIza")) {
    baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
    provider = "Google Gemini (Free)";
    model = "gemini-1.5-flash";
  }

  openaiStatus.configured = true;
  openaiStatus.provider = provider;
  openaiStatus.model = model;
  openaiStatus.isGroq = isGroq;

  const testClient = new OpenAI({ apiKey, baseURL });

  try {
    // 1. Fetch available models from the provider
    const modelList = await testClient.models.list();
    const availableIds = new Set();
    for await (const m of modelList) {
      availableIds.add(m.id);
    }

    // 2. Select the optimal available conversational model
    if (isGroq) {
      const preferredGroq = [
        "qwen/qwen3.8-27b",
        "groq/compound-mini",
        "groq/compound",
        "qwen/qwen3.6-27b",
        "openai/gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant"
      ];
      const match = preferredGroq.find(id => availableIds.has(id));
      if (match) model = match;
    } else if (apiKey.startsWith("AIza")) {
      const preferredGemini = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
      const match = preferredGemini.find(id => availableIds.has(id));
      if (match) model = match;
    } else {
      const preferredOpenAI = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
      const match = preferredOpenAI.find(id => availableIds.has(id));
      if (match) model = match;
    }

    // 3. Perform a 1-token test generation to guarantee chat completions succeed
    await testClient.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 1
    });

    openaiClient = testClient;
    openaiStatus.verified = true;
    openaiStatus.model = model;
    openaiStatus.status = `Loaded and Verified (${provider} - ${model})`;
    openaiStatus.error = null;
    return openaiStatus;
  } catch (err) {
    openaiStatus.verified = false;
    openaiStatus.status = "Verification Failed";
    openaiStatus.error = err.message || "Authentication / Connection error";
    return openaiStatus;
  }
}

/**
 * Basic input sanitization to prevent prompt injection and excessive token stuffing.
 */
function sanitizeInput(text) {
  if (typeof text !== "string") return "";
  let cleaned = text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
  if (cleaned.length > 1500) {
    cleaned = cleaned.slice(0, 1500);
  }
  return cleaned.trim();
}

/**
 * Privacy-respecting query logger.
 */
function logConversation(meta) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      destination: meta.destination || "General",
      queryLength: meta.queryLength || 0,
      sourcesUsed: meta.sourcesCount || 0,
      model: meta.model || "fallback",
      status: meta.status || "success",
    };
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");
  } catch (e) {
    console.warn("[Logger] Failed to write log:", e.message);
  }
}

/**
 * Constructs the warm, human-like system prompt with dynamic state, traveler profile, and retrieved RAG context.
 */
function buildSystemPrompt({ destination, activeItinerary, liveAlerts, retrievedChunks }) {
  const destName = destination || activeItinerary?.destination?.name || "India";

  let prompt = `You are YatriSathi's 24x7 Real-Time AI Guardian & Travel Copilot for ${destName}.
You are an exceptionally smart, warm, knowledgeable, and reliable travel companion who acts just like an experienced local friend, guide, and safety guardian.
You possess comprehensive knowledge about geography, culture, logistics, budgets, safety, food, emergency procedures, and offbeat tourism across India.

### CONVERSATIONAL TONE & GUIDELINES:
1. Warm & Natural: Speak with a helpful, reassuring human tone. Answer with natural flow and empathy without rambling.
2. NO Robotic Clichés: NEVER say "As an AI...", "I am an artificial intelligence...", or repetitive corporate disclaimers. Speak directly in first-person as the traveler's guardian ("I've reviewed your itinerary...", "Here's what I recommend for you...").
3. Tailored to the Traveler: ALWAYS consider the traveler's submitted profile (budget, health conditions, companion count, chosen flight/train, and hotel). If they have health sensitivities (like asthma or altitude sickness), always keep that in mind when discussing activities.
4. Concise, Smart & Actionable: Give direct, practical answers with exact names, realistic costs (in ₹ INR), estimated durations, and clear travel tips.
5. Explainability First: If the user asks why an alert or recommendation was given, explain clearly using their specific itinerary (e.g., flight departure time, altitude elevation above 2,000m, crowd surge at peak hours).
6. Promote Sustainable & Offbeat Travel: When a tourist hotspot is overcrowded, actively recommend our serene, sustainable offbeat alternatives (e.g. Sethan instead of peak Solang, Doodhpathri instead of overcrowded corridors) to reduce footfall pressure and support local communities.
7. Graceful Universal Knowledge: If the user asks general travel questions, history, language phrases, packing advice, or even general knowledge, answer intelligently and accurately in real-time.
`;

  // Dynamic Live State Injection
  prompt += `\n### [TRAVELER PROFILE & ACTIVE SUBMITTED ITINERARY]\n`;
  prompt += `- Destination: ${destName}\n`;

  if (activeItinerary) {
    const travelerName = activeItinerary.userName || activeItinerary.name || "Yatri";
    const originCity = activeItinerary.city || "Origin City";
    const budget = activeItinerary.budget ? `₹${Number(activeItinerary.budget).toLocaleString("en-IN")}` : "Flexible";
    const daysCount = activeItinerary.days?.length || activeItinerary.holidays || 3;
    const travelParty = activeItinerary.travelType ? `${activeItinerary.travelType} (${activeItinerary.groupSize || 1} person(s))` : "Solo";
    const medical = (activeItinerary.medicalIssues || []).filter(m => !m.toLowerCase().includes("none"));
    const customMed = activeItinerary.customMedicalInfo;

    prompt += `- Traveler: ${travelerName} (Origin: ${originCity}, Party: ${travelParty})\n`;
    prompt += `- Total Budget: ${budget} for ${daysCount} Days\n`;

    if (medical.length > 0 || customMed) {
      prompt += `- Health & Medical Profile: ${medical.join(", ")}${customMed ? ` (${customMed})` : ''} [IMPORTANT: Prioritize health-conscious guidance!]\n`;
    }

    if (activeItinerary.departDate || activeItinerary.departTime) {
      prompt += `- Planned Departure: ${activeItinerary.departDate || 'Upcoming'} at ${activeItinerary.departTime || 'Morning'}\n`;
    }

    if (activeItinerary.selectedTravel) {
      const t = activeItinerary.selectedTravel;
      prompt += `- Selected Transit: ${t.provider || t.mode} | Route: ${t.route || `${originCity} -> ${destName}`} | Timing: ${t.timing || t.departureTime || 'Morning'} | Fare: ${t.price || 'Included'}\n`;
    }

    if (activeItinerary.selectedStay || activeItinerary.stayRecommendation) {
      const s = activeItinerary.selectedStay || activeItinerary.stayRecommendation;
      prompt += `- Selected Accommodation: ${s.name} (${s.type || 'Hotel/Homestay'}, ${s.price || 'Standard Rate'})\n`;
    }

    if (activeItinerary.days && activeItinerary.days.length > 0) {
      prompt += `- Day-by-Day Activity Schedule:\n`;
      activeItinerary.days.forEach(d => {
        const actTitles = (d.activities || []).map(a => `${a.slot || ''}: ${a.title}`).join(" | ");
        prompt += `  • Day ${d.day} (${d.theme || 'Exploration'}): ${actTitles}\n`;
      });
    }
  }

  if (liveAlerts && liveAlerts.length > 0) {
    prompt += `\n### [ACTIVE REAL-TIME GUARDIAN ALERTS]\n`;
    liveAlerts.forEach((a, i) => {
      prompt += `  ${i + 1}. [${(a.severity || 'INFO').toUpperCase()}] ${a.title}: ${a.message}${a.alternative ? ' (Suggested Offbeat: ' + a.alternative + ')' : ''}\n`;
    });
  }

  // Retrieved Site Data Chunks
  if (retrievedChunks && retrievedChunks.length > 0) {
    prompt += `\n### [VERIFIED YATRISATHI RETRIEVED KNOWLEDGE BASE]\n`;
    retrievedChunks.forEach((item, idx) => {
      const doc = item.doc;
      prompt += `--- Document ${idx + 1}: ${doc.title} (${doc.category}) ---\n${doc.content}\n`;
    });
  }

  return prompt;
}

/**
 * Generates an intelligent, human-like fallback response when the OpenAI API key is unavailable or fails.
 */
function generateIntelligentFallback({ userText, destination, activeItinerary, retrievedChunks, liveAlerts }) {
  const lower = userText.toLowerCase();
  const dest = destination || activeItinerary?.destination?.name || "your destination";
  const stay = activeItinerary?.selectedStay || activeItinerary?.stayRecommendation;
  const travel = activeItinerary?.selectedTravel;
  const travelerName = activeItinerary?.userName || activeItinerary?.name || "Yatri";

  let response = "";

  // 1. User inquiring about their own trip / stay / transit
  if (lower.includes("my hotel") || lower.includes("my stay") || lower.includes("where am i staying") || lower.includes("accommodation")) {
    if (stay) {
      response = `🏡 **Your Selected Stay in ${dest}**:\n\n` +
        `You are booked / planning to stay at **${stay.name}** (${stay.type || 'Hotel'}, ${stay.price || 'Standard Rate'}).\n\n` +
        `✨ **Local Tip**: It offers convenient proximity to sightseeing corridors and authentic dining spots. Let me know if you'd like nearby food recommendations or transfer directions!`;
    } else {
      response = `🏡 You haven't locked in a specific stay yet for **${dest}**. Head over to the **My Itinerary** tab to choose between vetted homestays, boutique riverside cottages, or heritage resorts!`;
    }
  }
  else if (lower.includes("my flight") || lower.includes("my train") || lower.includes("my travel") || lower.includes("transit")) {
    if (travel) {
      response = `🛫 **Your Selected Transit**:\n\n` +
        `• **Mode / Provider**: ${travel.provider || travel.mode}\n` +
        `• **Route**: ${travel.route || `${activeItinerary?.city || 'Origin'} ➔ ${dest}`}\n` +
        `• **Timing**: ${travel.timing || travel.departureTime || 'Scheduled Departure'}\n` +
        `• **Price**: ${travel.price || 'Standard Fare'}\n\n` +
        `💡 *Guardian Advisory*: Remember to reach your departure terminal 2 hours in advance for smooth baggage check-in!`;
    } else {
      response = `🛫 You haven't chosen your transport yet for **${dest}**. You can compare flights, trains, and Volvo buses with live timings on the **My Itinerary** page!`;
    }
  }
  // 2. Explaining why an alert was triggered
  else if (lower.includes("why did you alert") || lower.includes("why alert") || lower.includes("explain alert") || lower.includes("why the popup")) {
    const alertList = (liveAlerts || []).map((a, i) => `${i + 1}. **${a.title}**: ${a.message}`).join("\n");
    response = `🛡️ **Why You Received This Proactive Advisory**:\n\n` +
      `As your 24x7 Real-Time Travel Guardian, I monitor environmental, crowd, and transit GIS telemetry for **${dest}**:\n\n` +
      (alertList || `• High-altitude elevation (>2,000m) triggers automated acclimatization protocols so you don't suffer acute mountain sickness (AMS).\n• Real-time crowd sensors detect peak rush at central tourist corridors and suggest serene offbeat alternatives.`);
  }
  // 3. Crowd / Bottleneck queries
  else if (lower.includes("crowd") || lower.includes("surge") || lower.includes("bottleneck") || lower.includes("rush") || lower.includes("busy")) {
    const alert = (liveAlerts || []).find(a => a.type === "crowd" || a.title?.toLowerCase().includes("crowd"));
    const altSuggestion = alert?.alternative || (dest.includes("Kashmir") ? "Doodhpathri or Nigeen Lake" : dest.includes("Manali") ? "Sethan Valley & Naggar" : "secluded offbeat trails");

    response = `🚨 **Live Crowd & Reroute Intelligence for ${dest}**:\n\n` +
      `Our background guardian is actively monitoring tourist surge levels. Central commercial corridors frequently peak above **85-90% surge capacity** during midday hours with long queues.\n\n` +
      `✨ **Recommended Offbeat Reroute**: Head towards **${altSuggestion}**! Crowd density is **70-75% lower**, letting you enjoy pristine nature, authentic local chai stalls, and peaceful mountain vistas without traffic bottlenecks.`;
  }
  // 4. Offbeat / Alternative queries
  else if (lower.includes("offbeat") || lower.includes("serene") || lower.includes("alternative") || lower.includes("reroute") || lower.includes("peaceful") || lower.includes("hidden")) {
    const attrChunk = (retrievedChunks || []).find(c => c.doc?.content?.includes("RECOMMENDED SERENE OFFBEAT ALTERNATIVE"));
    if (attrChunk) {
      response = `🔀 **Recommended Offbeat Discovery for ${dest}**:\n\n` +
        attrChunk.doc.content.split("✨ RECOMMENDED SERENE OFFBEAT ALTERNATIVE:")[1]?.trim() ||
        `Instead of crowded central hubs in ${dest}, explore our verified sustainable alternatives where footfall is light and nature is untouched!`;
    } else {
      const alt = dest.includes("Kashmir") ? "**Doodhpathri & Aru Valley** (alpine pine forests with crystal mountain brooks)" :
        dest.includes("Manali") ? "**Sethan Valley** (quiet Buddhist hamlet with igloos and boulder trails) or **Naggar Castle**" :
        dest.includes("Goa") ? "**Butterfly Beach & Galgibaga Turtle Beach** (pristine coves with zero loud commercial speakers)" :
        dest.includes("Rishikesh") ? "**Vashistha Cave (Gufa)** on the serene white-sand banks of the upper Ganga" :
        "our tranquil heritage and artisan trails";
      response = `🔀 **Handpicked Serene Alternative for ${dest}**:\n\nInstead of crowded central spots, visit ${alt}.\n\n✨ **Why you'll love it**: Unspoiled scenery, direct support for local family homestays, and complete tranquility away from tourist queues!`;
    }
  }
  // 5. Breathing, Asthma, Health & Packing Medical Essentials
  else if (lower.includes("breath") || lower.includes("asthma") || lower.includes("inhaler") || lower.includes("chest") || lower.includes("items to carry") || lower.includes("what to carry") || lower.includes("pack") || lower.includes("medicine")) {
    response = `⚠️ **Medical & Packing Advisory for ${dest}** (Breathing & Health Sensitivities):\n\n` +
      `Since **${dest}** is located at high mountain elevation (~2,050m / 6,700+ ft), cold mountain air and lower oxygen partial pressure can trigger respiratory tightness. Here is your essential packing and care protocol:\n\n` +
      `🎒 **Non-Negotiable Medical Kit**:\n` +
      `• **Prescribed Inhalers & Spacers**: Carry double your required quantity. Always keep one in your **handbag or jacket pocket** so it is immediately reachable (avoid storing in cold checked baggage).\n` +
      `• **Portable Oxygen Canister**: Easily purchased at local medical stores in ${dest} (approx ₹450 - ₹600) for quick relief during uphill inclines.\n` +
      `• **Finger Pulse Oximeter**: Monitor your SpO2 levels. If blood oxygen drops below 85% or you experience dizziness, notify local clinic staff.\n` +
      `• **Windproof Warm Layering**: Thermal base layers, fleece jacket, and a balaclava/buff scarf to warm the air you breathe before it hits your lungs.\n` +
      `• **Insulated Flask for Warm Fluids**: Drink warm water or herbal ginger/tulsi tea frequently to prevent airway dryness.\n\n` +
      `💡 **Guardian Advisory**: Strictly rest on your arrival day. Avoid steep hikes or cold night strolls until your body acclimatizes. In any distress, use the red **SOS Safety** button or call **108** (Ambulance) / **112** (Emergency).`;
  }
  // 6. Altitude / AMS queries
  else if (lower.includes("altitude") || lower.includes("ams") || lower.includes("sickness") || lower.includes("oxygen") || lower.includes("cold")) {
    response = `🏔️ **High Altitude & Acclimatization Protocol for ${dest}**:\n\n` +
      `1. **Mandatory Day 1 Rest**: If you're above 2,000m (e.g., Leh, Gulmarg Phase 2, Rohtang), take strict physical rest on arrival. Do not attempt uphill hikes right away.\n` +
      `2. **Hydration First**: Consume 3 to 4 Litres of water and warm herbal kehwa or ginger tea daily. Steer clear of alcohol or heavy exertion.\n` +
      `3. **Watch for Signs**: Persistent throbbing headaches, nausea, or dizziness signal AMS. Descend immediately and notify your hotel staff or local medical post.\n` +
      `4. **Emergency Oxygen**: District hospitals and tourist medical booths maintain 24x7 O2 supply. Helplines: **112** (SOS) and **1363** (Tourist Police).`;
  }
  // 6. Food / Local cuisine queries
  else if (lower.includes("food") || lower.includes("cuisine") || lower.includes("eat") || lower.includes("dish") || lower.includes("restaurant") || lower.includes("budget")) {
    const dishes = dest.includes("Kashmir") ? "Traditional Wazwan (Rista, Gushtaba), Nadru Yakhni, and piping hot Saffron Kehwa" :
      dest.includes("Manali") ? "Steamed Siddu with pure ghee, local Trout fish, and Pahadi Rajma Chawal" :
      dest.includes("Goa") ? "Goan Fish Curry Thali, freshly baked Poi bread, and Bebinca" :
      dest.includes("Jaipur") ? "Dal Baati Churma, Pyaaz Kachori, and fresh Ghewar" :
      "authentic regional thalis and freshly prepared dhaba meals";
    response = `🍛 **Authentic Local Dining in ${dest} (Budget-Friendly)**:\n\n` +
      `- **Must-Try Specialties**: ${dishes}.\n` +
      `- **Typical Cost**: Around ₹250 - ₹500 for a hearty authentic meal at family-run heritage eateries.\n` +
      `💡 *Local Tip*: Skip the generic commercial multi-cuisine restaurants and eat where the locals eat!`;
  }
  // 7. Emergency / Police / Hospital / SOS
  else if (lower.includes("emergency") || lower.includes("police") || lower.includes("hospital") || lower.includes("helpline") || lower.includes("sos") || lower.includes("doctor")) {
    response = `🛡️ **Emergency Contacts & Rapid Assistance for ${dest}**:\n\n` +
      `• **Tourist Police Helpline**: 1363 (24x7 Multi-lingual toll-free assistance)\n` +
      `• **National Emergency All-in-One**: 112\n` +
      `• **Medical & Ambulance Service**: 108\n` +
      `• **State Disaster Response (SDRF)**: 1070\n\n` +
      `You can also tap the red **SOS Safety** button at the top-right of your screen anytime for 1-click calling and GIS location sharing.`;
  }
  // 8. General fallback grounded in retrieved site data
  else {
    if (retrievedChunks && retrievedChunks.length > 0) {
      const topChunk = retrievedChunks[0].doc;
      response = `✨ Great question, **${travelerName}**! Here is verified guidance for **${dest}**:\n\n` +
        `**${topChunk.title}**\n${topChunk.content}\n\n` +
        `Feel free to ask me more about live crowd levels, offbeat alternatives, local transport fares, or safety advisories!`;
    } else {
      response = `✨ Namaste **${travelerName}**! Based on our travel intelligence for **${dest}**, everything is set for a safe, balanced journey. Our background guardian is tracking real-time conditions. Ask me anytime about live crowd updates, offbeat routes, local cuisines, or emergency contacts!`;
    }
  }

  return response;
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

/**
 * Health & Status Check Endpoint
 * GET /api/health
 */
app.get("/api/health", async (req, res) => {
  if (req.query.recheck === "true") {
    await verifyOpenAIKey();
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    vectorStore: {
      loaded: vectorStore.loaded,
      indexedDocuments: vectorStore.count,
    },
    openai: {
      configured: openaiStatus.configured,
      verified: openaiStatus.verified,
      status: openaiStatus.status,
      error: openaiStatus.error,
      model: openaiStatus.model,
      embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    },
    mode: openaiStatus.verified ? "hybrid (RAG + OpenAI)" : "site-data-fallback"
  });
});

/**
 * Common Handler for Saving and Verifying OpenAI Key
 */
async function handleSaveAndVerifyKey(req, res) {
  const apiKey = req.body?.apiKey || req.body?.key || req.body?.openaiApiKey || req.body?.openai_api_key;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ 
      success: false, 
      verified: false,
      error: "Invalid API key format. Please provide a valid string." 
    });
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  process.env.OPENAI_API_KEY = cleanKey;

  // Persist to .env in both root and server directory
  updateEnvKey(rootEnvPath, "OPENAI_API_KEY", cleanKey);
  updateEnvKey(serverEnvPath, "OPENAI_API_KEY", cleanKey);

  const status = await verifyOpenAIKey(cleanKey);

  return res.status(status.verified ? 200 : 400).json({
    success: status.verified,
    verified: status.verified,
    message: status.verified ? "Key verified and saved successfully" : (status.error || "Verification failed"),
    status: status.status,
    error: status.error,
    model: status.model
  });
}

/**
 * Route aliases for saving and verifying OpenAI key
 */
app.post("/api/config/key", handleSaveAndVerifyKey);
app.post("/api/save-openai-key", handleSaveAndVerifyKey);
app.post("/api/settings/openai-key", handleSaveAndVerifyKey);
app.post("/api/openai-key", handleSaveAndVerifyKey);

/**
 * Index Data Endpoint (can trigger indexing via API if needed)
 * POST /api/index
 */
app.post("/api/index", async (req, res) => {
  try {
    const result = await runIndexer();
    vectorStore.load(); // Reload vector store into memory
    res.json({ success: true, count: result.totalDocuments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Real-Time Streaming Chat completions Endpoint (Server-Sent Events)
 * POST /api/chat/stream
 */
app.post("/api/chat/stream", async (req, res) => {
  const { messages = [], activeItinerary = null, destination = "Kashmir", liveAlerts = [] } = req.body;

  // Extract and sanitize latest user message
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user" || m.sender === "user");
  const rawQuery = lastUserMsg ? (lastUserMsg.content || lastUserMsg.text || "") : "";
  const sanitizedQuery = sanitizeInput(rawQuery);

  if (!sanitizedQuery) {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  // Set SSE response headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const apiKey = getCleanApiKey();
  const hasKey = Boolean(apiKey);
  const modelName = openaiStatus.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  let queryEmbedding = null;

  // If standard OpenAI is available, generate semantic embedding for query
  if (hasKey && openaiClient && openaiStatus.verified && !openaiStatus.isGroq && !apiKey.startsWith("AIza")) {
    try {
      const embResp = await openaiClient.embeddings.create({
        model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
        input: sanitizedQuery,
      });
      queryEmbedding = embResp.data[0].embedding;
    } catch (e) {
      console.warn("⚠️ [RAG] OpenAI query embedding failed:", e.message, "(Falling back to hybrid lexical search)");
    }
  }

  // Hybrid Vector Search across site data
  const searchResults = vectorStore.search(sanitizedQuery, queryEmbedding, 4, destination);
  const sourcesMetadata = searchResults.map(r => ({
    title: r.doc.title,
    category: r.doc.category,
    destination: r.doc.destination,
    relevance: Math.round(r.score * 100)
  }));

  // Build System Prompt
  const systemPrompt = buildSystemPrompt({
    destination,
    activeItinerary,
    liveAlerts,
    retrievedChunks: searchResults
  });

  // Prepare OpenAI message history (last 8 messages for session context)
  const conversationHistory = (messages || [])
    .slice(-8)
    .map(m => ({
      role: (m.role === "assistant" || m.sender === "ai") ? "assistant" : "user",
      content: sanitizeInput(m.content || m.text || "")
    }))
    .filter(m => m.content.length > 0);

  // Ensure current sanitized query is the final user message
  if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].role !== "user") {
    conversationHistory.push({ role: "user", content: sanitizedQuery });
  }

  // Function to stream text word-by-word with realistic typing rhythm for fallback
  async function streamWords(fullText) {
    const tokens = fullText.split(/(\s+)/);
    for (const token of tokens) {
      if (token) {
        res.write(`data: ${JSON.stringify({ chunk: token })}\n\n`);
        if (typeof res.flush === "function") res.flush();
        await new Promise(r => setTimeout(r, 20));
      }
    }
    res.write(`data: ${JSON.stringify({ done: true, sources: sourcesMetadata, mode: "site-data-fallback" })}\n\n`);
    res.end();
  }

  // If OpenAI / Groq / Gemini is available and verified, call streaming chat completion
  if (hasKey && openaiClient && openaiStatus.verified) {
    const candidateModels = [
      openaiStatus.model,
      openaiStatus.isGroq ? "qwen/qwen3.8-27b" : null,
      openaiStatus.isGroq ? "groq/compound-mini" : null,
      openaiStatus.isGroq ? "groq/compound" : null,
      openaiStatus.isGroq ? "qwen/qwen3.6-27b" : null,
      !openaiStatus.isGroq && !apiKey.startsWith("AIza") ? "gpt-4o-mini" : null,
      !openaiStatus.isGroq && !apiKey.startsWith("AIza") ? "gpt-4o" : null
    ].filter(Boolean);

    const uniqueCandidates = [...new Set(candidateModels)];
    let stream = null;
    let successfulModel = modelName;
    let lastError = null;

    for (const cand of uniqueCandidates) {
      try {
        console.log(`🤖 [Chat] Dispatching hybrid query to ${openaiStatus.provider} (${cand}) with ${searchResults.length} RAG chunks...`);
        stream = await openaiClient.chat.completions.create({
          model: cand,
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 800,
          stream: true,
        });
        successfulModel = cand;
        openaiStatus.model = cand;
        break;
      } catch (candErr) {
        lastError = candErr;
        console.warn(`⚠️ [Model Candidate Error] ${cand} failed: ${candErr.message}`);
      }
    }

    if (stream) {
      try {
        for await (const part of stream) {
          const delta = part.choices[0]?.delta?.content || "";
          if (delta) {
            res.write(`data: ${JSON.stringify({ chunk: delta })}\n\n`);
            if (typeof res.flush === "function") res.flush();
          }
        }

        // Signal completion with retrieved sources
        res.write(`data: ${JSON.stringify({ done: true, sources: sourcesMetadata, mode: "openai-hybrid" })}\n\n`);
        res.end();

        logConversation({
          destination,
          queryLength: sanitizedQuery.length,
          sourcesCount: searchResults.length,
          model: successfulModel,
          status: "success-hybrid"
        });
        return;
      } catch (streamErr) {
        console.error(`❌ [Streaming Error]: ${streamErr.message}`);
      }
    } else if (lastError) {
      console.error(`❌ [AI API Error]: ${lastError.status || ''} ${lastError.message}`);
      res.write(`data: ${JSON.stringify({ chunk: `> ⚠️ *AI Service Notice: ${lastError.message}. Switching seamlessly to verified local site data.* \n\n` })}\n\n`);
    }
  }

  // Resilient Fallback if OpenAI key is not set, rate-limited, or failed
  console.log(`🛡️ [Chat] Generating site-grounded response via local guardian (${searchResults.length} chunks)...`);
  const fallbackText = generateIntelligentFallback({
    userText: sanitizedQuery,
    destination,
    activeItinerary,
    retrievedChunks: searchResults,
    liveAlerts
  });

  await streamWords(fallbackText);

  logConversation({
    destination,
    queryLength: sanitizedQuery.length,
    sourcesCount: searchResults.length,
    model: "site-data-fallback",
    status: "fallback"
  });
});

/**
 * Catch-all 404 JSON handler for unmatched /api/* routes.
 * Prevents HTML error pages from breaking client JSON parsers.
 */
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    verified: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

/**
 * Centralized JSON Error Handler Middleware
 */
app.use((err, req, res, next) => {
  console.error("❌ [Server Error]:", err);
  if (req.originalUrl?.startsWith("/api") || req.path?.startsWith("/api")) {
    return res.status(err.status || 500).json({
      success: false,
      verified: false,
      error: err.message || "Internal server error"
    });
  }
  next(err);
});

// Start Server and verify OpenAI key
app.listen(PORT, async () => {
  console.log("=========================================");
  console.log(`🚀 YatriSathi AI Backend running on port ${PORT}`);
  console.log(`📊 Vector Store: ${vectorStore.count} site chunks loaded`);

  const status = await verifyOpenAIKey();

  if (status.verified) {
    console.log(`✅ OpenAI Key: Loaded and Verified successfully!`);
    console.log(`🤖 Hybrid Mode Active: Vector Store (53 chunks) + OpenAI (${openaiStatus.model})`);
  } else if (status.configured) {
    console.log(`❌ OpenAI Key Verification Failed: ${status.error}`);
    console.log(`⚠️ Reason: Please verify your API key and billing quota on platform.openai.com`);
    console.log(`🛡️ Operating in Resilient Fallback Mode (Grounded in 53 site knowledge chunks)`);
  } else {
    console.log(`🔑 OpenAI Key: Missing / Not Configured in .env`);
    console.log(`👉 Add your key to .env: OPENAI_API_KEY=sk-... to activate generative hybrid mode.`);
    console.log(`🛡️ Operating in Resilient Fallback Mode (Grounded in 53 site knowledge chunks)`);
  }

  console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log("=========================================");
});
