import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin,
  Sparkles,
  Flame,
  ArrowRight,
  Building2,
  Utensils,
  Map,
  Search,
  Navigation,
  CheckCircle2,
  X,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import {
  useStockDineStore,
  Dish,
  RestaurantDetails,
  RestaurantCategory,
  Booking,
} from "@/lib/stockdine-store";
import { RestaurantCard } from "@/components/RestaurantCard";
import { DishCard } from "@/components/DishCard";
import { BookingModal } from "@/components/BookingModal";
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

export const Route = createFileRoute("/customer/")({
  head: () => ({
    meta: [
      { title: "StockDine — Luxury Restaurant Discovery & Table Reservations" },
      {
        name: "description",
        content: "Discover top nearby fine dining restaurants, cafes, and signature dishes. View live table availability and reserve instantly.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const {
    dishes,
    tables,
    getAllRestaurantProfiles,
    getUniqueRestaurantList,
    createBooking,
  } = useStockDineStore();

  const restaurantProfilesMap = getAllRestaurantProfiles();
  const rawList = getUniqueRestaurantList ? getUniqueRestaurantList() : Object.values(restaurantProfilesMap);

  // Deduplicate restaurant list by unique id/name
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

  const restaurantList: RestaurantDetails[] = deduplicateList(rawList);

  // Attach restaurant names & details to dishes
  const enrichedDishes: Dish[] = (dishes || []).map((d) => {
    const profile = restaurantProfilesMap[d.restaurantId] || restaurantList[0] || defaultFallbackRestaurant;
    return {
      ...d,
      restaurantName: d.restaurantName || profile?.name || "StockDine Partner",
      restaurantLogo: d.restaurantLogo || profile?.logo,
      rating: d.rating || profile?.rating || 4.9,
    };
  });

  // Geolocation & Location State
  const [userLocationName, setUserLocationName] = useState<string>("Connaught Place, New Delhi");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationDetected, setLocationDetected] = useState<boolean>(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTab, setSearchTab] = useState<"Restaurants" | "Dishes">("Restaurants");

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory>("All");

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTargetRestaurant, setBookingTargetRestaurant] = useState<RestaurantDetails>(
    restaurantList[0] || defaultFallbackRestaurant
  );
  const [bookingTargetDish, setBookingTargetDish] = useState<Dish | null>(null);

  // Automatically attempt location detection on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setLocationDetected(true);
          setUserLocationName(`Near You (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`);
        },
        () => {
          setIsLocating(false);
          setLocationDetected(true);
          setUserLocationName("Connaught Place, New Delhi");
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      setLocationDetected(true);
    }
  };

  // Filter Restaurants
  const filteredRestaurants = restaurantList.filter((rest) => {
    if (!rest || !rest.name) return false;
    const matchesSearch =
      !searchQuery ||
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(rest.cuisines)
        ? rest.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
        : (rest.cuisines as string).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      selectedCategory === "All"
        ? true
        : selectedCategory === "Nearby"
        ? (rest.distanceKm || 1.2) <= 2.0
        : selectedCategory === "Popular"
        ? rest.rating >= 4.8
        : selectedCategory === "Top Rated"
        ? rest.rating >= 4.85
        : selectedCategory === "Newly Added"
        ? rest.category === "Newly Added" || rest.reviewsCount < 200
        : rest.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          (Array.isArray(rest.cuisines) &&
            rest.cuisines.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase())));

    return matchesSearch && matchesCat;
  });

  // Filter Dishes for Search
  const searchMatchingDishes = enrichedDishes.filter((d) => {
    if (!searchQuery) return false;
    return (
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.restaurantName && d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const categoryOptions: RestaurantCategory[] = [
    "All",
    "Nearby",
    "Popular",
    "Top Rated",
    "Newly Added",
    "Cafes",
    "Fine Dining",
    "Fast Food",
    "Family Restaurants",
  ];

  const handleBookRestaurant = (rest: RestaurantDetails) => {
    setBookingTargetRestaurant(rest);
    setBookingTargetDish(null);
    setShowBookingModal(true);
  };

  const handleBookDish = (dish: Dish) => {
    const targetRest = restaurantProfilesMap[dish.restaurantId] || restaurantList[0] || defaultFallbackRestaurant;
    setBookingTargetRestaurant(targetRest);
    setBookingTargetDish(dish);
    setShowBookingModal(true);
  };

  const activeTargetId = bookingTargetRestaurant?.id || defaultFallbackRestaurant.id;
  const availableTables = (tables || []).filter(
    (t) => (t.restaurantId === activeTargetId || !t.restaurantId) && t.status === "Available"
  );

  return (
    <div className="flex flex-col max-w-5xl mx-auto selection:bg-[#E77B49] selection:text-white pb-28 bg-background text-foreground px-4 sm:px-6 transition-colors duration-300">
      {/* Top Header Bar with Geolocation & Theme Toggle */}
      <header className="py-6 border-b border-border dark:border-slate-800 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#60241E]/10 dark:bg-[#E77B49]/20 border border-[#60241E]/20 text-[#60241E] dark:text-[#E77B49] text-xs font-bold mb-2">
              <Sparkles className="size-3 text-[#E77B49] fill-current" />
              <span>StockDine Luxury Experience</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-[#60241E] dark:text-slate-100 font-bold tracking-tight">
              Restaurants Near You
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Explore nearby partner venues, live table counts, menus, and reserve instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/customer/dishes"
              className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Utensils className="size-4" />
              <span>Browse Dishes</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>

        {/* Location Detection Pill & Global Search Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card dark:bg-slate-900 border border-border dark:border-slate-800 text-xs font-bold text-foreground shadow-xs">
              <MapPin className="size-3.5 text-[#E77B49] shrink-0" />
              <span>{userLocationName}</span>
              {isLocating && <span className="size-2 rounded-full bg-[#E77B49] animate-ping ml-1" />}
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 text-foreground text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95"
              title="Refresh Location"
            >
              <Navigation className={`size-3 text-[#E77B49] ${isLocating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Detect</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, cuisine, city, or dish (e.g. Galouti Kebab, Biryani)..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm transition-all placeholder:text-muted-foreground/60"
            />
            <Search className="absolute left-4 top-3.5 size-4 text-[#E77B49] pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#1F2937]"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Search Result Tabs when searching */}
          {searchQuery && (
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
              <button
                type="button"
                onClick={() => setSearchTab("Restaurants")}
                className={`py-1.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                  searchTab === "Restaurants"
                    ? "bg-[#60241E] text-white shadow-sm"
                    : "bg-[#F8F9FA] text-[#6B7280]"
                }`}
              >
                Restaurants ({filteredRestaurants.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchTab("Dishes")}
                className={`py-1.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                  searchTab === "Dishes"
                    ? "bg-[#60241E] text-white shadow-sm"
                    : "bg-[#F8F9FA] text-[#6B7280]"
                }`}
              >
                Dishes ({searchMatchingDishes.length})
              </button>
            </div>
          )}
        </div>

        {/* Restaurant Categories Filter Pills */}
        {!searchQuery && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-[#E77B49]">
                Category Filter
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedCategory === "All" ? "Showing all venues" : `Filter: ${selectedCategory}`}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-[#60241E] text-white shadow-md scale-102"
                      : "bg-[#F8F9FA] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-[#4B5563] dark:text-slate-300 hover:bg-[#E5E7EB]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="space-y-12">
        {/* If user searched and selected Dishes tab */}
        {searchQuery && searchTab === "Dishes" ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">
                Matching Dishes ({searchMatchingDishes.length})
              </h2>
              <Link
                to="/customer/dishes"
                className="text-xs font-extrabold text-[#E77B49] hover:underline flex items-center gap-1"
              >
                <span>View All Dishes</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {searchMatchingDishes.length === 0 ? (
              <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-dashed border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-10 text-center text-xs text-[#6B7280]">
                No dishes found matching "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchMatchingDishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} onAddBooking={handleBookDish} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* NEARBY RESTAURANTS SECTION */
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#60241E] dark:text-[#E77B49] bg-[#60241E]/10 dark:bg-[#E77B49]/20 px-3 py-1 rounded-full border border-[#60241E]/20">
                  Featured Partner Venues
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif italic font-bold tracking-tight text-[#60241E] dark:text-slate-100 mt-1.5 flex items-center gap-2">
                  <Building2 className="size-6 text-[#E77B49]" />
                  <span>Nearby Restaurants</span>
                </h2>
              </div>

              <Link
                to="/customer/map"
                className="text-xs font-extrabold text-[#E77B49] hover:underline flex items-center gap-1"
              >
                <span>View Live Radar Map</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-dashed border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Building2 className="size-10 text-[#E77B49] mx-auto opacity-50" />
                <h3 className="font-serif italic text-xl font-bold text-[#60241E] dark:text-slate-100">
                  No restaurants registered yet
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">
                  Registered partner restaurants will appear here automatically from MongoDB Atlas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-[#E77B49] text-white text-xs font-extrabold shadow-sm hover:bg-[#D66A38] transition-all"
                >
                  Show All Restaurants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredRestaurants.map((rest) => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    onBookNow={handleBookRestaurant}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Explore Dishes CTA Banner */}
        <section className="bg-gradient-to-r from-[#60241E] to-[#95271D] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/80 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                Dish Discovery Engine
              </span>
              <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-white">
                Looking for a Specific Signature Dish?
              </h3>
              <p className="text-xs text-white/80 max-w-md font-medium">
                Browse delicacies across every partner kitchen with live portion tracking and instant table booking.
              </p>
            </div>

            <Link
              to="/customer/dishes"
              className="py-3 px-6 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all shrink-0 active:scale-95 flex items-center gap-2"
            >
              <Utensils className="size-4" />
              <span>Explore Dishes</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Booking Dialog Modal */}
      {showBookingModal && bookingTargetRestaurant && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          restaurant={bookingTargetRestaurant}
          availableTables={availableTables}
          dishes={enrichedDishes.filter((d) => d.restaurantId === (bookingTargetRestaurant.id || ""))}
          preSelectedDish={bookingTargetDish}
          onConfirmBooking={(bookingData) => {
            const itemsList = Object.entries(bookingData.selectedDishes).map(([id, quantity]) => {
              const dish = enrichedDishes.find((d) => d.id === id)!;
              return {
                dishId: id,
                name: dish?.name || "Dish Item",
                price: dish?.discountPrice || dish?.price || 0,
                quantity,
              };
            });

            return createBooking({
              restaurantId: bookingTargetRestaurant?.id || "",
              restaurantName: bookingTargetRestaurant?.name || "Partner Restaurant",
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