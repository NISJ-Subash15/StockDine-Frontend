import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Star, Clock, Utensils, Calendar, Eye } from "lucide-react";
import { RestaurantDetails } from "@/lib/stockdine-store";

interface RestaurantCardProps {
  restaurant: RestaurantDetails;
  onBookNow?: (restaurant: RestaurantDetails) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onBookNow,
}) => {
  const navigate = useNavigate();
  const travelTimeText = restaurant.travelTime || `${Math.round((restaurant.distanceKm || 1.2) * 8)} mins`;
  const isOpen = restaurant.isOpen !== false;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent double trigger if clicking internal action buttons
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    navigate({
      to: "/customer/restaurant/$restaurantId",
      params: { restaurantId: restaurant.id },
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#404040] rounded-3xl overflow-hidden shadow-sm sd-hover-lift group flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Banner Cover Image */}
        <div className="h-48 sm:h-56 w-full relative overflow-hidden">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover sd-image-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#111111] flex items-center gap-1 shadow-md border border-[#E5E5E5]">
              <Star className="size-3.5 fill-[#d2d0c1] text-[#d2d0c1]" />{" "}
              {restaurant.reviewsCount > 0 ? `${restaurant.rating} (${restaurant.reviewsCount})` : "New"}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                isOpen ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>

          {/* Distance & Travel Time Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-extrabold border border-white/20 flex items-center gap-1.5 shadow-sm">
            <MapPin className="size-3 text-[#d2d0c1]" />
            <span>{restaurant.distanceKm || 1.2} km</span>
            <span className="opacity-60">•</span>
            <Clock className="size-3 text-[#d2d0c1]" />
            <span>{travelTimeText}</span>
          </div>

          {/* Bottom Name & Location Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-white leading-tight truncate">
              {restaurant.name}
            </h3>
            <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 truncate mt-0.5">
              <MapPin className="size-3 text-[#d2d0c1] shrink-0" />
              <span className="truncate">{restaurant.address || `${restaurant.city}, ${restaurant.country}`}</span>
            </p>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-[#383838] px-2.5 py-1 rounded-full font-bold border border-slate-300 dark:border-[#505050]">
              {restaurant.priceRange}
            </span>
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
              <Utensils className="size-3.5 text-amber-500" />
              {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(" • ") : restaurant.cuisines}
            </span>
          </div>
        </div>
      </div>

      {/* Available Tables & Action Buttons Footer */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between pt-3 border-t border-slate-300 dark:border-[#404040]">
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {restaurant.availableTablesCount || 5} Tables Available
          </span>

          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
            {restaurant.category || "Fine Dining"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to="/customer/restaurant/$restaurantId"
            params={{ restaurantId: restaurant.id }}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-[#383838] hover:bg-slate-200 dark:hover:bg-[#484848] border border-slate-300 dark:border-[#505050] text-slate-900 dark:text-white text-xs font-black text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <Eye className="size-3.5 text-slate-800 dark:text-slate-200" />
            <span>View Details</span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookNow) {
                onBookNow(restaurant);
              }
            }}
            className="py-2.5 px-3 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#111111] text-xs font-black text-center shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Calendar className="size-3.5 text-amber-400 dark:text-amber-600" />
            <span>Book Table</span>
          </button>
        </div>
      </div>
    </div>
  );
};
