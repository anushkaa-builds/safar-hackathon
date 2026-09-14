import React, { useState } from "react";
import destinationsData from "./data/destinationsData";
import { Search, MapPin, Check, X } from "lucide-react";

export default function DestinationPicker({ isOpen, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  const categories = ["all", "Mountains", "Beach", "Heritage", "Adventure & Spiritual", "Nature & Eco-Tourism", "Desert & Culture"];

  const filtered = destinationsData.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(search.toLowerCase()) || dest.state.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || dest.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#172536]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E0D8] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#E99A25]">Curated Circuits</span>
            <h3 className="font-serif text-2xl text-[#172536] font-normal">Choose Destination</h3>
            <p className="text-xs text-[#64748B]">Select from curated Indian circuits or type any custom town or valley</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E5E0D8] bg-white flex items-center justify-center text-[#64748B] hover:text-[#172536] hover:border-[#172536] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Custom Place Field */}
        <div className="p-4 bg-white border-b border-[#E5E0D8] space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or type any place (e.g. Kutch, Manali, Ooty, Kashmir, Jaipur, Darjeeling...)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#172536] rounded-xl text-xs font-semibold text-[#172536] focus:outline-none transition"
              />
            </div>
            {search.trim() && (
              <button
                type="button"
                onClick={() => {
                  onSelect(search.trim());
                  onClose();
                }}
                className="px-4 py-2.5 bg-[#172536] hover:bg-[#22344a] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
              >
                Use "{search.trim()}"
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedCategory === c
                    ? "bg-[#172536] text-white shadow-2xs"
                    : "bg-[#FAF8F5] text-[#64748B] border border-[#E5E0D8] hover:border-[#CBD5E1]"
                }`}
              >
                {c === "all" ? "All Places" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((dest) => (
            <button
              key={dest.id}
              onClick={() => {
                onSelect(dest.name);
                onClose();
              }}
              className="group relative rounded-2xl overflow-hidden h-44 shadow-xs hover:shadow-md transition-all text-left border border-[#E5E0D8] hover:border-[#172536] cursor-pointer"
              style={{
                backgroundImage: `url(${dest.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#172536] via-[#172536]/40 to-transparent" />
              
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {dest.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-0.5">
                <p className="text-white font-serif text-lg font-normal leading-snug">{dest.name}</p>
                <p className="text-slate-300 text-[11px] font-medium line-clamp-1">{dest.tagline}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-[#E99A25] font-semibold">
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