import React from "react";
import { MapPin, Star, Utensils } from "lucide-react";
import { RestaurantDetails } from "@/lib/stockdine-store";

interface RestaurantMapMarkerProps {
  restaurant: RestaurantDetails;
  isSelected?: boolean;
  onClick?: () => void;
  xPercent: number;
  yPercent: number;
}

export const RestaurantMapMarker: React.FC<RestaurantMapMarkerProps> = ({
  restaurant,
  isSelected = false,
  onClick,
  xPercent,
  yPercent,
}) => {
  return (
    <div
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 group ${
        isSelected ? "scale-110 z-30" : "hover:scale-105"
      }`}
    >
      {/* Radar pulse ring if selected */}
      {isSelected && (
        <span className="absolute -inset-3 rounded-full bg-[#d2d0c1]/40 animate-ping pointer-events-none" />
      )}

      {/* Marker Pill */}
      <div
        className={`px-3 py-1.5 rounded-2xl shadow-xl font-extrabold text-xs flex items-center gap-1.5 border-2 transition-all ${
          isSelected
            ? "bg-[#111111] text-white border-[#d2d0c1] shadow-2xl"
            : "bg-white text-[#111111] border-[#E5E5E5] hover:border-[#111111]"
        }`}
      >
        <MapPin
          className={`size-4 ${
            isSelected ? "text-[#d2d0c1] fill-current" : "text-[#111111]"
          }`}
        />
        <span className="truncate max-w-[120px]">{restaurant.name}</span>
        <span className="text-[10px] bg-[#d2d0c1]/20 text-[#d2d0c1] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <Star className="size-2.5 fill-current" /> {restaurant.rating}
        </span>
      </div>
    </div>
  );
};
