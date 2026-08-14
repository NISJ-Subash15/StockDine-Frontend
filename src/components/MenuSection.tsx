import React, { useState } from "react";
import { Sparkles, Search, SlidersHorizontal, Flame, Leaf, Award } from "lucide-react";
import { Dish } from "@/lib/stockdine-store";
import { DishCard } from "./DishCard";

interface MenuSectionProps {
  dishes: Dish[];
  onAddBooking?: (dish: Dish) => void;
}

export const CATEGORIES = [
  "Popular",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Drinks",
  "Vegan",
  "Organic",
  "Chef Specials",
];

export const MenuSection: React.FC<MenuSectionProps> = ({ dishes, onAddBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Popular");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dietaryFilter, setDietaryFilter] = useState<"All" | "Veg" | "Vegan" | "Organic">("All");

  const filteredDishes = dishes.filter((d) => {
    // Search Filter
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.restaurantName && d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Dietary Filter
    if (dietaryFilter === "Veg" && d.isVeg === false) return false;
    if (dietaryFilter === "Vegan" && !d.isVegan) return false;
    if (dietaryFilter === "Organic" && !d.isOrganic) return false;

    // Category Filter
    if (selectedCategory === "Popular") return true;
    if (selectedCategory === "Breakfast") return d.category === "Starters" || d.category === "Breakfast";
    if (selectedCategory === "Lunch" || selectedCategory === "Dinner") return d.category === "Main Course";
    if (selectedCategory === "Desserts") return d.category === "Desserts";
    if (selectedCategory === "Drinks") return d.category === "Beverages" || d.category === "Drinks";
    if (selectedCategory === "Vegan") return d.isVegan;
    if (selectedCategory === "Organic") return d.isOrganic;
    if (selectedCategory === "Chef Specials") return d.isBestseller || d.stockType === "Fast Selling";

    return matchesSearch;
  });

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-800 dark:text-slate-200 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
            Top Priority • Food First Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-bold tracking-tight text-[#111111] dark:text-white mt-1.5 flex items-center gap-2">
            <Flame className="size-6 text-amber-500 fill-current" />
            <span>Explore Signature Dishes</span>
          </h2>
        </div>

        {/* Dietary Quick Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-extrabold bg-slate-100 dark:bg-[#383838] p-1.5 rounded-2xl border border-slate-300 dark:border-[#505050]">
          {(["All", "Veg", "Vegan", "Organic"] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setDietaryFilter(tag)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                dietaryFilter === tag
                  ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-sm font-black"
                  : "text-slate-800 dark:text-slate-200 hover:text-[#111111] dark:hover:text-white font-bold"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-2 text-xs font-bold overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-md scale-105"
                  : "bg-slate-100 dark:bg-[#383838] border border-slate-300 dark:border-[#505050] text-slate-800 dark:text-slate-200 hover:text-[#111111] dark:hover:text-white hover:border-[#111111]/50"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Dish Search & Filter Input Bar */}
      <div className="bg-slate-100 dark:bg-[#222222] border border-slate-300 dark:border-[#505050] rounded-2xl p-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-[#111111]/40 focus-within:border-[#111111] transition-all">
        <Search className="size-5 text-slate-700 dark:text-slate-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search slow-cooked mutton biryani, galouti kebabs, pizza..."
          className="bg-transparent border-none outline-none w-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-bold"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-black text-slate-700 dark:text-slate-300 hover:text-[#111111] dark:hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Carousel (Top 4 Dishes) */}
      {!searchQuery && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <Sparkles className="size-4 text-[#d2d0c1]" /> Featured Dishes Carousel
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {dishes.slice(0, 4).map((d) => (
              <div key={d.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <DishCard dish={d} onAddBooking={onAddBooking} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Showcase of All Filtered Dishes */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111111]">
          Complete Menu Catalog ({filteredDishes.length} Items)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onAddBooking={onAddBooking} />
          ))}
        </div>
      </div>
    </section>
  );
};
