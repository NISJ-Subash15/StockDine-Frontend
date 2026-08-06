import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin,
  Building2,
  Star,
  Flame,
  ArrowRight,
  Search,
  Navigation,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X,
  Phone,
  Compass,
  Utensils,
  ChevronLeft,
} from "lucide-react";
import {
  useStockDineStore,
  RestaurantDetails,
  Dish,
  formatCurrency,
} from "@/lib/stockdine-store";
import { BookingModal } from "@/components/BookingModal";
import { DirectionsModal } from "@/components/DirectionsModal";
import { ThemeToggle } from "@/components/ThemeToggle";

const defaultFallbackRestaurant: RestaurantDetails = {
  id: "REST-DEFAULT",
  name: "StockDine Partner Venue",
  tagline: "Live Dine-In Intelligence",
  logo: "",
  coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=60",
  interiorPhotos: [],
  exteriorPhotos: [],
  address: "Connaught Place",
  city: "New Delhi",
  country: "India",
  contactPhone: "+91 9876543210",
  openingHours: "11:00 AM - 11:00 PM",
  cuisines: ["Multi-Cuisine"],
  priceRange: "Moderate",
  description: "StockDine Partner Venue",
  rating: 5.0,
  reviewsCount: 0,
  isOpen: true,
  availableTablesCount: 0,
  amenities: { parking: true, wifi: true, ac: true, outdoorSeating: true, familyFriendly: true, privateDining: true, liveMusic: true, wheelchairAccessible: true },
};

export const Route = createFileRoute("/customer/map")({
  head: () => ({
    meta: [
      { title: "Live Dining Radar Map — StockDine" },
      {
        name: "description",
        content: "Discover nearby partner restaurants, real-time table availability, and distance radar.",
      },
    ],
  }),
  component: MapRadarPage,
});

function MapRadarPage() {
  const { getAllRestaurantProfiles, getUniqueRestaurantList, dishes, tables, createBooking } = useStockDineStore();

  const profilesMap = getAllRestaurantProfiles();
  const rawRestaurants = getUniqueRestaurantList ? getUniqueRestaurantList() : Object.values(profilesMap);

  const deduplicateList = (list: RestaurantDetails[]) => {
    const seen = new Set<string>();
    return list.filter((r) => {
      if (!r || (!r.id && !r.name)) return false;
      const key = r.id || r.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const allRestaurants: RestaurantDetails[] = deduplicateList(rawRestaurants);

  // Map Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All");
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Selected Pin State
  const [selectedRestId, setSelectedRestId] = useState<string>(
    allRestaurants[0]?.id || defaultFallbackRestaurant.id
  );

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [preselectedDishToBook, setPreselectedDishToBook] = useState<Dish | null>(null);

  // Filter Logic
  const filteredRestaurants = allRestaurants.filter((r) => {
    if (!r || !r.name) return false;
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine =
      selectedCuisine === "All" ||
      (Array.isArray(r.cuisines)
        ? r.cuisines.some((c) => c.toLowerCase().includes(selectedCuisine.toLowerCase()))
        : (r.cuisines as string).toLowerCase().includes(selectedCuisine.toLowerCase()));

    const matchesOpen = !openNowOnly || r.isOpen !== false;

    return matchesSearch && matchesCuisine && matchesOpen;
  });

  const selectedRestaurant =
    allRestaurants.find((r) => r.id === selectedRestId) || allRestaurants[0] || defaultFallbackRestaurant;

  const availableTables = (tables || []).filter((t) => t.status === "Available");

  // Map Marker Relative Placement Mock Positions
  const markerPositions: Record<string, { x: number; y: number }> = {
    "heritage-spice": { x: 35, y: 30 },
    "moulin-rouge": { x: 65, y: 25 },
    "sakura-tokyo": { x: 50, y: 60 },
    "la-piazza": { x: 25, y: 70 },
  };

  const cuisinesList = ["All", "North Indian", "Mughlai", "French", "Japanese", "Italian", "Fine Dining"];

  return (
    <div className="flex flex-col max-w-6xl mx-auto selection:bg-[#E77B49] selection:text-white pb-28 bg-background text-foreground px-4 sm:px-6 transition-colors duration-300">
      {/* Top Navigation Header */}
      <header className="py-6 border-b border-border dark:border-slate-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customer"
            className="p-2.5 rounded-2xl bg-card dark:bg-slate-900 border border-border dark:border-slate-800 text-foreground hover:bg-secondary/20 transition-colors shadow-xs"
            title="Back to Customer Portal"
          >
            <ChevronLeft className="size-4 text-[#E77B49]" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest">
              <Compass className="size-3 text-[#E77B49]" />
              <span>Live Location Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif italic text-[#60241E] dark:text-slate-100 font-bold tracking-tight mt-0.5">
              Interactive Radar Map
            </h1>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Map Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Filterable List & Radar Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Quick Filter Controls */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue by name, address, or city..."
                className="w-full h-11 pl-11 pr-10 rounded-2xl bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-xs placeholder:text-muted-foreground/60"
              />
              <Search className="absolute left-4 top-3.5 size-4 text-[#E77B49] pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Cuisines Filter Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cuisinesList.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCuisine(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    selectedCuisine === c
                      ? "bg-[#60241E] text-white shadow-xs"
                      : "bg-card dark:bg-slate-900 border border-border dark:border-slate-800 text-muted-foreground hover:bg-secondary/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Venues List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredRestaurants.length === 0 ? (
              <div className="bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl p-8 text-center text-xs text-muted-foreground">
                No partner venues matching "{searchQuery}".
              </div>
            ) : (
              filteredRestaurants.map((rest) => {
                const isSelected = selectedRestId === rest.id;
                return (
                  <div
                    key={rest.id}
                    onClick={() => setSelectedRestId(rest.id)}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? "bg-[#60241E]/5 dark:bg-[#E77B49]/10 border-[#E77B49] shadow-md"
                        : "bg-card dark:bg-slate-900 border-border dark:border-slate-800 hover:border-[#E77B49]/40"
                    }`}
                  >
                    <div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif italic text-lg font-bold text-[#60241E] dark:text-slate-100 truncate">
                            {rest.name}
                          </h3>
                          <span className="text-xs font-extrabold text-[#E77B49] flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>{rest.rating?.toFixed(1) || "5.0"}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium truncate mt-0.5">
                          <MapPin className="size-3 text-[#E77B49]" /> {rest.address || rest.city || "Local Venue"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {rest.isOpen !== false ? "Open Now" : "Closed"}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {Array.isArray(rest.cuisines) ? rest.cuisines.join(", ") : rest.cuisines}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Interactive Map Radar View & Selected Venue Banner */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Vector Radar Canvas Map */}
          <div className="relative w-full h-[380px] rounded-3xl bg-slate-900 overflow-hidden border-2 border-border dark:border-slate-800 shadow-xl flex items-center justify-center">
            {/* Map Grid Gridlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(231,123,73,0.15),transparent_70%)]" />

            {/* Radar Pulse Animation */}
            <div className="absolute size-64 rounded-full border border-[#E77B49]/30 animate-ping opacity-40 pointer-events-none" />
            <div className="absolute size-96 rounded-full border border-[#E77B49]/20 pointer-events-none" />

            {/* Center User Location Pointer */}
            <div className="absolute z-20 flex flex-col items-center gap-1 pointer-events-none">
              <div className="size-5 rounded-full bg-[#E77B49] text-white flex items-center justify-center shadow-lg ring-4 ring-[#E77B49]/30">
                <Navigation className="size-3 fill-current" />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                Your Position
              </span>
            </div>

            {/* Venue Map Markers */}
            {filteredRestaurants.map((rest) => {
              const pos = markerPositions[rest.id] || { x: 45 + Math.random() * 20, y: 40 + Math.random() * 20 };
              const isSelected = selectedRestId === rest.id;
              return (
                <button
                  key={rest.id}
                  type="button"
                  onClick={() => setSelectedRestId(rest.id)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${
                    isSelected ? "scale-125 z-40" : "hover:scale-110"
                  }`}
                >
                  <div
                    className={`px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border-2 transition-all ${
                      isSelected
                        ? "bg-[#60241E] text-white border-[#E77B49] ring-4 ring-[#E77B49]/30"
                        : "bg-white text-[#1F2937] border-gray-200"
                    }`}
                  >
                    <Building2 className={`size-3.5 ${isSelected ? "text-[#E77B49]" : "text-[#60241E]"}`} />
                    <span className="text-[10px] font-extrabold truncate max-w-[100px]">{rest.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Venue Details Card */}
          {selectedRestaurant && (
            <div className="bg-card dark:bg-slate-900 border-2 border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  {selectedRestaurant.logo ? (
                    <img
                      src={selectedRestaurant.logo}
                      alt={selectedRestaurant.name}
                      className="size-16 rounded-2xl object-cover border border-border dark:border-slate-800 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-[#60241E] to-[#E77B49] text-white flex items-center justify-center font-bold font-serif text-2xl border border-border dark:border-slate-800 shadow-xs shrink-0">
                      {selectedRestaurant.name?.charAt(0) || "S"}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49]">
                      Selected Partner Establishment
                    </span>
                    <h2 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-[#E77B49]" /> {selectedRestaurant.address}, {selectedRestaurant.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDirectionsModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-secondary/20 hover:bg-secondary/30 text-foreground text-xs font-extrabold transition-all flex items-center gap-1.5"
                  >
                    <Navigation className="size-3.5 text-[#E77B49]" />
                    <span>Get Directions</span>
                  </button>
                  <Link
                    to="/customer/restaurant/$restaurantId"
                    params={{ restaurantId: String(selectedRestaurant.id) }}
                    className="px-4 py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>View Venue Page</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <span>Contact: {selectedRestaurant.contactPhone || "+91 9876543210"}</span>
                  <span>Hours: {selectedRestaurant.openingHours}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="py-3 px-6 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Hold Table Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directions Dialog Modal */}
      {showDirectionsModal && selectedRestaurant && (
        <DirectionsModal
          isOpen={showDirectionsModal}
          onClose={() => setShowDirectionsModal(false)}
          restaurant={selectedRestaurant}
        />
      )}

      {/* Booking Dialog Modal */}
      {showBookingModal && selectedRestaurant && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          restaurant={selectedRestaurant}
          availableTables={availableTables}
          dishes={(dishes || []).filter((d) => d.restaurantId === selectedRestaurant.id)}
          preSelectedDish={preselectedDishToBook}
          onConfirmBooking={(bookingData) => {
            const itemsList = Object.entries(bookingData.selectedDishes).map(([id, quantity]) => {
              const dish = (dishes || []).find((d) => d.id === id)!;
              return {
                dishId: id,
                name: dish?.name || "Dish Item",
                price: dish?.discountPrice || dish?.price || 0,
                quantity,
              };
            });

            return createBooking({
              restaurantId: selectedRestaurant.id,
              restaurantName: selectedRestaurant.name,
              customerName: bookingData.customerName,
              customerPhone: bookingData.customerPhone,
              items: itemsList,
              tableId: bookingData.tableId,
              tableNumber: bookingData.tableNumber,
              date: bookingData.date,
              time: bookingData.time,
              totalAmount: bookingData.totalAmount,
              advanceAmount: bookingData.advanceAmount,
            });
          }}
        />
      )}
    </div>
  );
}