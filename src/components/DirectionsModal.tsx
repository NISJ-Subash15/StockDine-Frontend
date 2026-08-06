import React, { useState, useEffect } from "react";
import {
  X,
  Navigation,
  Car,
  Bike,
  Footprints,
  MapPin,
  Clock,
  Compass,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { RestaurantDetails } from "@/lib/stockdine-store";

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantDetails | null;
}

type TravelMode = "driving" | "two-wheeler" | "walking";

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  restaurant,
}) => {
  if (!isOpen || !restaurant) return null;

  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Restaurant coordinates (fallback default if not present)
  const restLat = restaurant.coordinates?.latitude || 28.6315;
  const restLng = restaurant.coordinates?.longitude || 77.2167;

  // Track user location
  useEffect(() => {
    setIsLocating(true);
    setLocationError(null);

    let watchId: number;

    if ("geolocation" in navigator) {
      // First get immediate location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation warning:", err.message);
          // Fallback location near Delhi Connaught Place
          setUserLocation({ lat: 28.628, lng: 77.21 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );

      // Continuous tracking
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation({ lat: 28.628, lng: 77.21 });
      setIsLocating(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [restaurant.id]);

  // Calculate mock distance in km (Haversine formula approximation)
  const calculateDistance = () => {
    if (!userLocation) return restaurant.distanceKm || 1.8;

    const R = 6371; // Earth radius km
    const dLat = ((restLat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((restLng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((restLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist < 0.1 ? 0.8 : parseFloat(dist.toFixed(1));
  };

  const distanceKm = calculateDistance();

  // Travel time speed multipliers (mins)
  const calculateETA = () => {
    if (travelMode === "driving") {
      return Math.max(3, Math.round(distanceKm * 4.5));
    } else if (travelMode === "two-wheeler") {
      return Math.max(2, Math.round(distanceKm * 3.2));
    } else {
      // walking speed ~5km/h => 12 mins per km
      return Math.max(5, Math.round(distanceKm * 12));
    }
  };

  const etaMins = calculateETA();

  const handleOpenExternalGoogleMaps = () => {
    const originStr = userLocation
      ? `${userLocation.lat},${userLocation.lng}`
      : "My+Location";
    const destStr = encodeURIComponent(`${restaurant.name}, ${restaurant.address}`);
    const modeParam =
      travelMode === "walking"
        ? "walking"
        : travelMode === "two-wheeler"
        ? "bicycling"
        : "driving";

    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${modeParam}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#E77B49] selection:text-white">
      <div className="bg-white max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E5E7EB] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#60241E] to-[#95271D] text-white p-5 sm:p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-white">
              <Navigation className="size-6 text-[#E77B49] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">
                Live Route Telemetry
              </span>
              <h3 className="font-serif italic text-2xl font-bold text-white mt-1">
                Directions to {restaurant.name}
              </h3>
              <p className="text-xs text-white/80 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="size-3 text-[#E77B49]" /> {restaurant.address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Travel Mode Selector */}
        <div className="bg-[#F8F9FA] p-4 border-b border-[#E5E7EB] flex items-center justify-between gap-2">
          <span className="text-xs text-[#6B7280] font-extrabold uppercase tracking-wider">
            Mode:
          </span>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => setTravelMode("driving")}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelMode === "driving"
                  ? "bg-[#60241E] text-white shadow-md"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-100"
              }`}
            >
              <Car className="size-4" />
              <span>Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setTravelMode("two-wheeler")}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelMode === "two-wheeler"
                  ? "bg-[#60241E] text-white shadow-md"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-100"
              }`}
            >
              <Bike className="size-4" />
              <span>Ride</span>
            </button>

            <button
              type="button"
              onClick={() => setTravelMode("walking")}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                travelMode === "walking"
                  ? "bg-[#60241E] text-white shadow-md"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-100"
              }`}
            >
              <Footprints className="size-4" />
              <span>Walk</span>
            </button>
          </div>
        </div>

        {/* Interactive Simulated Route Canvas */}
        <div className="relative h-56 bg-slate-900 overflow-hidden flex items-center justify-center">
          {/* Background Map Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

          {/* Animated Route SVG Line */}
          <svg className="absolute inset-0 w-full h-full stroke-current text-[#E77B49]">
            <path
              d="M 80 160 C 180 80, 280 180, 420 80"
              fill="none"
              strokeWidth="5"
              strokeDasharray="8 6"
              className="animate-pulse"
            />
          </svg>

          {/* Start Pin (User Position) */}
          <div className="absolute left-16 bottom-10 flex flex-col items-center">
            <span className="size-4 rounded-full bg-sky-500 border-2 border-white shadow-lg animate-ping" />
            <span className="text-[10px] font-extrabold text-sky-400 bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-sky-400/30">
              Your GPS Pin
            </span>
          </div>

          {/* Destination Pin (Restaurant) */}
          <div className="absolute right-16 top-10 flex flex-col items-center">
            <div className="size-10 rounded-2xl bg-[#E77B49] text-white flex items-center justify-center shadow-xl border-2 border-white">
              <MapPin className="size-5" />
            </div>
            <span className="text-[10px] font-extrabold text-white bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-[#E77B49]/40">
              {restaurant.name}
            </span>
          </div>

          {/* Live Telemetry Floating Badge */}
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-3 text-xs font-bold shadow-lg">
            <div className="flex items-center gap-1 text-[#E77B49]">
              <Compass className="size-4 animate-spin" />
              <span>{distanceKm} km</span>
            </div>
            <span className="opacity-40">|</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <Clock className="size-4" />
              <span>~{etaMins} mins</span>
            </div>
          </div>
        </div>

        {/* Route Details & Turn-by-Turn Guidance */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Clock className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase">Estimated Time</p>
                <p className="text-[#60241E] text-sm">{etaMins} minutes</p>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <MapPin className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase">Total Distance</p>
                <p className="text-[#60241E] text-sm">{distanceKm} km away</p>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Guidance Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E]">
              Turn-by-Turn Route Preview
            </h4>
            <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-3 space-y-2 text-xs text-[#4B5563]">
              <div className="flex items-center gap-2 font-medium">
                <span className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Head towards {restaurant.city || "New Delhi"} Main Arterial Road.</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="size-5 rounded-full bg-[#60241E] text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Continue straight for {Math.max(0.4, parseFloat((distanceKm * 0.7).toFixed(1)))} km along the main avenue.</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="size-5 rounded-full bg-[#E77B49] text-white flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Arrive at {restaurant.name} ({restaurant.address}).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleOpenExternalGoogleMaps}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ExternalLink className="size-4 text-[#E77B49]" />
            <span>Open in Google Maps / Navigation</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-white border-2 border-[#E5E7EB] text-[#1F2937] text-xs font-extrabold hover:bg-gray-100 transition-all"
          >
            Close Navigation
          </button>
        </div>
      </div>
    </div>
  );
};
