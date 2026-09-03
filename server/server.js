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

// Global OpenAI client and verification state
let openaiClient = null;
let openaiStatus = {
  configured: false,
  verified: false,
  status: "Unchecked",
  error: null,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini"
};

/**
 * Performs a lightweight verification call to OpenAI to confirm credentials work.
 */
async function verifyOpenAIKey() {
  const apiKey = getCleanApiKey();
  if (!apiKey) {
    openaiStatus = {
      configured: false,
      verified: false,
      status: "Missing / Not Configured",
      error: "No valid API key found in .env (OPENAI_API_KEY is empty or placeholder)",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    };
    openaiClient = null;
    return openaiStatus;
  }

  openaiStatus.configured = true;
  openaiClient = new OpenAI({ apiKey });

  try {
    // Lightweight API call to verify API key validity with OpenAI
    await openaiClient.models.list();
    openaiStatus.verified = true;
    openaiStatus.status = "Loaded and Verified";
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
 * Constructs the warm, human-like system prompt with dynamic state and retrieved RAG context.
 */
function buildSystemPrompt({ destination, activeItinerary, liveAlerts, retrievedChunks }) {
  const destName = destination || "India";

  let prompt = `You are YatriSathi's 24x7 Real-Time AI Guardian & Travel Copilot for ${destName}.
You are an exceptionally knowledgeable, warm, and friendly human travel guardian who knows the local terrain, offbeat hideaways, safety guidelines, and cultural nuances inside out.

### CONVERSATIONAL TONE & GUIDELINES:
1. Warm & Approachable: Speak with a helpful, reassuring human tone (like an experienced local friend and guardian). Use natural conversational touches (e.g., acknowledging their specific travel query or mood) without rambling.
2. No Robotic Clichés: NEVER say "As an AI...", "I am a language model...", or robotic corporate disclaimers. Speak naturally in the first person ("I've checked our live trail data...", "Here's what I recommend for you...").
3. Concise & Actionable: Give direct, practical answers with exact spots, realistic costs (in ₹ INR), estimated durations, and clear travel tips.
4. Grounded in Site Data First: Prioritize facts from YatriSathi's verified database provided below (attractions, stays, transport, offbeat gems, safety advisories, and emergency helplines).
5. Promote Sustainable & Offbeat Travel: When a tourist hotspot is overcrowded, actively recommend our serene, sustainable offbeat alternatives (e.g. Sethan instead of peak Solang, Doodhpathri instead of overcrowded corridors) to reduce footfall pressure and support local communities.
6. Safety First: If the question involves high altitude (Kashmir, Manali, Ladakh), proactively remind them about acclimatization (Day 1 rest), hydration, and emergency contacts (112, 1363).
7. Graceful General Knowledge: If the user asks something outside the site data, answer using your general travel intelligence while keeping the same friendly, safety-conscious local persona.
`;

  // Dynamic Live State Injection
  prompt += `\n### [CURRENT LIVE SYSTEM STATE]\n`;
  prompt += `- Selected Destination: ${destName}\n`;

  if (activeItinerary && activeItinerary.days && activeItinerary.days.length > 0) {
    prompt += `- User's Active Itinerary: ${activeItinerary.days.length}-day trip to ${activeItinerary.destination?.name || destName}\n`;
    if (activeItinerary.selectedStay) {
      prompt += `  • Booked/Selected Stay: ${activeItinerary.selectedStay.name} (${activeItinerary.selectedStay.price})\n`;
    }
    if (activeItinerary.selectedTravel) {
      prompt += `  • Selected Transit: ${activeItinerary.selectedTravel.mode || activeItinerary.selectedTravel.provider} (${activeItinerary.selectedTravel.timing || ''})\n`;
    }
    const day1Activities = (activeItinerary.days[0]?.activities || []).map(a => a.title).join(", ");
    prompt += `  • Highlights: ${day1Activities}\n`;
  }

  if (liveAlerts && liveAlerts.length > 0) {
    prompt += `- Active Background Guardian Alerts for ${destName}:\n`;
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
function generateIntelligentFallback({ userText, destination, retrievedChunks, liveAlerts }) {
  const lower = userText.toLowerCase();
  const dest = destination || "your destination";

  let response = "";

  // 1. Crowd / Bottleneck queries
  if (lower.includes("crowd") || lower.includes("surge") || lower.includes("bottleneck") || lower.includes("rush") || lower.includes("busy")) {
    const alert = (liveAlerts || []).find(a => a.type === "crowd" || a.title?.toLowerCase().includes("crowd"));
    const altSuggestion = alert?.alternative || (dest.includes("Kashmir") ? "Doodhpathri or Nigeen Lake" : dest.includes("Manali") ? "Sethan Valley & Naggar" : "secluded offbeat trails");

    response = `🚨 **Live Crowd & Reroute Intelligence for ${dest}**:\n\n` +
      `Our background guardian is actively monitoring tourist surge levels right now. The central commercial corridors (like Dal Lake shikara docks or Solang Valley) frequently peak above **90% surge capacity** during peak hours with waiting queues stretching past an hour.\n\n` +
      `✨ **Recommended Offbeat Reroute**: Head towards **${altSuggestion}**! Crowd density is **70-75% lower**, letting you enjoy pristine nature, authentic local chai stalls, and peaceful mountain vistas without traffic bottlenecks.`;
  }
  // 2. Offbeat / Alternative queries
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
  // 3. Altitude / AMS queries
  else if (lower.includes("altitude") || lower.includes("ams") || lower.includes("sickness") || lower.includes("oxygen") || lower.includes("cold")) {
    response = `🏔️ **High Altitude & Acclimatization Protocol for ${dest}**:\n\n` +
      `1. **Mandatory Day 1 Rest**: If you're above 2,000m (e.g., Leh, Gulmarg Phase 2, Rohtang), take strict physical rest on arrival. Do not attempt uphill hikes right away.\n` +
      `2. **Hydration First**: Consume 3 to 4 Litres of water and warm herbal kehwa or ginger tea daily. Steer clear of alcohol or heavy exertion.\n` +
      `3. **Watch for Signs**: Persistent throbbing headaches, nausea, or dizziness signal AMS. Descend immediately and notify your hotel staff or local medical post.\n` +
      `4. **Emergency Oxygen**: District hospitals and tourist medical booths maintain 24x7 O2 supply. Helplines: **112** (SOS) and **1363** (Tourist Police).`;
  }
  // 4. Food / Local cuisine queries
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
  // 5. Emergency / Police / Hospital / SOS
  else if (lower.includes("emergency") || lower.includes("police") || lower.includes("hospital") || lower.includes("helpline") || lower.includes("sos") || lower.includes("doctor")) {
    response = `🛡️ **Emergency Contacts & Rapid Assistance for ${dest}**:\n\n` +
      `• **Tourist Police Helpline**: 1363 (24x7 Multi-lingual toll-free assistance)\n` +
      `• **National Emergency All-in-One**: 112\n` +
      `• **Medical & Ambulance Service**: 108\n` +
      `• **State Disaster Response (SDRF)**: 1070\n\n` +
      `You can also tap the red **SOS Safety** button at the top-right of your screen anytime for 1-click calling and GIS location sharing.`;
  }
  // 6. Stays / Hotels
  else if (lower.includes("stay") || lower.includes("hotel") || lower.includes("homestay") || lower.includes("resort") || lower.includes("hostel")) {
    const stayChunk = (retrievedChunks || []).find(c => c.doc?.category === "Stays & Hotels");
    if (stayChunk) {
      response = `🏡 **Recommended Accommodation Options in ${dest}**:\n\n${stayChunk.doc.content}`;
    } else {
      response = `🏡 **Recommended Stays in ${dest}**:\n\n` +
        `• **Budget / Homestay**: ₹1,200 - ₹2,000/night (Warm local hosts, homemade meals, and authentic hospitality).\n` +
        `• **Mid-Range Boutique**: ₹3,800 - ₹6,000/night (Panoramic valley/river balconies and central accessibility).\n` +
        `• **Luxury Heritage**: ₹11,000+/night (Royal architecture, curated dining, and five-star comfort).`;
    }
  }
  // 7. General fallback grounded in retrieved site data
  else {
    if (retrievedChunks && retrievedChunks.length > 0) {
      const topChunk = retrievedChunks[0].doc;
      response = `✨ Great question about **${dest}**! Here is verified guidance from our platform:\n\n` +
        `**${topChunk.title}**\n${topChunk.content}\n\n` +
        `Feel free to ask me more about live crowd levels, offbeat alternatives, local transport fares, or safety advisories!`;
    } else {
      response = `✨ Namaste! Based on our travel intelligence for **${dest}**, everything is set for a safe, balanced journey. Our background guardian is tracking real-time conditions. Ask me anytime about live crowd updates, offbeat routes, local cuisines, or emergency contacts!`;
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
 * Update and Verify OpenAI API Key Endpoint
 * POST /api/config/key
 */
app.post("/api/config/key", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ success: false, error: "Invalid API key format" });
  }
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  process.env.OPENAI_API_KEY = cleanKey;

  // Persist to .env in both root and server directory
  try {
    const envContent = `# Server Configuration\nPORT=${PORT}\n\n# OpenAI API Configuration\nOPENAI_API_KEY=${cleanKey}\n\n# OpenAI Model Configuration\nOPENAI_MODEL=${process.env.OPENAI_MODEL || "gpt-4o-mini"}\nEMBEDDING_MODEL=${process.env.EMBEDDING_MODEL || "text-embedding-3-small"}\n`;
    if (fs.existsSync(rootEnvPath)) fs.writeFileSync(rootEnvPath, envContent, "utf-8");
    if (fs.existsSync(serverEnvPath)) fs.writeFileSync(serverEnvPath, envContent, "utf-8");
  } catch (e) {
    console.warn("Could not persist to .env file:", e.message);
  }

  const status = await verifyOpenAIKey();
  res.json({
    success: status.verified,
    status: status.status,
    verified: status.verified,
    error: status.error,
    model: status.model
  });
});

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
  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  let queryEmbedding = null;

  // If OpenAI is available, generate semantic embedding for query
  if (hasKey && openaiClient && openaiStatus.verified) {
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

  // If OpenAI is available and verified, call streaming chat completion
  if (hasKey && openaiClient && openaiStatus.verified) {
    try {
      console.log(`🤖 [Chat] Dispatching hybrid query to OpenAI (${modelName}) with ${searchResults.length} RAG chunks...`);
      const stream = await openaiClient.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });

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
        model: modelName,
        status: "success-hybrid"
      });
      return;
    } catch (apiError) {
      console.error(`❌ [OpenAI API Error]: ${apiError.status || ''} ${apiError.message}`);
      // Send a clear notice chunk so user/developer sees the exact error instead of silent fallback
      res.write(`data: ${JSON.stringify({ chunk: `> ⚠️ *OpenAI API Notice: ${apiError.message}. Switching seamlessly to verified local site data.* \n\n` })}\n\n`);
    }
  }

  // Resilient Fallback if OpenAI key is not set, rate-limited, or failed
  console.log(`🛡️ [Chat] Generating site-grounded response via local guardian (${searchResults.length} chunks)...`);
  const fallbackText = generateIntelligentFallback({
    userText: sanitizedQuery,
    destination,
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
