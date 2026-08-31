import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Plus, CheckCircle, ShieldCheck, Users, Tag } from "lucide-react";
import { fetchReviews, addReview } from "../services/reviewService";

export default function ReviewsView({ activeDestination = "Kashmir" }) {
  const [reviews, setReviews] = useState([]);
  const [filterDest, setFilterDest] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [author, setAuthor] = useState("");
  const [destination, setDestination] = useState(activeDestination || "Kashmir");
  const [rating, setRating] = useState(5);
  const [crowdRating, setCrowdRating] = useState("Low (Offbeat)");
  const [safetyScore, setSafetyScore] = useState("10/10 Excellent");
  const [budgetSpent, setBudgetSpent] = useState("₹15,000 for 4 days");
  const [travelStyle, setTravelStyle] = useState("Solo");
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews(filterDest);
  }, [filterDest]);

  async function loadReviews(filter) {
    setLoading(true);
    const data = await fetchReviews(filter);
    setReviews(data);
    setLoading(false);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    const newRev = {
      author,
      destination,
      rating: Number(rating),
      crowdRating,
      safetyScore,
      budgetSpent,
      travelStyle,
      comment,
      avatar: "🎒",
      date: "Just now",
      tags: ["Verified Yatri", "Community Tip"]
    };

    await addReview(newRev);
    setModalOpen(false);
    setAuthor("");
    setComment("");
    loadReviews(filterDest);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl">
        <div>
          <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Community Insights</span>
          <h1 className="text-3xl font-black text-slate-900">Yatri Experiences & Eco-Tips</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Real feedback on crowd levels, safety precautions, and hidden offbeat gems.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
        >
          <Plus className="w-4 h-4" /> Share Experience
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["all", "Kashmir", "Manali", "Goa", "Jaipur", "Rishikesh", "Kerala", "Ladakh", "Varanasi"].map((dest) => (
          <button
            key={dest}
            onClick={() => setFilterDest(dest)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition ${
              filterDest === dest
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {dest === "all" ? "🌏 All Circuits" : dest}
          </button>
        ))}
      </div>

      {/* Reviews Feed */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold">Loading community reviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{rev.avatar || "👤"}</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{rev.author}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{rev.destination} • {rev.travelStyle} • {rev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-black text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rev.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Structured Badges */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-900 border border-teal-100">
                  <span className="block text-teal-600 font-black">Crowd Density</span>
                  <span>{rev.crowdRating || "Moderate"}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                  <span className="block text-emerald-600 font-black">Safety Score</span>
                  <span>{rev.safetyScore || "10/10"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="block text-slate-500 font-black">Spent</span>
                  <span>{rev.budgetSpent || "Budget Friendly"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-xl text-slate-900">Share Your Yatra Experience</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-900 font-black">Your Name</label>
                <input
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Atharva / Priya"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {["Kashmir", "Manali", "Goa", "Jaipur", "Rishikesh", "Kerala", "Ladakh", "Varanasi"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>⭐ {r} Stars</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Crowd Density</label>
                  <select
                    value={crowdRating}
                    onChange={(e) => setCrowdRating(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Low (Offbeat Peaceful)">Low (Offbeat Peaceful)</option>
                    <option value="Moderate (Manageable)">Moderate (Manageable)</option>
                    <option value="High (Avoid Peak)">High (Avoid Peak)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-900 font-black">Safety Rating</label>
                  <select
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="10/10 Excellent">10/10 Excellent</option>
                    <option value="9/10 Very Safe">9/10 Very Safe</option>
                    <option value="7/10 Exercise Caution">7/10 Exercise Caution</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-900 font-black">Detailed Feedback & Eco-Tips</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about crowd surges, local food tips, offbeat spots..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}