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
        <span className="absolute -inset-3 rounded-full bg-[#E77B49]/40 animate-ping pointer-events-none" />
      )}

      {/* Marker Pill */}
      <div
        className={`px-3 py-1.5 rounded-2xl shadow-xl font-extrabold text-xs flex items-center gap-1.5 border-2 transition-all ${
          isSelected
            ? "bg-[#60241E] text-white border-[#E77B49] shadow-2xl"
            : "bg-white text-[#1F2937] border-[#E5E7EB] hover:border-[#60241E]"
        }`}
      >
        <MapPin
          className={`size-4 ${
            isSelected ? "text-[#E77B49] fill-current" : "text-[#60241E]"
          }`}
        />
        <span className="truncate max-w-[120px]">{restaurant.name}</span>
        <span className="text-[10px] bg-[#E77B49]/20 text-[#E77B49] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <Star className="size-2.5 fill-current" /> {restaurant.rating}
        </span>
      </div>
    </div>
  );
};
