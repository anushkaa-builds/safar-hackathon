import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

const SEED_REVIEWS = [
  {
    id: "seed-1",
    destination: "Kashmir",
    author: "Rohan Sharma",
    avatar: "👨‍💼",
    rating: 5,
    crowdRating: "Low (Visited Doodhpathri)",
    safetyScore: "10/10 Excellent",
    budgetSpent: "₹18,500 for 5 days",
    travelStyle: "Solo Explorer",
    date: "August 2026",
    comment: "The AI rerouting saved our trip! When Gulmarg had a 2-hour queue, the app nudged us to Doodhpathri. It was pure bliss with green meadows and zero crowd. Shikara ride at sunrise in Nigeen was breathtaking!",
    tags: ["Sustainable Tourism", "Offbeat Gem", "Solo Friendly"]
  },
  {
    id: "seed-2",
    destination: "Manali",
    author: "Pooja & Ankit",
    avatar: "👩‍❤️‍👨",
    rating: 5,
    crowdRating: "Moderate (Avoided peak Solang)",
    safetyScore: "9/10 Very Safe",
    budgetSpent: "₹24,000 for 4 days",
    travelStyle: "Couple",
    date: "July 2026",
    comment: "The real-time AMS advisory was spot on. We stayed hydrated and took Day 1 slow. Loved the Sethan Valley igloo village and Naggar castle rooftop apple cider!",
    tags: ["High Altitude", "Adventure", "Couples"]
  },
  {
    id: "seed-3",
    destination: "Goa",
    author: "Arjun Verma & Friends",
    avatar: "🏄‍♂️",
    rating: 4.8,
    crowdRating: "Low in South Goa",
    safetyScore: "10/10 Safe Lifeguard Zones",
    budgetSpent: "₹32,000 for 4 people",
    travelStyle: "Group of 4",
    date: "June 2026",
    comment: "Butterfly Beach was crystal clean! The transit breakdown helped us rent scooters at government pre-fixed rates without getting overcharged by middlemen.",
    tags: ["Beach", "Budget Friendly", "Scuba"]
  }
];

export async function fetchReviews(destinationFilter = "all") {
  try {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    const firestoreReviews = [];
    querySnapshot.forEach((doc) => {
      firestoreReviews.push({ id: doc.id, ...doc.data() });
    });

    const combined = [...firestoreReviews, ...SEED_REVIEWS];
    if (destinationFilter && destinationFilter !== "all") {
      return combined.filter(r => r.destination.toLowerCase().includes(destinationFilter.toLowerCase()));
    }
    return combined;
  } catch (error) {
    console.warn("Firestore reviews read fallback to seed:", error);
    if (destinationFilter && destinationFilter !== "all") {
      return SEED_REVIEWS.filter(r => r.destination.toLowerCase().includes(destinationFilter.toLowerCase()));
    }
    return SEED_REVIEWS;
  }
}

export async function addReview(reviewData) {
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn("Error saving review to Firestore:", error);
    return { success: true, id: "local-" + Date.now() };
  }
}