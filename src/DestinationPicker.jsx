import React, { useState } from "react";
import destinationsData from "./data/destinationsData";
import { Search, MapPin, Check } from "lucide-react";

export default function DestinationPicker({ isOpen, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  const categories = ["all", "Mountains", "Beach", "Heritage", "Adventure & Spiritual", "Nature & Eco-Tourism"];

  const filtered = destinationsData.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(search.toLowerCase()) || dest.state.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || dest.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-slate-900">Choose Destination</h3>
            <p className="text-xs text-slate-500 font-semibold">Select from popular circuits or type any destination in India</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 font-black text-xl px-2">✕</button>
        </div>

        {/* Search & Custom Place Field */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or type any place (e.g. Manali, Ooty, Kashmir, Jaipur, Darjeeling...)"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {search.trim() && (
              <button
                type="button"
                onClick={() => {
                  onSelect(search.trim());
                  onClose();
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition shrink-0"
              >
                Use "{search.trim()}"
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition ${
                  selectedCategory === c
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {c === "all" ? "✨ All Places" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((dest) => (
            <button
              key={dest.id}
              onClick={() => {
                onSelect(dest.name);
                onClose();
              }}
              className="group relative rounded-2xl overflow-hidden h-40 shadow-md hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-emerald-500 hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${dest.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {dest.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-0.5">
                <p className="text-white font-black text-base leading-snug">{dest.name}</p>
                <p className="text-white/80 text-[11px] font-medium line-clamp-1">{dest.tagline}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-300 font-bold">
                  <span>🏔️ {dest.altitudeUnit}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}