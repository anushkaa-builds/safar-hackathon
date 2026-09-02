import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Plus,
  CheckCircle,
  ShieldCheck,
  Tag,
  ThumbsUp,
  Search,
  Sparkles,
  Send,
  X,
  Check
} from "lucide-react";
import { fetchReviews, addReview, toggleReviewHelpful, getLikedReviewIds } from "../services/reviewService";

const AVAILABLE_DESTINATIONS = [
  "Kashmir",
  "Manali",
  "Goa",
  "Jaipur",
  "Rishikesh",
  "Kerala",
  "Ladakh",
  "Varanasi"
];

const TRAVEL_STYLES = [
  "Solo Explorer",
  "Couple",
  "Family Trip",
  "Friends Group",
  "Backpacker"
];

const CROWD_OPTIONS = [
  { label: "Low (Offbeat & Serene)", value: "Low (Offbeat Peaceful)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { label: "Moderate (Manageable)", value: "Moderate (Manageable)", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { label: "High (Avoid Peak Hours)", value: "High (Avoid Peak)", color: "text-amber-700 bg-amber-50 border-amber-200" }
];

const SAFETY_OPTIONS = [
  "10/10 Excellent & Highly Secure",
  "9/10 Very Safe",
  "8/10 Safe with Normal Caution",
  "7/10 Exercise Caution",
  "6/10 Moderate Caution Advised",
  "5/10 Average Safety",
  "4/10 Significant Concerns",
  "3/10 High Risk",
  "2/10 Unsafe",
  "1/10 Critical Danger"
];

const SUGGESTED_TAGS = [
  "Offbeat Gem",
  "Eco-Friendly",
  "Solo Friendly",
  "High Safety",
  "Budget Friendly",
  "Local Food",
  "Avoid Peak Hours",
  "Scenic Views",
  "High Altitude",
  "Cultural Heritage"
];

const AVATAR_OPTIONS = ["🎒", "🏔️", "🏄‍♂️", "📸", "🌿", "⛺", "🧭", "🧘‍♂️", "👨‍💼", "👩‍❤️‍👨"];

const RATING_DESCRIPTIONS = {
  10: "⭐ 10/10 - Exceptional! Exceeded all expectations",
  9: "⭐ 9/10 - Outstanding experience",
  8: "⭐ 8/10 - Very Good! Thoroughly enjoyed",
  7: "⭐ 7/10 - Good with minor hiccups",
  6: "⭐ 6/10 - Decent / Above Average",
  5: "⭐ 5/10 - Average experience",
  4: "⭐ 4/10 - Below expectations",
  3: "⭐ 3/10 - Poor experience",
  2: "⭐ 2/10 - Very poor / Major issues",
  1: "⭐ 1/10 - Disappointing / Critical problems"
};

export default function ReviewsView({ activeDestination = "Kashmir" }) {
  const [reviews, setReviews] = useState([]);
  const [filterDest, setFilterDest] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'highest' | 'lowest' | 'helpful'
  
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [likedIds, setLikedIds] = useState([]);

  // Form states
  const [author, setAuthor] = useState("");
  const [destination, setDestination] = useState(activeDestination || "Kashmir");
  const [customDestination, setCustomDestination] = useState("");
  const [rating, setRating] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [crowdRating, setCrowdRating] = useState("Low (Offbeat Peaceful)");
  const [safetyScore, setSafetyScore] = useState("10/10 Excellent & Highly Secure");
  const [budgetSpent, setBudgetSpent] = useState("");
  const [travelStyle, setTravelStyle] = useState("Solo Explorer");
  const [avatar, setAvatar] = useState("🎒");
  const [selectedTags, setSelectedTags] = useState(["Offbeat Gem", "Eco-Friendly"]);
  const [comment, setComment] = useState("");

  // Load user name from preferences if exists
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("safar_latest_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.name && !author) {
          setAuthor(parsed.name);
        }
        if (parsed.destination && (!destination || destination === "Kashmir")) {
          setDestination(parsed.destination);
        }
      }
    } catch (e) {
      // ignore
    }
    setLikedIds(getLikedReviewIds());
  }, []);

  useEffect(() => {
    loadReviews(filterDest);
  }, [filterDest]);

  async function loadReviews(destFilter) {
    setLoading(true);
    const data = await fetchReviews(destFilter);
    setReviews(data);
    setLoading(false);
  }

  function handleTagToggle(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !rating) return;
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 10) return;

    setIsSubmitting(true);
    const finalDest = destination === "Other" ? (customDestination.trim() || "Offbeat Circuit") : destination;

    const newRev = {
      author: author.trim(),
      destination: finalDest,
      rating: numericRating,
      crowdRating,
      safetyScore,
      budgetSpent: budgetSpent.trim() || "Budget Friendly",
      travelStyle,
      avatar,
      comment: comment.trim(),
      tags: selectedTags.length > 0 ? selectedTags : ["Verified Yatri", "Community Tip"],
      helpfulCount: 0
    };

    const res = await addReview(newRev);
    setIsSubmitting(false);

    if (res.success) {
      setSubmissionSuccess({
        author: newRev.author,
        destination: newRev.destination,
        rating: newRev.rating,
        comment: newRev.comment
      });
      setModalOpen(false);
      setComment("");
      setRating("");
      setSelectedTags(["Offbeat Gem", "Eco-Friendly"]);
      await loadReviews(filterDest);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setSubmissionSuccess(null);
      }, 7000);
    }
  }

  function handleHelpfulClick(reviewId) {
    const { isLiked, countDelta } = toggleReviewHelpful(reviewId);
    setLikedIds(getLikedReviewIds());
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulCount: Math.max(0, (r.helpfulCount || 0) + countDelta)
          };
        }
        return r;
      })
    );
  }

  // Calculate Statistics
  const stats = useMemo(() => {
    if (!reviews.length) {
      return { avgRating: "5.0", total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, safePercent: "100%" };
    }
    const total = reviews.length;
    let sum = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let safeCount = 0;

    reviews.forEach(r => {
      const rawRating = Number(r.rating || 5);
      const starVal = rawRating > 5 ? Math.min(5, Math.max(1, Math.round(rawRating / 2))) : Math.min(5, Math.max(1, Math.round(rawRating)));
      sum += rawRating > 5 ? rawRating / 2 : rawRating;
      breakdown[starVal] = (breakdown[starVal] || 0) + 1;
      if (r.safetyScore && (r.safetyScore.includes("10/10") || r.safetyScore.includes("9/10") || r.safetyScore.includes("8/10") || r.safetyScore.includes("7/10"))) {
        safeCount++;
      } else if (!r.safetyScore) {
        safeCount++;
      }
    });

    const avg = total > 0 ? (sum / total).toFixed(1) : "5.0";
    const safePercent = Math.round((safeCount / total) * 100) + "%";

    return { avgRating: avg, total, breakdown, safePercent };
  }, [reviews]);

  // Filtered and Sorted Reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Filter by Rating
    if (filterRating !== "all") {
      const minRate = Number(filterRating);
      list = list.filter(r => {
        const val = Number(r.rating || 0);
        const normalized = val <= 5 && minRate > 5 ? val * 2 : val;
        return normalized >= minRate;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        (r.author && r.author.toLowerCase().includes(q)) ||
        (r.destination && r.destination.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
        (r.travelStyle && r.travelStyle.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "newest") {
      // default
    } else if (sortBy === "highest") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "lowest") {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (sortBy === "helpful") {
      list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    return list;
  }, [reviews, filterRating, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Submission Success Confirmation Banner */}
      {submissionSuccess && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-700/20 border-2 border-emerald-400 flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                  Review Published & Synced to Cloud
                </span>
                <span className="text-amber-300 font-black text-xs">
                  {"★".repeat(Math.min(10, Math.max(1, Number(submissionSuccess.rating || 1))))} ({submissionSuccess.rating}/10)
                </span>
              </div>
              <h3 className="font-black text-lg">
                Dhanyawaad, {submissionSuccess.author}! Your review for {submissionSuccess.destination} is live!
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                "{submissionSuccess.comment.length > 120 ? submissionSuccess.comment.slice(0, 120) + "..." : submissionSuccess.comment}"
              </p>
              <p className="text-[11px] text-emerald-200 font-semibold pt-1">
                ✨ Stored securely in Firebase Firestore & Local Cache to guide yatris nationwide.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccess(null)}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition text-xs font-bold shrink-0"
            title="Dismiss confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Community Verified Insights
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider">
                Real-Time Reviews
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Yatri Experiences & Eco-Tips Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Read authentic experiences, crowd updates, and safety ratings from fellow travelers across India. Share your personal journey to help maintain sustainable tourism.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition transform hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Share Your Review
          </button>
        </div>

        {/* Rating Summary & Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          {/* Overall Rating Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">Average Yatri Rating</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{stats.avgRating}</span>
                <span className="text-xs font-black text-slate-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 mt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(Number(stats.avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-amber-900/80 font-bold mt-3">
              Based on {stats.total} verified traveler reviews
            </p>
          </div>

          {/* Star Breakdown Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2 flex flex-col justify-center space-y-1.5 text-xs font-bold text-slate-600">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-0.5">Rating Breakdown</span>
            {[5, 4, 3, 2, 1].map((st) => {
              const count = stats.breakdown[st] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={st} className="flex items-center gap-2">
                  <span className="w-8 text-[11px] font-black text-slate-700 shrink-0">{st} ★</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[10px] font-black text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Quick Safety & Community Stats */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">Community Trust</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-teal-900">{stats.safePercent}</span>
                <span className="text-xs font-bold text-teal-700">Safety Score</span>
              </div>
              <p className="text-xs text-teal-800 font-medium mt-1">
                Yatris rated these destinations safe & well-guided.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-emerald-800 font-black text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Tourism Platform
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search / Sort Toolbar */}
      <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-md space-y-4">
        {/* Destination Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", ...AVAILABLE_DESTINATIONS].map((dest) => (
            <button
              key={dest}
              onClick={() => setFilterDest(dest)}
              className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition flex items-center gap-1.5 ${
                filterDest === dest
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {dest === "all" ? "🌏 All Circuits" : `📍 ${dest}`}
            </button>
          ))}
        </div>

        {/* Search, Rating Filter, and Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews, tips, or destinations..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rating Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-600 shrink-0">Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="all">⭐ All Ratings</option>
              <option value="9">⭐⭐⭐⭐⭐ 9+ Rating</option>
              <option value="7">⭐⭐⭐⭐ 7+ Rating</option>
              <option value="5">⭐⭐⭐ 5+ Rating</option>
              <option value="3">⭐⭐ 3+ Rating</option>
              <option value="1">⭐ 1+ Rating</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-600 shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="newest">🕒 Newest First</option>
              <option value="highest">⭐ Highest Rated</option>
              <option value="lowest">📉 Lowest Rated</option>
              <option value="helpful">👍 Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      {loading ? (
        <div className="p-16 text-center rounded-3xl bg-white border-2 border-slate-200 shadow-md space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-slate-600 font-black text-sm">Loading verified Yatri reviews from Firebase...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border-2 border-slate-200 shadow-md space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black">
            📝
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-900">No reviews found matching your criteria</h3>
            <p className="text-xs text-slate-500 font-medium">
              Try adjusting your search query or filter tags, or be the first to share your experience!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterRating("all");
                setFilterDest("all");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
            >
              Write a Review
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.map((rev) => {
            const isLiked = likedIds.includes(rev.id);
            const ratingNum = Number(rev.rating || 5);

            return (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg space-y-4 flex flex-col justify-between hover:border-teal-300 transition duration-200"
              >
                <div className="space-y-3">
                  {/* Card Top: Avatar, Name, Destination & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-sm shrink-0">
                        {rev.avatar || "🎒"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-sm text-slate-900">{rev.author}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Verified Yatri
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>📍 {rev.destination}</span>
                          <span>•</span>
                          <span>{rev.travelStyle || "Solo Explorer"}</span>
                          <span>•</span>
                          <span className="text-slate-400">{rev.date || "Recently"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 text-amber-600 font-black text-xs bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= Math.round(ratingNum > 5 ? ratingNum / 2 : ratingNum)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-slate-900">{ratingNum > 5 ? `${ratingNum}/10` : `${ratingNum.toFixed(1)}/5`}</span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    "{rev.comment}"
                  </p>

                  {/* Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-black border border-teal-100 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-teal-600" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Badges & Helpful Button */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-bold">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-900 border border-teal-100">
                      <span className="block text-teal-600 font-black">Crowd Density</span>
                      <span className="truncate block">{rev.crowdRating || "Moderate"}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                      <span className="block text-emerald-600 font-black">Safety Score</span>
                      <span className="truncate block">{rev.safetyScore || "10/10 Excellent"}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 col-span-2 sm:col-span-1">
                      <span className="block text-slate-500 font-black">Budget Spent</span>
                      <span className="truncate block">{rev.budgetSpent || "Budget Friendly"}</span>
                    </div>
                  </div>

                  {/* Helpful Button Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Helped fellow yatris plan safely
                    </span>
                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                        isLiked
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "text-white" : "text-teal-600"}`} />
                      <span>Helpful ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Review Modal / Drawer */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-300 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                  ✍️
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">Share Your Yatra Experience</h3>
                  <p className="text-xs text-slate-500 font-semibold">Your rating directly assists sustainable tourism</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-semibold">
              {/* Reviewer Name & Avatar Selection */}
              <div className="space-y-2">
                <label className="block text-slate-900 font-black text-xs">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg focus:outline-none focus:border-teal-500 cursor-pointer"
                      title="Select Traveler Avatar"
                    >
                      {AVATAR_OPTIONS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Atharva / Priya Sharma"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Destination & Travel Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Destination Circuit <span className="text-rose-500">*</span></label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    {AVAILABLE_DESTINATIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="Other">✨ Other Offbeat Circuit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Travel Style</label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    {TRAVEL_STYLES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* If "Other" Destination is selected */}
              {destination === "Other" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-slate-900 font-black">Custom Destination Name</label>
                  <input
                    required
                    value={customDestination}
                    onChange={(e) => setCustomDestination(e.target.value)}
                    placeholder="e.g. Ziro Valley, Spiti, Coorg..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>
              )}

              {/* WORKING STAR & NUMERIC RATING INPUT (1 to 10) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-black text-xs">
                    Overall Rating (1 to 10) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-amber-800 font-black text-sm">
                    {rating ? `${rating} / 10 ⭐` : "Select Rating"}
                  </span>
                </div>

                {/* Interactive Star Buttons (1 to 10) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starNum) => {
                    const isFilled = (hoverRating || Number(rating) || 0) >= starNum;
                    return (
                      <button
                        key={starNum}
                        type="button"
                        onMouseEnter={() => setHoverRating(starNum)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starNum)}
                        className="p-1 rounded-xl transition transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`Rate ${starNum} of 10`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Slider Input (min=1, max=10) */}
                <div className="pt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={rating || 1}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    title="Slide to select rating from 1 to 10"
                  />
                  <div className="flex justify-between text-[10px] text-amber-800/70 font-black px-0.5 mt-0.5">
                    <span>1 (Lowest)</span>
                    <span>5 (Average)</span>
                    <span>10 (Highest)</span>
                  </div>
                </div>

                {/* Numeric Pill Selectors for Quick One-Tap Choice (1 to 10) */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`py-1 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                        Number(rating) === n
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {n} ★
                    </button>
                  ))}
                </div>

                {/* Rating Description Label */}
                <p className="text-[11px] text-amber-900 font-bold">
                  {rating ? RATING_DESCRIPTIONS[rating] || `${rating}/10 Stars` : "Select a rating from 1 to 10"}
                </p>
              </div>

              {/* Crowd & Safety Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Crowd Density Encountered</label>
                  <select
                    value={crowdRating}
                    onChange={(e) => setCrowdRating(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    {CROWD_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Safety & Security Rating</label>
                  <select
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    {SAFETY_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Spent */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-black">Approximate Budget Spent</label>
                <input
                  value={budgetSpent}
                  onChange={(e) => setBudgetSpent(e.target.value)}
                  placeholder="e.g. ₹18,000 for 4 days or ₹4,000/day"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Topic Tags Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-900 font-black">
                  Highlights & Category Tags (Select up to 5)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer ${
                          active
                            ? "bg-teal-700 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {active ? "✓ " : "+ "}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WRITTEN FEEDBACK & ECO-TIPS TEXTAREA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-900 font-black">
                    Written Feedback & Eco-Tips <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {comment.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about crowd surges, local food tips, offbeat spots, safe transit hacks, or altitude precautions..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-medium text-slate-800 text-xs focus:outline-none focus:border-teal-500 focus:bg-white leading-relaxed resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !author.trim() || !comment.trim() || !rating}
                  className={`px-6 py-2.5 rounded-xl font-black text-white shadow-md flex items-center gap-2 transition cursor-pointer ${
                    isSubmitting || !author.trim() || !comment.trim() || !rating
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish Yatri Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}