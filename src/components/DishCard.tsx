import React from "react";
import { Link } from "@tanstack/react-router";
import { Star, Plus, Flame, Award, Calendar, Eye, Utensils } from "lucide-react";
import { Dish, formatCurrency } from "@/lib/stockdine-store";

interface DishCardProps {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
  onAddBooking?: (dish: Dish) => void;
  onViewRestaurant?: (restaurantId: string) => void;
  compact?: boolean;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  onSelect,
  onAddBooking,
  onViewRestaurant,
  compact = false,
}) => {
  const isAvailable = dish.availableToday && dish.portionsLeft > 0;

  return (
    <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden">
      <div className="space-y-3">
        {/* Restaurant Header Overlay */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 min-w-0">
            {dish.restaurantLogo && (
              <img
                src={dish.restaurantLogo}
                alt={dish.restaurantName || "Restaurant"}
                className="size-7 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
              />
            )}
            <div className="min-w-0">
              <Link
                to="/customer/restaurant/$restaurantId"
                params={{ restaurantId: dish.restaurantId }}
                className="text-xs font-extrabold text-[#60241E] hover:text-[#E77B49] truncate block transition-colors"
              >
                {dish.restaurantName || "Partner Restaurant"}
              </Link>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#60241E]/10 text-[#60241E] shrink-0">
            {dish.category}
          </span>
        </div>

        {/* Dish Image Container */}
        <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs">
          <img
            src={(typeof dish.dishImage === "string" ? dish.dishImage : dish.dishImage?.imageUrl) || dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"}
            alt={dish.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90" />

          {/* Top Left Tags */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center z-10">
            <span
              className={`size-5 rounded-md flex items-center justify-center border shadow-sm ${
                dish.isVeg !== false ? "border-emerald-600 bg-white" : "border-red-600 bg-white"
              }`}
              title={dish.isVeg !== false ? "Vegetarian" : "Non-Vegetarian"}
            >
              <span
                className={`size-2.5 rounded-full ${
                  dish.isVeg !== false ? "bg-emerald-600" : "bg-red-600"
                }`}
              />
            </span>

            {dish.isBestseller && (
              <span className="text-[10px] font-extrabold uppercase bg-[#E77B49] text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Flame className="size-3 fill-current text-white" /> Bestseller
              </span>
            )}

            {dish.isChefRecommended && (
              <span className="text-[10px] font-extrabold uppercase bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Award className="size-3 text-white" /> Chef Pick
              </span>
            )}

            {dish.isVegan && (
              <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                Vegan
              </span>
            )}
            {dish.isOrganic && (
              <span className="text-[10px] font-extrabold uppercase bg-teal-700 text-white px-2 py-0.5 rounded-full shadow-sm">
                Organic
              </span>
            )}
          </div>

          {/* Top Right Rating Badge */}
          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md text-[#60241E] px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm border border-[#E5E7EB]">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{dish.rating || 4.9}</span>
          </div>

          {/* Bottom Left Availability & Spice Level */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-extrabold">
            <span
              className={`px-2.5 py-1 rounded-full text-white backdrop-blur-md border ${
                isAvailable
                  ? "bg-emerald-800/80 border-emerald-400/30"
                  : "bg-rose-800/80 border-rose-400/30"
              }`}
            >
              {isAvailable ? `${dish.stockType} • ${dish.portionsLeft} Left` : "Sold Out Today"}
            </span>

            {dish.spiceLevel !== undefined && dish.spiceLevel > 0 && (
              <span className="bg-black/70 text-amber-400 px-2 py-1 rounded-full border border-white/20">
                {"🌶️".repeat(dish.spiceLevel)}
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-1">
          <h3
            onClick={() => onSelect && onSelect(dish)}
            className="font-serif italic font-bold text-lg sm:text-xl text-[#60241E] leading-tight line-clamp-1 cursor-pointer hover:text-[#E77B49] transition-colors"
          >
            {dish.name}
          </h3>

          <p className="text-xs text-[#4B5563] font-medium line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="pt-3 mt-3 border-t border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif italic font-bold text-xl text-[#60241E]">
                {formatCurrency(dish.discountPrice || dish.price)}
              </span>
              {dish.discountPrice && (
                <span className="line-through text-xs text-[#9CA3AF]">
                  {formatCurrency(dish.price)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-bold text-[#6B7280]">
            ⏱️ {dish.prepTime}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/customer/restaurant/$restaurantId"
            params={{ restaurantId: dish.restaurantId }}
            className="py-2.5 px-3 rounded-2xl bg-[#F8F9FA] hover:bg-[#E5E7EB] border border-[#D1D5DB] text-[#1F2937] text-xs font-extrabold text-center transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs"
          >
            <Eye className="size-3.5 text-[#60241E]" />
            <span>View Venue</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (onAddBooking) {
                onAddBooking(dish);
              }
            }}
            disabled={!isAvailable}
            className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold text-center shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
              isAvailable
                ? "bg-[#E77B49] hover:bg-[#D66A38] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>Book Table</span>
          </button>
        </div>
      </div>
    </div>
  );
};

