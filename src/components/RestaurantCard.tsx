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
      className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Banner Cover Image */}
        <div className="h-48 sm:h-56 w-full relative overflow-hidden">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-[#60241E] flex items-center gap-1 shadow-md border border-[#E5E7EB]">
              <Star className="size-3.5 fill-amber-500 text-amber-500" /> {restaurant.rating} ({restaurant.reviewsCount})
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                isOpen ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>

          {/* Distance & Travel Time Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-extrabold border border-white/20 flex items-center gap-1.5 shadow-sm">
            <MapPin className="size-3 text-[#E77B49]" />
            <span>{restaurant.distanceKm || 1.2} km</span>
            <span className="opacity-60">•</span>
            <Clock className="size-3 text-[#E77B49]" />
            <span>{travelTimeText}</span>
          </div>

          {/* Bottom Logo & Name Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="size-14 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0 bg-white"
              />
            ) : (
              <div className="size-14 rounded-2xl bg-gradient-to-br from-[#60241E] to-[#E77B49] text-white flex items-center justify-center font-bold font-serif text-xl border-2 border-white shadow-lg shrink-0">
                {restaurant.name?.charAt(0) || "S"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                {restaurant.name}
              </h3>
              <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 truncate mt-0.5">
                <MapPin className="size-3 text-[#E77B49] shrink-0" />
                <span className="truncate">{restaurant.address || `${restaurant.city}, ${restaurant.country}`}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#4B5563] font-medium line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-[#60241E] bg-[#60241E]/10 px-2.5 py-1 rounded-full font-bold">
              {restaurant.priceRange}
            </span>
            <span className="text-[#6B7280] flex items-center gap-1.5 font-medium">
              <Utensils className="size-3.5 text-[#E77B49]" />
              {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(" • ") : restaurant.cuisines}
            </span>
          </div>
        </div>
      </div>

      {/* Available Tables & Action Buttons Footer */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {restaurant.availableTablesCount || 5} Tables Available
          </span>

          <span className="text-[11px] font-bold text-[#6B7280]">
            {restaurant.category || "Fine Dining"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to="/customer/restaurant/$restaurantId"
            params={{ restaurantId: restaurant.id }}
            className="py-2.5 px-3 rounded-2xl bg-[#F8F9FA] hover:bg-[#E5E7EB] border border-[#D1D5DB] text-[#1F2937] text-xs font-extrabold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <Eye className="size-3.5 text-[#60241E]" />
            <span>View Restaurant</span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookNow) {
                onBookNow(restaurant);
              }
            }}
            className="py-2.5 px-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold text-center shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Calendar className="size-3.5" />
            <span>Book Table</span>
          </button>
        </div>
      </div>
    </div>
  );
};
