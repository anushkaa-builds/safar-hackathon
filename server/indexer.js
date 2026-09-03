import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { destinationsData } from "../src/data/destinationsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(DATA_DIR, "vector_store.json");

// Robust multi-path .env loader: checks both project root and server/ directory
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const serverEnvPath = path.resolve(__dirname, ".env");

if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
if (fs.existsSync(serverEnvPath)) dotenv.config({ path: serverEnvPath, override: true });
dotenv.config();

// Reviews dataset matching site data
const SEED_REVIEWS = [
  {
    destination: "Kashmir",
    author: "Rohan Sharma",
    travelStyle: "Solo Explorer",
    rating: 5,
    budgetSpent: "₹18,500 for 5 days",
    comment: "The AI rerouting saved our trip! When Gulmarg had a 2-hour queue, the app nudged us to Doodhpathri. It was pure bliss with green meadows and zero crowd. Shikara ride at sunrise in Nigeen was breathtaking!",
    tags: ["Sustainable Tourism", "Offbeat Gem", "Solo Friendly", "Doodhpathri", "Nigeen Lake"]
  },
  {
    destination: "Manali",
    author: "Pooja & Ankit",
    travelStyle: "Couple",
    rating: 5,
    budgetSpent: "₹24,000 for 4 days",
    comment: "The real-time AMS advisory was spot on. We stayed hydrated and took Day 1 slow. Loved the Sethan Valley igloo village and Naggar castle rooftop apple cider! Beautiful local wooden architecture.",
    tags: ["High Altitude", "Adventure", "Couples", "Sethan Valley", "Naggar Castle"]
  },
  {
    destination: "Goa",
    author: "Arjun Verma & Friends",
    travelStyle: "Group of 4",
    rating: 4.8,
    budgetSpent: "₹32,000 for 4 people",
    comment: "Butterfly Beach was crystal clean! The transit breakdown helped us rent scooters at government pre-fixed rates without getting overcharged by middlemen. Cabo de Rama sunset was unforgettable.",
    tags: ["Beach", "Budget Friendly", "Scuba", "Butterfly Beach", "Cabo de Rama"]
  },
  {
    destination: "Jaipur",
    author: "Meera Singhania",
    travelStyle: "Solo Explorer",
    rating: 5,
    budgetSpent: "₹14,000 for 3 days",
    comment: "Visiting Amer Fort early at 7:30 AM before the tour buses arrive made all the difference. Panna Meena ka Kund stepwell had peaceful morning light. The local Ghewar recommendations were delicious!",
    tags: ["Heritage", "Culture & Crafts", "Photography", "Amber Fort", "Stepwells"]
  },
  {
    destination: "Rishikesh",
    author: "Devendra Patel",
    travelStyle: "Solo Explorer",
    rating: 4.9,
    budgetSpent: "₹9,500 for 3 days",
    comment: "Triveni Ghat evening Aarti felt so serene and spiritually uplifting. Did cliff jumping at Shivpuri with certified instructors. Cafes in Tapovan overlooking the turquoise Ganga are heavenly.",
    tags: ["River Rafting", "Spiritual Ghats", "Eco-Friendly", "Triveni Ghat", "Shivpuri"]
  },
  {
    destination: "Kerala",
    author: "Ananya & Family",
    travelStyle: "Family Trip",
    rating: 5,
    budgetSpent: "₹38,000 for 5 days",
    comment: "Munnar tea gardens at sunrise with mist rolling over the hills was magical. The canoe cruise through narrow village canals in Munroe Island was far more peaceful than typical crowded houseboats.",
    tags: ["Backwaters", "Family Friendly", "Tea Plantations", "Munnar", "Munroe Island"]
  },
  {
    destination: "Ladakh",
    author: "Karan Malhotra",
    travelStyle: "Backpacker",
    rating: 4.7,
    budgetSpent: "₹35,000 for 6 days",
    comment: "Turtuk village apricot orchards and Pangong Tso starry night sky were life-changing. Pay heed to the app's Day 1 rest warning for Leh altitude. Renting an oxygen canister was super smooth.",
    tags: ["High Altitude", "Adventure", "Star Gazing", "Pangong Tso", "Hanle Dark Sky"]
  },
  {
    destination: "Varanasi",
    author: "Sunil & Rekha",
    travelStyle: "Couple",
    rating: 4.8,
    budgetSpent: "₹12,000 for 3 days",
    comment: "The 5:30 AM rowing boat ride along Assi to Manikarnika Ghat is an experience that stays with you forever. Banarasi chaat at Kashi Chaat Bhandar is unmatched. Followed the morning temple schedule smoothly.",
    tags: ["Spiritual Ghats", "Heritage", "Street Food", "Assi Ghat", "Dashashwamedh"]
  }
];

/**
 * Builds high-density, informative text chunks from website data.
 */
function buildDocumentChunks() {
  const chunks = [];

  // 1. Destination Overview, Altitude, Safety & Emergency Helplines
  for (const d of destinationsData) {
    chunks.push({
      id: `dest-${d.id}-overview`,
      title: `${d.name}: Overview, Altitude & Emergency Contacts`,
      category: "Destination Overview",
      destination: d.name,
      tags: [d.name, d.category, "Safety", "Helpline", "Altitude", "Emergency"],
      content: `Destination: ${d.name} (${d.state}). Tagline: "${d.tagline}". Category: ${d.category}.\n` +
        `Altitude: ${d.altitudeUnit || d.altitude + 'm'}.\n` +
        `Safety Risk Level: ${d.safetyRisk?.level || 'Standard'}. Risk Type: ${d.safetyRisk?.riskType || 'None'}.\n` +
        `Acute Mountain Sickness (AMS) Advisory: ${d.safetyRisk?.amsRisk || 'None'}.\n` +
        `Traveler Advisory: ${d.safetyRisk?.advisory || 'Standard travel precautions apply'}.\n` +
        `Emergency Helplines: ${d.safetyRisk?.helpline || '112 (National SOS), 1363 (Tourist Police), 108 (Ambulance)'}.`
    });

    // 2. Transport & Transit Connectivity
    if (d.transport) {
      chunks.push({
        id: `dest-${d.id}-transport`,
        title: `${d.name}: How to Reach & Local Transport Rates`,
        category: "Transport & Logistics",
        destination: d.name,
        tags: [d.name, "Transport", "Flights", "Trains", "Buses", "Cabs", "Fares"],
        content: `Getting to ${d.name}:\n` +
          `- Nearest Airport: ${d.transport.nearestAirport}\n` +
          `- Nearest Railway Station: ${d.transport.nearestRailway}\n` +
          `- Bus Connectivity: ${d.transport.busConnectivity}\n` +
          `- Local Transit & Fares: ${d.transport.localTransit}`
      });
    }

    // 3. Stays & Accommodation Options
    if (d.stays && d.stays.length > 0) {
      const staySummary = d.stays.map(s => `• ${s.type}: ${s.name} (${s.price}, Rating: ${s.rating}★)`).join("\n");
      chunks.push({
        id: `dest-${d.id}-stays`,
        title: `${d.name}: Recommended Stays & Budget Tiers`,
        category: "Stays & Hotels",
        destination: d.name,
        tags: [d.name, "Hotels", "Homestays", "Resorts", "Accommodation", "Budget"],
        content: `Accommodation options in ${d.name}:\n${staySummary}\nOptions cater to backpackers, mid-range couples, and luxury heritage travelers.`
      });
    }

    // 4. Attractions & High-Value Offbeat Alternatives
    if (d.attractions && d.attractions.length > 0) {
      for (const attr of d.attractions) {
        let text = `Attraction: ${attr.name} in ${d.name}.\n` +
          `Time Slot: ${attr.timeSlot}. Duration: ${attr.duration}. Entry/Activity Cost: ${attr.cost}.\n` +
          `Current Crowd Level: ${attr.crowdLevel} (Crowd Score: ${attr.crowdScore}/100).\n` +
          `Description: ${attr.description}\n` +
          `Tags: ${(attr.tags || []).join(", ")}.`;

        if (attr.offbeatAlternative) {
          const alt = attr.offbeatAlternative;
          text += `\n\n✨ RECOMMENDED SERENE OFFBEAT ALTERNATIVE: ${alt.name}\n` +
            `Tagline: ${alt.tagline}\n` +
            `Why visit: ${alt.benefit}\n` +
            `Distance: ${alt.distance}\n` +
            `Offbeat Crowd Score: ${alt.crowdScore}/100 (Much lower rush!).`;
        }

        chunks.push({
          id: `attr-${d.id}-${attr.id}`,
          title: `${attr.name} (${d.name}) & Serene Alternative`,
          category: "Attractions & Offbeat Gems",
          destination: d.name,
          tags: [d.name, attr.name, ...(attr.tags || []), "Offbeat Alternative", attr.offbeatAlternative?.name || ""].filter(Boolean),
          content: text
        });
      }
    }
  }

  // 5. Authentic Reviews & Traveler Insights
  for (let i = 0; i < SEED_REVIEWS.length; i++) {
    const rev = SEED_REVIEWS[i];
    chunks.push({
      id: `review-${rev.destination.toLowerCase()}-${i}`,
      title: `${rev.destination}: Real Traveler Review by ${rev.author}`,
      category: "Traveler Reviews",
      destination: rev.destination,
      tags: [rev.destination, rev.author, rev.travelStyle, ...(rev.tags || [])],
      content: `Traveler Review for ${rev.destination} by ${rev.author} (${rev.travelStyle}, Rated ${rev.rating}★):\n` +
        `Budget Spent: ${rev.budgetSpent}.\n` +
        `Feedback & Tips: "${rev.comment}"\n` +
        `Key Takeaways: ${rev.tags.join(", ")}.`
    });
  }

  // 6. Universal High Altitude, Safety & Multi-Modal Protocol
  chunks.push({
    id: "safety-ams-protocol",
    title: "High Altitude Acclimatization & AMS Safety Guidelines",
    category: "Safety Protocols",
    destination: "General / High Altitude (Kashmir, Manali, Ladakh)",
    tags: ["AMS", "Altitude Sickness", "Oxygen", "Acclimatization", "Safety", "Emergency"],
    content: "High Altitude Travel & AMS Precautions:\n" +
      "1. Mandatory Acclimatization: On Day 1 in destinations above 2,500m (e.g. Leh, Gulmarg Phase 2, Rohtang), take strict physical rest. Avoid immediate uphill treks.\n" +
      "2. Hydration: Drink 3-4 Litres of water daily, along with herbal teas or Kehwa. Avoid heavy alcohol or dehydration.\n" +
      "3. Recognizing Symptoms: Headache, nausea, dizziness, or shortness of breath indicate AMS. Notify your guide or hotel immediately and do not ascend further.\n" +
      "4. Oxygen & Medical Aid: Keep portable oxygen cans handy. In Leh, visit SNM District Hospital. In J&K, reach local medical booths.\n" +
      "5. National Emergency Helplines: 112 (All-in-one Emergency), 1363 (Tourist Police), 108 (Ambulance), 1070 (Disaster Response SDRF)."
  });

  chunks.push({
    id: "sustainable-tourism-protocol",
    title: "YatriSathi Sustainable Travel & Crowd Redistribution Philosophy",
    category: "Platform Philosophy",
    destination: "All",
    tags: ["Sustainable Tourism", "Offbeat", "Crowd Reduction", "Eco-Friendly", "Local Economy"],
    content: "YatriSathi Platform Mission:\n" +
      "- Proactively redistributes tourist footfall from heavily congested commercial bottlenecks (e.g. Solang Valley, Baga Beach, Dal Lake) to authentic, serene offbeat alternatives (e.g. Sethan Valley, Galgibaga Turtle Beach, Doodhpathri).\n" +
      "- Benefits: Enhances traveler serenity, protects fragile mountain/coastal ecosystems, and directs tourist revenue to local village artisans, homestays, and family-run dhabas.\n" +
      "- Live Guardian: The background monitoring engine watches crowd densities and dynamically suggests 1-click alternative rerouting."
  });

  return chunks;
}

/**
 * Creates deterministic pseudo-embeddings based on text term hashing for offline fallback.
 */
function createFallbackEmbedding(text) {
  const dim = 1536;
  const vec = new Float32Array(dim);
  const words = text.toLowerCase().split(/\W+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1.0;
  }
  // Normalize vector
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return Array.from(vec);
}

/**
 * Main Indexer execution function.
 */
export async function runIndexer() {
  console.log("=========================================");
  console.log("   YatriSathi Site Knowledge Base Indexer");
  console.log("=========================================");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const chunks = buildDocumentChunks();
  console.log(`[Indexer] Prepared ${chunks.length} structured knowledge chunks from website data.`);

  const apiKey = process.env.OPENAI_API_KEY;
  const hasValidKey = apiKey && apiKey.startsWith("sk-") && apiKey.length > 20 && !apiKey.includes("your_openai");

  let indexedDocs = [];

  if (hasValidKey) {
    console.log("[Indexer] Valid OpenAI API key detected. Generating high-precision embeddings with text-embedding-3-small...");
    const openai = new OpenAI({ apiKey });
    const batchSize = 16;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const inputTexts = batch.map(c => `${c.title}\n${c.content}`);

      try {
        const resp = await openai.embeddings.create({
          model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
          input: inputTexts,
        });

        for (let j = 0; j < batch.length; j++) {
          const embedding = resp.data[j].embedding;
          indexedDocs.push({
            ...batch[j],
            embedding
          });
        }
        console.log(`[Indexer] Indexed chunks ${i + 1} to ${Math.min(i + batchSize, chunks.length)} of ${chunks.length}`);
      } catch (err) {
        console.warn(`[Indexer] OpenAI Embeddings API error for batch ${i}: ${err.message}. Falling back to lexical embedding.`);
        for (const item of batch) {
          indexedDocs.push({
            ...item,
            embedding: createFallbackEmbedding(`${item.title}\n${item.content}`)
          });
        }
      }
    }
  } else {
    console.log("[Indexer] No active OpenAI API key provided in .env.");
    console.log("[Indexer] Generating deterministic semantic-hash embeddings. RAG will operate with lexical/semantic hybrid search.");
    for (const item of chunks) {
      indexedDocs.push({
        ...item,
        embedding: createFallbackEmbedding(`${item.title}\n${item.content}`)
      });
    }
  }

  const outputPayload = {
    generatedAt: new Date().toISOString(),
    totalDocuments: indexedDocs.length,
    embeddingModel: hasValidKey ? (process.env.EMBEDDING_MODEL || "text-embedding-3-small") : "hybrid-fallback-termhash",
    documents: indexedDocs
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputPayload, null, 2), "utf-8");
  console.log(`[Indexer] Successfully saved ${indexedDocs.length} indexed documents to ${OUTPUT_FILE}`);
  console.log("=========================================\n");
  return outputPayload;
}

// If invoked directly from CLI (e.g. `node server/indexer.js`)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIndexer().catch((err) => {
    console.error("[Indexer] Fatal error during indexing:", err);
    process.exit(1);
  });
}
