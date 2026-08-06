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
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#B34A44] bg-[#B34A44]/10 px-3 py-1 rounded-full border border-[#B34A44]/20">
            Top Priority • Food First Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-bold tracking-tight text-[#60241E] mt-1.5 flex items-center gap-2">
            <Flame className="size-6 text-[#E77B49]" />
            <span>Explore Signature Dishes</span>
          </h2>
        </div>

        {/* Dietary Quick Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-extrabold bg-[#F8F9FA] p-1.5 rounded-2xl border border-[#E5E7EB]">
          {(["All", "Veg", "Vegan", "Organic"] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setDietaryFilter(tag)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dietaryFilter === tag
                  ? "bg-[#60241E] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
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
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all ${
                isSelected
                  ? "bg-[#E77B49] text-white shadow-md scale-105"
                  : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] hover:border-[#60241E]/30"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Dish Search & Filter Input Bar */}
      <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-[#E77B49]/40 focus-within:border-[#E77B49] transition-all">
        <Search className="size-5 text-[#E77B49]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search slow-cooked mutton biryani, galouti kebabs, pizza..."
          className="bg-transparent border-none outline-none w-full text-sm text-[#1F2937] placeholder:text-[#6B7280] font-semibold"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-bold text-[#6B7280] hover:text-[#1F2937]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Carousel (Top 4 Dishes) */}
      {!searchQuery && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E] flex items-center gap-1.5">
            <Sparkles className="size-4 text-[#E77B49]" /> Featured Dishes Carousel
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
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E]">
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
