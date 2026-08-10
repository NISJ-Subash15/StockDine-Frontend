import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GuestAuthModal } from "@/components/GuestAuthModal";
import { BookingModal } from "@/components/BookingModal";
import { useStockDineStore, formatCurrency } from "@/lib/stockdine-store";
import { api, formatImageUrl } from "@/lib/api";
import {
  Search,
  MapPin,
  UtensilsCrossed,
  Building2,
  Sparkles,
  ChefHat,
  Calendar,
  Flame,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  X,
  Compass,
  Navigation,
  Check,
  ShieldCheck,
  Bell,
  Heart,
  User,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockDine — Know What's Available. Book What's Ready. Dine Without Waiting." },
      {
        name: "description",
        content:
          "StockDine is a real-time dine-in discovery and table reservation platform. Check real-time food portion availability, view open tables, and reserve before you arrive.",
      },
    ],
  }),
  component: LandingPage,
});

// Cuisines list for Explore by Cuisine section
const CUISINES_LIST = [
  { name: "South Indian", image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", desc: "Crispy Dosa, Idli, Sambar & Chettinad Specials" },
  { name: "North Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80", desc: "Butter Chicken, Dal Makhani, Naan & Kebabs" },
  { name: "Chinese", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80", desc: "Hakka Noodles, Dim Sums, Manchurian & Bowls" },
  { name: "Italian", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", desc: "Wood-fired Pizzas, Handmade Pastas & Risottos" },
  { name: "Japanese", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80", desc: "Fresh Sushi Rolls, Ramen & Teriyaki Bowls" },
  { name: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", desc: "Gourmet Burgers, Loaded Fries & Shakes" },
  { name: "Healthy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80", desc: "Protein Bowls, Fresh Salads & Smoothies" },
  { name: "Desserts", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80", desc: "Artisanal Cakes, Ice Creams & Waffles" },
];

// Why StockDine Features
const WHY_STOCKDINE_FEATURES = [
  {
    title: "REAL-TIME FOOD AVAILABILITY",
    desc: "Know whether your desired dish is actually available in the kitchen before traveling.",
    icon: Flame,
    color: "#E77B49",
  },
  {
    title: "LIVE TABLE AVAILABILITY",
    desc: "Check real-time open dining tables and time slots before visiting.",
    icon: Calendar,
    color: "#60241E",
  },
  {
    title: "DISH-FIRST DISCOVERY",
    desc: "Search for the exact dish you crave instead of browsing restaurant menus endlessly.",
    icon: UtensilsCrossed,
    color: "#95271D",
  },
  {
    title: "ADVANCE TABLE BOOKING",
    desc: "Reserve your table instantly and pay only the small required advance amount.",
    icon: ShieldCheck,
    color: "#B34A44",
  },
  {
    title: "NEARBY DISCOVERY",
    desc: "Find premier restaurants around your location with live GPS routing.",
    icon: Navigation,
    color: "#E77B49",
  },
  {
    title: "VERIFIED DINING REVIEWS",
    desc: "Read authentic reviews from customers who completed their dine-in experience.",
    icon: Star,
    color: "#60241E",
  },
];

// How StockDine Works - 5 Simple Steps
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Find",
    desc: "Search the dish or restaurant you want to experience.",
    icon: Search,
  },
  {
    step: "02",
    title: "Check",
    desc: "See real-time food portion counters and open table availability.",
    icon: Flame,
  },
  {
    step: "03",
    title: "Reserve",
    desc: "Choose your dining date, time slot, guest count, and table.",
    icon: Calendar,
  },
  {
    step: "04",
    title: "Pay Advance",
    desc: "Pay only the required table holding advance amount securely.",
    icon: ShieldCheck,
  },
  {
    step: "05",
    title: "Dine",
    desc: "Visit the restaurant, skip the queue, and enjoy your meal.",
    icon: ChefHat,
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { authSession, signOut } = useStockDineStore();

  const isGuest = !authSession || !authSession.isLoggedIn;
  const customerName = authSession?.profileData?.name || authSession?.userEmail?.split("@")[0] || "Customer";

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState("Hyderabad");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Search Bar & Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ dishes: any[]; restaurants: any[]; cuisines: string[] }>({
    dishes: [],
    restaurants: [],
    cuisines: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // Video Error / Fallback State (default to true to use crisp hero background image cleanly)
  const [videoError, setVideoError] = useState(true);

  // Real Database Data state
  const [dishes, setDishes] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState<string | null>(null);

  // Guest Auth Modal state
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingRest, setSelectedBookingRest] = useState<any>(null);

  // Sticky Navbar state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Real Data from MongoDB APIs
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Real Available Dishes
      const dishRes: any = await api.dishes.getAll({ availableOnly: true }).catch(() => ({ dishes: [] }));
      if (dishRes && dishRes.dishes) {
        setDishes(dishRes.dishes);
      }

      // 2. Fetch Real Restaurants
      const restRes: any = await api.restaurants.getAll().catch(() => ({ restaurants: [] }));
      if (restRes && restRes.restaurants) {
        setRestaurants(restRes.restaurants);
      }

      // 3. Fetch Featured Customer Reviews
      const revRes: any = await api.reviews.getFeatured().catch(() => ({ reviews: [] }));
      if (revRes && revRes.reviews) {
        setReviews(revRes.reviews);
      }
    } catch (err) {
      console.warn("Notice: Live data fetch:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Debounced Intelligent Search API Call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ dishes: [], restaurants: [], cuisines: [] });
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res: any = await api.search.query(searchQuery.trim());
        if (res && res.results) {
          setSearchResults(res.results);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Protected Action Handler
  const handleProtectedAction = (actionCallback: () => void) => {
    if (isGuest) {
      setGuestModalOpen(true);
    } else {
      actionCallback();
    }
  };

  // Filtered Restaurants by selected cuisine
  const filteredRestaurants = selectedCuisineFilter
    ? restaurants.filter((r) => r.cuisine?.toLowerCase().includes(selectedCuisineFilter.toLowerCase()))
    : restaurants;

  // Filtered Dishes by selected cuisine
  const filteredDishes = selectedCuisineFilter
    ? dishes.filter((d) => d.category?.toLowerCase().includes(selectedCuisineFilter.toLowerCase()) || d.dishName?.toLowerCase().includes(selectedCuisineFilter.toLowerCase()))
    : dishes;

  // Restaurants with available tables
  const restaurantsWithTables = restaurants.filter((r) => r.availableTablesCount && r.availableTablesCount > 0);

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 font-sans selection:bg-[#E77B49] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 12. NAVBAR SECTION */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border-b border-border/40 py-3"
            : "bg-gradient-to-b from-black/70 via-black/40 to-transparent text-white py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div>
              <span
                className={`font-serif italic text-2xl font-bold tracking-tight block leading-none ${
                  isScrolled ? "text-[#60241E] dark:text-[#E77B49]" : "text-white"
                }`}
              >
                StockDine
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.25em] font-extrabold block mt-0.5 ${
                  isScrolled ? "text-[#E77B49] dark:text-slate-400" : "text-amber-300"
                }`}
              >
                Dine-In Intelligence
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isGuest ? (
              /* GUEST SIGNED OUT STATE */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth/customer/login" })}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isScrolled
                      ? "text-[#60241E] dark:text-slate-200 hover:text-[#E77B49]"
                      : "text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth/select-role", search: { mode: "signup" } })}
                  className="px-4.5 py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              /* SIGNED IN CUSTOMER STATE */
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/customer/bookings"
                  className={`p-2.5 rounded-2xl transition-colors relative ${
                    isScrolled ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-[#60241E] dark:text-slate-200" : "hover:bg-white/20 text-white"
                  }`}
                  title="My Bookings"
                >
                  <Bell className="size-4" />
                </Link>

                <Link
                  to="/customer/favorites"
                  className={`p-2.5 rounded-2xl transition-colors ${
                    isScrolled ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-[#60241E] dark:text-slate-200" : "hover:bg-white/20 text-white"
                  }`}
                  title="Favorites"
                >
                  <Heart className="size-4" />
                </Link>

                <Link
                  to="/customer/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#60241E]/10 dark:bg-slate-800 border border-[#E77B49]/30 text-[#60241E] dark:text-slate-100 text-xs font-bold hover:border-[#E77B49] transition-all"
                >
                  <div className="size-6 rounded-full bg-[#E77B49] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {customerName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{customerName}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className={`p-2.5 rounded-2xl transition-colors ${
                    isScrolled ? "hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40" : "hover:bg-white/20 text-white"
                  }`}
                  title="Logout"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. PREMIUM HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
        {/* Hero Background Video Player */}
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-0"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        ) : null}

        {/* Fallback Static Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 pointer-events-none transition-transform duration-1000 z-0"
          style={{ backgroundImage: "url('/hero_restaurant_bg.png')" }}
        />

        {/* Dark & Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(231,123,73,0.3),transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(96,36,30,0.5),transparent_60%)] pointer-events-none z-0" />

        {/* Ambient Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E77B49]/15 border border-[#E77B49]/30 text-amber-300 text-xs font-extrabold tracking-wider uppercase animate-in fade-in duration-500">
            <Sparkles className="size-3.5 text-[#E77B49]" />
            <span>Real-Time Dine-In Intelligence Platform</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Know What's Available. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#E77B49] to-orange-400">
                Book What's Ready.
              </span>{" "}
              <br className="hidden sm:inline" />
              Dine Without Waiting.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Discover dishes that are available right now, find premier restaurants nearby, and reserve your table before you arrive.
            </p>
          </div>

          {/* Location Selector & Search Container */}
          <div ref={searchRef} className="relative max-w-2xl mx-auto w-full space-y-3">
            <div className="p-2 sm:p-3 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-left">
              {/* Location Picker */}
              <div className="relative w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-[#60241E]/10 dark:bg-slate-800 text-xs font-extrabold text-[#60241E] dark:text-slate-100 border border-[#E77B49]/30 hover:border-[#E77B49] transition-all shadow-sm group"
                >
                  <div className="relative flex items-center justify-center">
                    <MapPin className="size-4 text-[#E77B49] group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <span className="truncate">{selectedLocation}</span>
                  <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${showLocationDropdown ? "rotate-90" : ""}`} />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {["Hyderabad", "Bengaluru", "Mumbai", "Chennai", "Delhi NCR"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          selectedLocation === loc ? "bg-[#E77B49] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input field */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute left-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSearchDropdown(true);
                  }}
                  placeholder="Search dishes, restaurants, or cuisines..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                {isSearching && (
                  <div className="absolute right-3 size-4 border-2 border-[#E77B49] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate({ to: "/customer", search: { search: searchQuery } });
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            {/* Quick Filter Examples */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-extrabold text-slate-300 pt-1">
              <span className="text-slate-400">Popular:</span>
              {["Chicken Biryani", "Mutton Biryani", "Pizza", "South Indian", "Restaurants near me"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSearchQuery(chip)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* ========================================================================= */}
            {/* 2. INTELLIGENT SEARCH AUTOCOMPLETE DROPDOWN */}
            {/* ========================================================================= */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border/80 dark:border-slate-800 p-4 z-50 text-left space-y-4 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {/* DISHES GROUP */}
                {searchResults.dishes && searchResults.dishes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49]">
                      <UtensilsCrossed className="size-3.5" />
                      <span>Dishes</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.dishes.map((dish) => (
                        <div
                          key={dish._id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            if (dish.restaurant?._id || dish.restaurant) {
                              navigate({ to: `/customer/restaurant/${dish.restaurant._id || dish.restaurant}` });
                            }
                          }}
                          className="p-2.5 rounded-2xl bg-secondary/10 hover:bg-[#E77B49]/10 border border-border/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={formatImageUrl(dish.dishImage)}
                              alt={dish.dishName}
                              className="size-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate text-foreground">{dish.dishName}</span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {dish.restaurant?.restaurantName || "Restaurant"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-[#E77B49] block">{formatCurrency(dish.price)}</span>
                            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              🟢 {dish.portionsLeft || 5} Left
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESTAURANTS GROUP */}
                {searchResults.restaurants && searchResults.restaurants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#60241E] dark:text-slate-300">
                      <Building2 className="size-3.5" />
                      <span>Restaurants</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.restaurants.map((rest) => (
                        <div
                          key={rest._id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate({ to: `/customer/restaurant/${rest._id}` });
                          }}
                          className="p-2.5 rounded-2xl bg-secondary/10 hover:bg-[#E77B49]/10 border border-border/50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={formatImageUrl(rest.restaurantLogo || rest.restaurantCover)}
                              alt={rest.restaurantName}
                              className="size-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <span className="text-xs font-bold block text-foreground">{rest.restaurantName}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {rest.cuisine} • {rest.city || "Nearby"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>{rest.rating || "4.5"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CUISINES GROUP */}
                {searchResults.cuisines && searchResults.cuisines.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      <Compass className="size-3.5" />
                      <span>Cuisines</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {searchResults.cuisines.map((cuis) => (
                        <button
                          key={cuis}
                          type="button"
                          onClick={() => {
                            setSelectedCuisineFilter(cuis);
                            setShowSearchDropdown(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-secondary/20 hover:bg-[#E77B49] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          {cuis}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searchResults.dishes?.length && !searchResults.restaurants?.length && !searchResults.cuisines?.length && (
                  <div className="text-center py-6 text-xs text-muted-foreground font-medium">
                    No results found matching "{searchQuery}". Try searching for biryani, pizza, or restaurant names.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/customer" })}
              className="px-8 py-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white font-extrabold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all active:scale-95 cursor-pointer flex items-center gap-2.5"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("available-dishes-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider border border-white/25 backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <UtensilsCrossed className="size-4" />
              <span>Find a Dish</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. AVAILABLE DISHES NEAR YOU (Real Database Dishes) */}
      {/* ========================================================================= */}
      <section id="available-dishes-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-widest border border-rose-500/20 mb-2">
              <Flame className="size-3.5 fill-rose-500" />
              <span>Real-Time Portion Counter</span>
            </div>
            <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
              🔥 Available Dishes Near You
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Portions active right now in nearby restaurant kitchens. Check before you travel!
            </p>
          </div>

          <Link to="/customer" className="text-xs font-extrabold text-[#E77B49] hover:underline flex items-center gap-1">
            <span>View All Live Menus</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-secondary/10 rounded-3xl p-8 space-y-3">
            <UtensilsCrossed className="size-10 text-muted-foreground mx-auto" />
            <h3 className="font-serif italic text-xl font-bold text-foreground">No Available Dishes Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No live kitchen portions match your filter right now. Check back soon as restaurants update their real-time menu counters!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDishes.slice(0, 8).map((dish) => {
              const restName = dish.restaurant?.restaurantName || "Premier Restaurant";
              const restId = dish.restaurant?._id || dish.restaurant;

              return (
                <div
                  key={dish._id}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={formatImageUrl(dish.dishImage)}
                      alt={dish.dishName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-md">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>🟢 Available Now</span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold">
                      {dish.portionsLeft || 10} portions left
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase text-[#E77B49] tracking-wider">
                          {dish.category || "Main Course"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          <span>4.8</span>
                        </div>
                      </div>

                      <h3 className="font-serif italic text-lg font-bold text-foreground group-hover:text-[#E77B49] transition-colors">
                        {dish.dishName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Building2 className="size-3 text-[#E77B49]" />
                        <span>{restName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground block">
                          Price
                        </span>
                        <span className="text-base font-extrabold text-[#60241E] dark:text-[#E77B49]">
                          {formatCurrency(dish.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (restId) {
                            navigate({ to: `/customer/restaurant/${restId}` });
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-secondary/20 hover:bg-[#E77B49] hover:text-white text-[#60241E] dark:text-slate-100 text-xs font-extrabold transition-all cursor-pointer"
                      >
                        View Dish →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



      {/* ========================================================================= */}
      {/* 5. POPULAR RESTAURANTS NEAR YOU (Real Database Restaurants) */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#60241E]/10 text-[#60241E] dark:text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest border border-[#60241E]/20 mb-2">
              <Building2 className="size-3.5" />
              <span>Partner Dining Spots</span>
            </div>
            <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
              Popular Restaurants Near You
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Top rated restaurants with live food & table status integrations.
            </p>
          </div>

          <Link to="/customer" className="text-xs font-extrabold text-[#E77B49] hover:underline flex items-center gap-1">
            <span>Explore All Restaurants</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-secondary/10 rounded-3xl p-8 space-y-3">
            <Building2 className="size-10 text-muted-foreground mx-auto" />
            <h3 className="font-serif italic text-xl font-bold text-foreground">No Restaurants Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No restaurants currently match your selected filters. Click below to view all available restaurants!
            </p>
            <button
              type="button"
              onClick={() => setSelectedCuisineFilter(null)}
              className="px-4 py-2 rounded-2xl bg-[#E77B49] text-white text-xs font-extrabold"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRestaurants.slice(0, 6).map((rest) => (
              <div
                key={rest._id}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={formatImageUrl(rest.restaurantCover || rest.restaurantLogo)}
                      alt={rest.restaurantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 border border-white/20">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{rest.rating || "4.8"}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-extrabold flex items-center gap-1.5">
                      <Flame className="size-3 text-[#E77B49]" />
                      <span>{rest.availableDishes || 8} Active Dishes</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-serif italic text-2xl font-bold text-foreground group-hover:text-[#E77B49] transition-colors">
                        {rest.restaurantName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {rest.cuisine} • {rest.address || rest.city || "Hyderabad"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-border/50">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>🟢</span>
                        <span>{rest.availableTablesCount ? `${rest.availableTablesCount} Tables Open` : "Tables Available"}</span>
                      </span>

                      <span className="text-muted-foreground">₹₹ • Dine-In</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => navigate({ to: `/customer/restaurant/${rest._id}` })}
                    className="w-full py-3.5 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>View Restaurant</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. EXPLORE BY CUISINE SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E77B49]/10 text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest border border-[#E77B49]/20">
            <Compass className="size-3.5" />
            <span>Taste Palette</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
            Explore By Cuisine
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Filter real-time available menus and tables by your favorite culinary styles.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {CUISINES_LIST.map((cuis) => {
            const isSelected = selectedCuisineFilter === cuis.name;
            return (
              <div
                key={cuis.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCuisineFilter(null);
                  } else {
                    setSelectedCuisineFilter(cuis.name);
                  }
                }}
                className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 ${
                  isSelected
                    ? "border-[#E77B49] ring-2 ring-[#E77B49] shadow-2xl scale-[1.03]"
                    : "border-border/60 dark:border-slate-800 hover:border-[#E77B49]/60 hover:shadow-xl"
                }`}
              >
                {/* Real Dish Background Image */}
                <img
                  src={cuis.image}
                  alt={cuis.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/20 pointer-events-none" />

                <div className="relative z-10 p-4 flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-300 border border-white/20">
                    {cuis.name}
                  </span>
                  {isSelected && (
                    <span className="size-6 rounded-full bg-[#E77B49] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      ✓
                    </span>
                  )}
                </div>

                <div className="relative z-10 p-5 space-y-1">
                  <h3 className="font-serif italic text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cuis.name}
                  </h3>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-2 leading-snug">
                    {cuis.desc}
                  </p>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E77B49] block pt-1">
                    {isSelected ? "Filter Applied ✓" : "Explore Cuisine →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PROBLEM → SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-[#60241E] via-[#4A1B17] to-slate-950 text-white p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,123,73,0.2),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              The Real-Time Dining Solution
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold tracking-tight text-white pt-2">
              Don't Travel For Food That's Sold Out.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Why guess availability when you can verify food portions and reserve open tables in seconds?
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* BEFORE STOCKDINE */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/40 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold uppercase tracking-widest">
                <X className="size-5 shrink-0" />
                <span>Before StockDine (Traditional Routine)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-black/30">
                  <span className="size-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold shrink-0">1</span>
                  <span>Search for a restaurant online blindly</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-black/30">
                  <span className="size-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold shrink-0">2</span>
                  <span>Travel 45+ minutes through city traffic</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-black/30">
                  <span className="size-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold shrink-0">3</span>
                  <span>Arrive and find signature dish is <strong>SOLD OUT</strong></span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-black/30">
                  <span className="size-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold shrink-0">4</span>
                  <span>Wait in a 30-minute queue for an open table</span>
                </li>
              </ul>
            </div>

            {/* WITH STOCKDINE */}
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
                <Check className="size-5 shrink-0" />
                <span>With StockDine (Real-Time Experience)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-medium">
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-900/30 border border-emerald-500/20">
                  <span className="size-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">1</span>
                  <span>Search exact dish & check live portion counter</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-900/30 border border-emerald-500/20">
                  <span className="size-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">2</span>
                  <span>Check live table availability & time slots</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-900/30 border border-emerald-500/20">
                  <span className="size-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">3</span>
                  <span>Reserve table & dish in 3 seconds</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-900/30 border border-emerald-500/20">
                  <span className="size-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">4</span>
                  <span>Arrive, scan QR, dine immediately without waiting!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STOCKDINE DIFFERENCE (Why StockDine?) */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#E77B49] bg-[#E77B49]/10 px-3.5 py-1.5 rounded-full border border-[#E77B49]/20">
            Product Features
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100 pt-1">
            Why StockDine?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Built from the ground up for real-time dining intelligence and zero-wait dining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {WHY_STOCKDINE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-[#E77B49]/50 transition-all duration-300 space-y-4 group"
              >
                <div
                  className="size-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feat.color}15`, color: feat.color }}
                >
                  <Icon className="size-7 stroke-[2]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif italic text-xl font-bold text-foreground group-hover:text-[#E77B49] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HOW STOCKDINE WORKS (5 Simple Steps) */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#60241E] dark:text-slate-300 bg-secondary/20 px-3.5 py-1.5 rounded-full">
            5 Simple Steps
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100 pt-1">
            How StockDine Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            From craving to table seating in 5 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {HOW_IT_WORKS_STEPS.map((s) => {
            const StepIcon = s.icon;
            return (
              <div
                key={s.step}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-800 shadow-md space-y-4 relative hover:border-[#E77B49] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-[#E77B49]">{s.step}</span>
                  <div className="size-10 rounded-xl bg-secondary/15 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center">
                    <StepIcon className="size-5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif italic text-xl font-bold text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CUSTOMER REVIEWS (Real Database Reviews) */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/20">
            <Star className="size-3.5 fill-amber-500" />
            <span>Verified Customer Feedback</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
            What Diners Say
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Real dining reviews from verified customers who booked and dined via StockDine.
          </p>
        </div>

        {reviews.length === 0 ? (
          /* CLEAN EMPTY STATE IF NO REVIEWS EXIST IN DB */
          <div className="text-center py-12 bg-secondary/10 rounded-3xl p-8 space-y-3 max-w-xl mx-auto">
            <Star className="size-10 text-amber-400 mx-auto" />
            <h3 className="font-serif italic text-xl font-bold text-foreground">Be The First To Review!</h3>
            <p className="text-xs text-muted-foreground">
              No public customer reviews have been submitted yet. Complete a dining reservation to share your experience!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < (rev.restaurantRating || 5) ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E77B49]">
                      Verified Diner
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 font-medium italic leading-relaxed">
                    "{rev.review || "Excellent dine-in experience! Portion counters were accurate and table was ready on arrival."}"
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">{rev.customerName || rev.user?.name || "StockDine Diner"}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {rev.restaurant?.restaurantName || "Premier Restaurant"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 11. APP / FINAL CTA SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#60241E] to-[#E77B49] text-white p-8 sm:p-14 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Your Table Is Waiting.
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              Find the food you want. Check portion availability. Reserve your table. Dine without waiting!
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/customer" })}
              className="px-8 py-4 rounded-2xl bg-white text-[#60241E] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:bg-slate-100 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (isGuest) {
                  setGuestModalOpen(true);
                } else {
                  navigate({ to: "/customer" });
                }
              }}
              className="px-8 py-4 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-extrabold text-xs uppercase tracking-wider border border-white/30 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white dark:bg-slate-950 border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="font-serif italic text-xl font-bold text-[#60241E] dark:text-slate-200">StockDine</span>
        </div>
        <p className="max-w-md mx-auto">
          StockDine is a real-time dine-in discovery and table reservation platform.
        </p>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} StockDine Inc. All rights reserved. Real-time MongoDB session.
        </p>
      </footer>

      {/* GUEST AUTH MODAL */}
      <GuestAuthModal isOpen={guestModalOpen} onClose={() => setGuestModalOpen(false)} />

      {/* BOOKING MODAL */}
      {selectedBookingRest && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedBookingRest(null);
          }}
          restaurant={selectedBookingRest}
        />
      )}
    </div>
  );
}