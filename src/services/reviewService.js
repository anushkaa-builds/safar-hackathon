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
    tags: ["Sustainable Tourism", "Offbeat Gem", "Solo Friendly"],
    helpfulCount: 14
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
    comment: "The real-time AMS advisory was spot on. We stayed hydrated and took Day 1 slow. Loved the Sethan Valley igloo village and Naggar castle rooftop apple cider! Beautiful local wooden architecture.",
    tags: ["High Altitude", "Adventure", "Couples"],
    helpfulCount: 9
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
    comment: "Butterfly Beach was crystal clean! The transit breakdown helped us rent scooters at government pre-fixed rates without getting overcharged by middlemen. Cabo de Rama sunset was unforgettable.",
    tags: ["Beach", "Budget Friendly", "Scuba"],
    helpfulCount: 22
  },
  {
    id: "seed-4",
    destination: "Jaipur",
    author: "Meera Singhania",
    avatar: "📸",
    rating: 5,
    crowdRating: "Low at Sunrise",
    safetyScore: "10/10 Very Safe",
    budgetSpent: "₹14,000 for 3 days",
    travelStyle: "Solo Explorer",
    date: "May 2026",
    comment: "Visiting Amer Fort early at 7:30 AM before the tour buses arrive made all the difference. Panna Meena ka Kund stepwell had peaceful morning light. The local Ghewar recommendations were delicious!",
    tags: ["Heritage", "Culture & Crafts", "Photography"],
    helpfulCount: 11
  },
  {
    id: "seed-5",
    destination: "Rishikesh",
    author: "Devendra Patel",
    avatar: "🧘‍♂️",
    rating: 4.9,
    crowdRating: "Low at Neer Garh",
    safetyScore: "10/10 Excellent",
    budgetSpent: "₹9,500 for 3 days",
    travelStyle: "Solo Explorer",
    date: "April 2026",
    comment: "Triveni Ghat evening Aarti felt so serene and spiritually uplifting. Did cliff jumping at Shivpuri with certified instructors. Cafes in Tapovan overlooking the turquoise Ganga are heavenly.",
    tags: ["River Rafting", "Spiritual Ghats", "Eco-Friendly"],
    helpfulCount: 17
  },
  {
    id: "seed-6",
    destination: "Kerala",
    author: "Ananya & Family",
    avatar: "🌿",
    rating: 5,
    crowdRating: "Low (Offbeat Munroe Island)",
    safetyScore: "10/10 Excellent",
    budgetSpent: "₹38,000 for 5 days",
    travelStyle: "Family Trip",
    date: "March 2026",
    comment: "Munnar tea gardens at sunrise with mist rolling over the hills was magical. The canoe cruise through narrow village canals in Munroe Island was far more peaceful than typical crowded houseboats.",
    tags: ["Backwaters", "Family Friendly", "Tea Plantations"],
    helpfulCount: 19
  },
  {
    id: "seed-7",
    destination: "Ladakh",
    author: "Karan Malhotra",
    avatar: "🏔️",
    rating: 4.7,
    crowdRating: "Low (Offbeat Turtuk)",
    safetyScore: "9/10 Acclimatization Needed",
    budgetSpent: "₹35,000 for 6 days",
    travelStyle: "Backpacker",
    date: "February 2026",
    comment: "Turtuk village apricot orchards and Pangong Tso starry night sky were life-changing. Pay heed to the app's Day 1 rest warning for Leh altitude. Renting an oxygen canister was super smooth.",
    tags: ["High Altitude", "Adventure", "Star Gazing"],
    helpfulCount: 28
  },
  {
    id: "seed-8",
    destination: "Varanasi",
    author: "Sunil & Rekha",
    avatar: "🛕",
    rating: 4.8,
    crowdRating: "Moderate at Sunrise",
    safetyScore: "9/10 Good Tourist Police",
    budgetSpent: "₹12,000 for 3 days",
    travelStyle: "Couple",
    date: "January 2026",
    comment: "The 5:30 AM rowing boat ride along Assi to Manikarnika Ghat is an experience that stays with you forever. Banarasi chaat at Kashi Chaat Bhandar is unmatched. Followed the morning temple schedule smoothly.",
    tags: ["Spiritual Ghats", "Heritage", "Street Food"],
    helpfulCount: 15
  }
];

const LOCAL_STORAGE_KEY = "safar_custom_reviews";
const LIKED_REVIEWS_KEY = "safar_liked_reviews";

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load local reviews from localStorage:", e);
  }
  return [];
}

function saveLocalReviews(reviews) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn("Failed to save local reviews to localStorage:", e);
  }
}

export async function fetchReviews(destinationFilter = "all") {
  const localList = getLocalReviews();
  let firestoreReviews = [];

  try {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(40));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      firestoreReviews.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.warn("Firestore reviews read fallback to local cache & seeds:", error);
  }

  // Combine Firestore reviews, local reviews, and seed reviews (avoiding duplicates by id)
  const map = new Map();
  // Firestore first (most authoritative)
  firestoreReviews.forEach(r => map.set(r.id, r));
  // Local second
  localList.forEach(r => {
    if (!map.has(r.id)) map.set(r.id, r);
  });
  // Seeds third
  SEED_REVIEWS.forEach(r => {
    if (!map.has(r.id)) map.set(r.id, r);
  });

  const combined = Array.from(map.values());

  // Filter if destination selected
  if (destinationFilter && destinationFilter !== "all") {
    const filterLower = destinationFilter.toLowerCase().trim();
    return combined.filter(r => r.destination && r.destination.toLowerCase().includes(filterLower));
  }

  return combined;
}

export async function addReview(reviewData) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const newReviewItem = {
    ...reviewData,
    date: reviewData.date || formattedDate,
    createdAt: now.toISOString(),
    helpfulCount: reviewData.helpfulCount || 0
  };

  let firestoreId = null;

  try {
    const docRef = await addDoc(collection(db, "reviews"), newReviewItem);
    firestoreId = docRef.id;
    newReviewItem.id = firestoreId;
    console.log("Review successfully saved to Cloud Firestore with ID:", firestoreId);
  } catch (error) {
    console.warn("Firestore review save fallback to local storage:", error);
    newReviewItem.id = "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  // Always update local cache
  const localList = getLocalReviews();
  saveLocalReviews([newReviewItem, ...localList]);

  return { success: true, id: newReviewItem.id, review: newReviewItem };
}

export function getLikedReviewIds() {
  try {
    const raw = localStorage.getItem(LIKED_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function toggleReviewHelpful(reviewId) {
  try {
    const liked = getLikedReviewIds();
    const isLiked = liked.includes(reviewId);
    let updated;
    if (isLiked) {
      updated = liked.filter(id => id !== reviewId);
    } else {
      updated = [...liked, reviewId];
    }
    localStorage.setItem(LIKED_REVIEWS_KEY, JSON.stringify(updated));
    return { isLiked: !isLiked, countDelta: isLiked ? -1 : 1 };
  } catch (e) {
    return { isLiked: false, countDelta: 0 };
  }
}