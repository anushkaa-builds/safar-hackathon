import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data", "vector_store.json");

/**
 * Calculates cosine similarity between two numerical vectors of equal length.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Computes a lexical keyword score between query text and document text/tags.
 */
function computeLexicalScore(query, doc) {
  const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return 0;

  const docText = (doc.title + " " + doc.content + " " + (doc.tags || []).join(" ")).toLowerCase();
  let matches = 0;

  for (const term of queryTerms) {
    if (docText.includes(term)) {
      // Give higher weight if term appears in title or tags
      if (doc.title.toLowerCase().includes(term)) {
        matches += 2.5;
      } else if ((doc.tags || []).some(t => t.toLowerCase().includes(term))) {
        matches += 2.0;
      } else {
        matches += 1.0;
      }
    }
  }

  return Math.min(1.0, matches / (queryTerms.length * 1.5));
}

class VectorStore {
  constructor() {
    this.documents = [];
    this.loaded = false;
    this.load();
  }

  /**
   * Loads documents and embeddings from the JSON file.
   */
  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.documents = parsed.documents || [];
        this.loaded = true;
        console.log(`[VectorStore] Loaded ${this.documents.length} indexed documents from ${DATA_FILE}`);
      } else {
        console.warn(`[VectorStore] Data file not found at ${DATA_FILE}. Please run indexing.`);
        this.documents = [];
        this.loaded = false;
      }
    } catch (err) {
      console.error("[VectorStore] Failed to load vector store:", err);
      this.documents = [];
      this.loaded = false;
    }
  }

  /**
   * Searches for most relevant documents using hybrid vector + lexical matching.
   * @param {string} queryText - Raw user query string
   * @param {number[]|null} queryEmbedding - 1536-d embedding vector or null
   * @param {number} topK - Number of top documents to return
   * @param {string|null} destinationFilter - Optional destination name filter
   * @returns {Array<{doc: object, score: number}>}
   */
  search(queryText, queryEmbedding = null, topK = 4, destinationFilter = null) {
    if (this.documents.length === 0) {
      this.load();
    }
    if (this.documents.length === 0) return [];

    const hasEmbedding = Array.isArray(queryEmbedding) && queryEmbedding.length > 0;
    const destLower = destinationFilter ? destinationFilter.toLowerCase().trim() : null;

    const scoredDocs = this.documents.map((doc) => {
      let vectorScore = 0;
      if (hasEmbedding && Array.isArray(doc.embedding) && doc.embedding.length === queryEmbedding.length) {
        vectorScore = cosineSimilarity(queryEmbedding, doc.embedding);
      }

      const lexicalScore = computeLexicalScore(queryText, doc);

      // Destination affinity boost if the query relates to a specific destination
      let destBoost = 0;
      if (destLower && doc.destination && doc.destination.toLowerCase().includes(destLower)) {
        destBoost = 0.15;
      }

      // Hybrid combination
      const combinedScore = hasEmbedding
        ? (0.65 * vectorScore) + (0.35 * lexicalScore) + destBoost
        : lexicalScore + destBoost;

      return {
        doc: {
          id: doc.id,
          title: doc.title,
          category: doc.category,
          destination: doc.destination,
          tags: doc.tags,
          content: doc.content,
        },
        score: combinedScore,
      };
    });

    // Sort by score descending and return topK
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
  }

  /**
   * Returns count of indexed documents.
   */
  get count() {
    return this.documents.length;
  }
}

export const vectorStore = new VectorStore();
export default vectorStore;
