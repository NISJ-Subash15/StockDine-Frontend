import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GuestAuthModal } from "@/components/GuestAuthModal";
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
  Activity,
  Camera,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  Globe,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  Compass,
  Award,
  Navigation,
  Check,
  Zap,
  TrendingUp,
  Layers,
  ShoppingBag,
  Bell,
  Heart,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockDine — Find Available Food Before You Travel" },
      {
        name: "description",
        content:
          "Discover nearby restaurants, view live available menus, reserve tables, and navigate with confidence—all in one place.",
      },
    ],
  }),
  component: LandingPage,
});

// Why StockDine Feature Cards
const WHY_STOCKDINE_FEATURES = [
  {
    icon: Flame,
    title: "Live Menu Availability",
    desc: "Real-time kitchen portion counters updated dynamically as orders are served.",
    color: "#E77B49",
  },
  {
    icon: Calendar,
    title: "Table Reservation",
    desc: "Instant table holding with zero advance booking fees or hidden charges.",
    color: "#60241E",
  },
  {
    icon: Navigation,
    title: "Google Maps Navigation",
    desc: "Direct GPS turn-by-turn routing with live ETA and traffic awareness.",
    color: "#95271D",
  },
  {
    icon: ChefHat,
    title: "Real-Time Kitchen Updates",
    desc: "Transparent kitchen pipeline status from order receipt to active stove prep.",
    color: "#B34A44",
  },
  {
    icon: Activity,
    title: "Food Availability Status",
    desc: "Smart badges showing Available, Fast Selling, Limited Stock, or Sold Out.",
    color: "#E77B49",
  },
  {
    icon: Camera,
    title: "Restaurant Photos",
    desc: "High-definition 4K photo galleries of dining halls, VIP suites, and signature dishes.",
    color: "#60241E",
  },
  {
    icon: QrCode,
    title: "QR Check-In",
    desc: "Touchless arrival confirmation and table seating via instant QR code scan.",
    color: "#95271D",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Encrypted checkout with digital pass tokens and instant refund protection.",
    color: "#E77B49",
  },
];

// How It Works Steps
const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Find Nearby Restaurants",
    desc: "Discover top-rated dining spots around your location or search by dish cravings.",
    icon: Search,
  },
  {
    number: "02",
    title: "View Live Available Menu",
    desc: "Check live portion stock and availability directly synced from kitchen terminals.",
    icon: UtensilsCrossed,
  },
  {
    number: "03",
    title: "Reserve Table",
    desc: "Lock in your preferred seating (Window Side, Outdoor Patio, or VIP Lounge).",
    icon: Calendar,
  },
  {
    number: "04",
    title: "Navigate using Maps",
    desc: "Follow instant turn-by-turn Google Maps routing right to the restaurant door.",
    icon: MapPin,
  },
  {
    number: "05",
    title: "Enjoy Your Meal",
    desc: "Scan your QR code pass on arrival, sit down, and enjoy freshly prepared food.",
    icon: Sparkles,
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { authSession } = useStockDineStore();

  const isGuest = !authSession || !authSession.isLoggedIn;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("reserve a table");

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real MongoDB dataset states
  const [realRestaurants, setRealRestaurants] = useState<any[]>([]);
  const [realDishes, setRealDishes] = useState<any[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);

  // Search Card Form State & Autocomplete
  const [searchDish, setSearchDish] = useState("");
  const [searchRestaurant, setSearchRestaurant] = useState("");
  const [searchLocation, setSearchLocation] = useState("Indiranagar, Bengaluru");
  const [isLocating, setIsLocating] = useState(false);

  const [activeInput, setActiveInput] = useState<"dish" | "restaurant" | null>(null);
  const [debouncedDishQuery, setDebouncedDishQuery] = useState("");
  const [debouncedRestQuery, setDebouncedRestQuery] = useState("");

  const [activeSection, setActiveSection] = useState("hero");

  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDishQuery(searchDish.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchDish]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRestQuery(searchRestaurant.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchRestaurant]);

  // Fetch real data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingRestaurants(true);
      setIsLoadingDishes(true);
      try {
        const [restRes, dishRes] = await Promise.all([
          api.restaurants.getAll().catch(() => ({ success: false, restaurants: [] })),
          api.dishes.getAll({ availableOnly: "true" }).catch(() => ({ success: false, dishes: [] })),
        ]);

        if (isMounted) {
          if (restRes && restRes.restaurants) {
            setRealRestaurants(restRes.restaurants);
          }
          if (dishRes && dishRes.dishes) {
            setRealDishes(dishRes.dishes);
          }
        }
      } catch (err) {
        console.error("Error fetching landing page data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingRestaurants(false);
          setIsLoadingDishes(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track scroll position for sticky navbar blur & shadow, and track active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const navSections = ["hero", "popular-dishes", "nearby-restaurants", "why-stockdine", "footer"];
      const scrollPosition = window.scrollY + 140;
      for (let i = navSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(navSections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navSections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDetectLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setSearchLocation("Current Location (GPS Active)");
      setIsLocating(false);
    }, 800);
  };

  const handleRestrictedAction = (actionName: string, onAllowed?: () => void) => {
    if (isGuest) {
      setAuthModalAction(actionName);
      setShowAuthModal(true);
    } else if (onAllowed) {
      onAllowed();
    }
  };

  const handleExploreSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveInput(null);
    if (searchRestaurant.trim()) {
      const matchedRest = realRestaurants.find((r) =>
        (r.restaurantName || "").toLowerCase().includes(searchRestaurant.trim().toLowerCase())
      );
      if (matchedRest) {
        navigate({
          to: "/customer/restaurant/$restaurantId",
          params: { restaurantId: matchedRest._id || matchedRest.restaurantId },
        });
        return;
      }
    }
    navigate({
      to: "/customer",
      search: {
        dish: searchDish,
        rest: searchRestaurant,
        location: searchLocation,
      },
    });
  };

  // Filter live suggestions
  const matchingDishSuggestions = debouncedDishQuery
    ? realDishes
        .filter((d) => {
          const name = (d.dishName || "").toLowerCase();
          const cat = (d.category || "").toLowerCase();
          const desc = (d.description || "").toLowerCase();
          return name.includes(debouncedDishQuery) || cat.includes(debouncedDishQuery) || desc.includes(debouncedDishQuery);
        })
        .slice(0, 5)
    : [];

  const matchingRestSuggestions = debouncedRestQuery
    ? realRestaurants
        .filter((r) => {
          const name = (r.restaurantName || "").toLowerCase();
          const cuisine = (r.cuisine || "").toLowerCase();
          const city = (r.city || "").toLowerCase();
          const addr = (r.address || "").toLowerCase();
          return name.includes(debouncedRestQuery) || cuisine.includes(debouncedRestQuery) || city.includes(debouncedRestQuery) || addr.includes(debouncedRestQuery);
        })
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 font-sans selection:bg-[#E77B49] selection:text-white transition-colors duration-300 relative overflow-x-hidden">
      {/* -------------------------------------------------- */}
      {/* SECTION 1 – NAVIGATION */}
      {/* -------------------------------------------------- */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white dark:bg-slate-950/95 backdrop-blur-xl shadow-md border-b border-slate-200/80 dark:border-slate-800 py-3"
            : "bg-gradient-to-b from-black/40 via-black/15 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: StockDine Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div>
              <span
                className={`font-serif italic text-2xl sm:text-3xl font-bold tracking-tight block leading-none transition-colors duration-300 ${
                  isScrolled
                    ? "text-[#60241E] dark:text-[#E77B49]"
                    : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                }`}
              >
                StockDine
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.25em] font-extrabold block mt-0.5 transition-colors duration-300 ${
                  isScrolled
                    ? "text-[#E77B49] dark:text-slate-400"
                    : "text-[#E77B49] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                }`}
              >
                Live Dine-In OS
              </span>
            </div>
          </Link>

          {/* Center Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-extrabold tracking-wide uppercase transition-colors duration-300">
            {[
              { id: "hero", label: "Home" },
              { id: "popular-dishes", label: "Features" },
              { id: "nearby-restaurants", label: "Restaurants" },
              { id: "why-stockdine", label: "About" },
              { id: "footer", label: "Contact" },
            ].map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`transition-colors duration-200 py-1 ${
                    isScrolled
                      ? isActive
                        ? "text-[#E77B49] font-black border-b-2 border-[#E77B49]"
                        : "text-[#2D3748] dark:text-slate-200 hover:text-[#E77B49]"
                      : isActive
                        ? "text-[#E77B49] font-black drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] border-b-2 border-[#E77B49]"
                        : "text-white hover:text-[#E77B49] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.7)]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right Action Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {!isGuest ? (
              /* SIGNED IN STATE: Notifications, Favorites, My Bookings, Profile */
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <button
                  type="button"
                  title="Notifications"
                  onClick={() => alert("No new notifications")}
                  className={`p-2.5 rounded-2xl transition-all relative cursor-pointer ${
                    isScrolled
                      ? "text-[#60241E] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md"
                  }`}
                >
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#E77B49] animate-pulse" />
                </button>

                <Link
                  to="/customer/favorites"
                  className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isScrolled
                      ? "text-[#2D3748] dark:text-slate-200 hover:text-[#E77B49]"
                      : "text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md"
                  }`}
                >
                  <Heart className="size-4 text-rose-500 fill-rose-500" />
                  <span>Favorites</span>
                </Link>

                <Link
                  to="/customer/bookings"
                  className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isScrolled
                      ? "text-[#2D3748] dark:text-slate-200 hover:text-[#E77B49]"
                      : "text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md"
                  }`}
                >
                  <Calendar className="size-4 text-[#E77B49]" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/customer/profile"
                  className={`px-3.5 py-2 rounded-2xl text-white font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isScrolled
                      ? "bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38]"
                      : "bg-[#E77B49] hover:bg-[#D66A38] border border-white/20"
                  }`}
                >
                  <User className="size-4" />
                  <span>Profile</span>
                </Link>
              </div>
            ) : (
              /* GUEST SIGNED OUT STATE: Sign In & Get Started */
              <>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth/select-role", search: { mode: "login" } })}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isScrolled
                      ? "text-[#60241E] dark:text-slate-200 hover:text-[#E77B49]"
                      : "text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md hover:text-white shadow-sm"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth/select-role", search: { mode: "signup" } })}
                  className={`px-5 py-2.5 rounded-2xl text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                    isScrolled
                      ? "bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38]"
                      : "bg-[#E77B49] hover:bg-[#D66A38] border border-white/20 shadow-lg"
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-2xl transition-colors ${
                isScrolled
                  ? "bg-[#60241E]/10 text-[#60241E] dark:text-slate-200"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md"
              }`}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-border p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-3 text-sm font-extrabold uppercase text-[#1F2937] dark:text-slate-200">
              {[
                { id: "hero", label: "Home" },
                { id: "popular-dishes", label: "Features" },
                { id: "nearby-restaurants", label: "Restaurants" },
                { id: "why-stockdine", label: "About" },
                { id: "footer", label: "Contact" },
              ].map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-1 border-b border-border/30 transition-colors ${
                      isActive ? "text-[#E77B49] font-black" : "hover:text-[#E77B49]"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              {!isGuest ? (
                <>
                  <Link
                    to="/customer/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-2xl bg-[#E77B49]/15 text-[#60241E] dark:text-[#E77B49] font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <Calendar className="size-4 text-[#E77B49]" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/customer/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-2xl bg-rose-500/10 text-rose-600 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <Heart className="size-4 text-rose-500 fill-rose-500" />
                    <span>Favorites</span>
                  </Link>

                  <Link
                    to="/customer/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] text-white font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider shadow-md"
                  >
                    <User className="size-4" />
                    <span>Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ to: "/auth/select-role", search: { mode: "login" } });
                    }}
                    className="w-full py-3 rounded-2xl bg-secondary/30 text-[#60241E] dark:text-slate-200 font-extrabold text-xs cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate({ to: "/auth/select-role", search: { mode: "signup" } });
                    }}
                    className="w-full py-3 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* -------------------------------------------------- */}
      {/* SECTION 2 – HERO BANNER & GLASS SEARCH CARD */}
      {/* -------------------------------------------------- */}
      <section id="hero" className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden">
        {/* Hero Background Image with Warm Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000"
            alt="StockDine Restaurant Ambiance"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#60241E]/75 via-[#60241E]/50 to-black/25 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(231,123,73,0.18),transparent_65%)] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-white text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase shadow-md">
              <Sparkles className="size-4 text-[#E77B49] fill-current" />
              <span>Real-Time Dine-In Stock Tracker</span>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-md">
              Find Available Food <br />
              <span className="text-[#E77B49] not-italic font-sans underline decoration-[#E77B49]/40 underline-offset-8">
                Before You Travel
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/90 font-medium max-w-xl leading-relaxed drop-shadow-sm">
              Discover nearby restaurants, view live available menus, reserve tables, and navigate with confidence—all in one place.
            </p>

            {/* Quick Metrics Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-white/90 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#E77B49]" />
                <span>Zero Wait Time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#E77B49]" />
                <span>Live Portions Left</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#E77B49]" />
                <span>Google Maps GPS Routing</span>
              </div>
            </div>
          </div>

          {/* Right Glassmorphic Search Card Column */}
          <div className="lg:col-span-5">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-2 border-white/60 dark:border-slate-800 shadow-2xl p-6 sm:p-8 rounded-3xl space-y-5 relative text-[#1F2937] dark:text-slate-100">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="size-5 text-[#E77B49]" />
                  <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100">
                    Live Stock Search
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#E77B49]/15 text-[#60241E] dark:text-[#E77B49]">
                  Live Sync
                </span>
              </div>

              <form onSubmit={handleExploreSearchSubmit} className="space-y-4 relative">
                {/* Input 1: Search Dish */}
                <div className="relative">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300 mb-1.5">
                    Search Dish
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchDish}
                      onFocus={() => setActiveInput("dish")}
                      onChange={(e) => setSearchDish(e.target.value)}
                      placeholder="e.g. Biryani, Woodfired Pizza, Dosa..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm"
                    />
                    <UtensilsCrossed className="absolute left-3.5 top-3.5 size-4 text-[#E77B49]" />
                  </div>

                  {/* Dish Live Suggestions Dropdown */}
                  {activeInput === "dish" && searchDish.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-2xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2 space-y-1 animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E77B49] border-b border-border/40">
                        Dishes Found ({matchingDishSuggestions.length})
                      </div>
                      {matchingDishSuggestions.length > 0 ? (
                        matchingDishSuggestions.map((dish) => (
                          <button
                            key={dish._id || dish.id}
                            type="button"
                            onClick={() => {
                              setActiveInput(null);
                              navigate({ to: "/customer/dishes", search: { dish: dish.dishName } });
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <img
                                src={formatImageUrl(dish.dishImage)}
                                alt={dish.dishName}
                                className="size-8 rounded-lg object-cover shrink-0"
                              />
                              <div className="truncate">
                                <span className="text-xs font-bold text-foreground block truncate">
                                  {dish.dishName}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {dish.restaurant?.restaurantName || "Partner Restaurant"}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-serif font-bold text-[#60241E] dark:text-[#E77B49] shrink-0 ml-2">
                              {formatCurrency(dish.price)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground font-semibold">
                          No matching dishes found.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input 2: Search Restaurant */}
                <div className="relative">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300 mb-1.5">
                    Search Restaurant
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchRestaurant}
                      onFocus={() => setActiveInput("restaurant")}
                      onChange={(e) => setSearchRestaurant(e.target.value)}
                      placeholder="e.g. Heritage Spice, Royal Pavilion..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm"
                    />
                    <Building2 className="absolute left-3.5 top-3.5 size-4 text-[#E77B49]" />
                  </div>

                  {/* Restaurant Live Suggestions Dropdown */}
                  {activeInput === "restaurant" && searchRestaurant.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-2xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2 space-y-1 animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E77B49] border-b border-border/40">
                        Restaurants Found ({matchingRestSuggestions.length})
                      </div>
                      {matchingRestSuggestions.length > 0 ? (
                        matchingRestSuggestions.map((rest) => (
                          <button
                            key={rest._id || rest.restaurantId}
                            type="button"
                            onClick={() => {
                              setActiveInput(null);
                              navigate({
                                to: "/customer/restaurant/$restaurantId",
                                params: { restaurantId: rest._id || rest.restaurantId },
                              });
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <img
                                src={formatImageUrl(rest.restaurantCover || rest.restaurantLogo)}
                                alt={rest.restaurantName}
                                className="size-8 rounded-lg object-cover shrink-0"
                              />
                              <div className="truncate">
                                <span className="text-xs font-bold text-foreground block truncate">
                                  {rest.restaurantName}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {rest.cuisine || "Multi-Cuisine"} • {rest.city || rest.address || "Bengaluru"}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              ★ {rest.rating || 4.8}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground font-semibold">
                          No matching restaurants found.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input 3: Current Location */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300">
                      Current Location
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-[10px] font-bold text-[#E77B49] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isLocating ? (
                        <span className="inline-block size-3 border border-[#E77B49] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Navigation className="size-3" />
                      )}
                      <span>Detect GPS</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="e.g. Indiranagar, Bengaluru"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 size-4 text-[#E77B49]" />
                  </div>
                </div>

                {/* Explore Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer mt-2"
                >
                  <Search className="size-4" />
                  <span>Explore Nearby Restaurants</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 3 – POPULAR DISHES */}
      {/* -------------------------------------------------- */}
      <section id="popular-dishes" className="py-20 bg-[#F8F9FA]/60 dark:bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border/60 pb-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                LIVE AVAILABLE MENU
              </span>
              <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100 mt-2">
                Popular Dishes Near You
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                Real-time portion counters synced directly from kitchen terminals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: "/customer/dishes" })}
              className="py-3 px-5 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer"
            >
              <span>View All Menu Catalog</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Loading Skeletons */}
          {isLoadingDishes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-4 space-y-4 animate-pulse">
                  <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          ) : realDishes.length === 0 ? (
            /* Professional Empty State */
            <div className="py-14 px-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="size-14 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center mx-auto">
                <UtensilsCrossed className="size-7" />
              </div>
              <h3 className="font-serif italic font-bold text-xl text-foreground">No dishes available.</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Partner restaurants have not uploaded live menu items yet. New dishes will appear here in real time as kitchens update their stock.
              </p>
            </div>
          ) : (
            /* Real MongoDB Dishes Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {realDishes.slice(0, 10).map((dish) => {
                const restName = dish.restaurant?.restaurantName || "StockDine Partner";
                const imgUrl = formatImageUrl(dish.dishImage);
                return (
                  <div
                    key={dish._id || dish.id}
                    className="bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#E77B49] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Dish Image */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={imgUrl}
                          alt={dish.dishName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#60241E]/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                          {dish.isVeg ? "Veg 🍃" : "Non-Veg 🍗"}
                        </div>

                        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-[#1F2937] dark:text-slate-100 text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 border border-border/50">
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span>{dish.rating ? dish.rating.toFixed(1) : "New"}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49]">
                            {dish.category}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="size-3 text-emerald-500" />
                            <span>{dish.portionsLeft > 0 ? `${dish.portionsLeft} Portions` : "Available"}</span>
                          </span>
                        </div>

                        <h3 className="font-serif italic font-bold text-xl text-foreground truncate">
                          {dish.dishName}
                        </h3>

                        <p className="text-[11px] text-muted-foreground font-semibold truncate">
                          By {restName}
                        </p>

                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-lg text-[#60241E] dark:text-[#E77B49]">
                            {formatCurrency(dish.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explore Button */}
                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/customer/dishes", search: { dish: dish.dishName } })}
                        className="w-full py-3 rounded-2xl bg-secondary/30 hover:bg-[#E77B49] text-[#60241E] dark:text-slate-200 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-[#E77B49] group-hover:text-white shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>Explore &amp; Reserve</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 4 – NEARBY RESTAURANTS */}
      {/* -------------------------------------------------- */}
      <section id="nearby-restaurants" className="py-20 relative bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
              VERIFIED RESTAURANT PARTNERS
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100">
              Nearby Top Restaurants
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              View live kitchen stock, available seating tables, and instant map directions.
            </p>
          </div>

          {/* Loading Skeletons */}
          {isLoadingRestaurants ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-5 space-y-4 animate-pulse">
                  <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          ) : realRestaurants.length === 0 ? (
            /* Professional Empty State */
            <div className="py-14 px-6 rounded-3xl bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="size-14 rounded-2xl bg-[#60241E]/10 dark:bg-[#E77B49]/10 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center mx-auto">
                <Building2 className="size-7" />
              </div>
              <h3 className="font-serif italic font-bold text-xl text-foreground">No restaurants found.</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                No restaurants are available yet in your location. New partner restaurants will appear here soon.
              </p>
            </div>
          ) : (
            /* Restaurant Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {realRestaurants.slice(0, 10).map((rest) => {
                const restId = rest._id || rest.restaurantId;
                const coverImg = formatImageUrl(rest.restaurantCover);
                const availableTables = rest.availableTablesCount ?? 0;
                const liveItems = rest.availableDishes ?? 0;
                const isOpen = rest.isOpen !== false;
                const logoImg = rest.restaurantLogo ? formatImageUrl(rest.restaurantLogo) : null;

                return (
                  <div
                    key={restId}
                    className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#E77B49] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover Image & Badges */}
                      <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img
                          src={coverImg}
                          alt={rest.restaurantName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {logoImg && (
                            <img src={logoImg} alt={rest.restaurantName} className="size-8 rounded-lg object-cover border border-white/20 shadow-sm" />
                          )}
                          <span className={`text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 ${isOpen ? "bg-emerald-600" : "bg-slate-600"}`}>
                            <span className={`size-2 rounded-full bg-white ${isOpen ? "animate-pulse" : "opacity-50"}`} />
                            <span>{isOpen ? "Open Now" : "Closed"}</span>
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="size-3 text-amber-400 fill-amber-400" />
                          <span>{rest.rating ? rest.rating.toFixed(1) : "New"}{rest.numReviews ? ` (${rest.numReviews})` : ""}</span>
                        </div>
                      </div>

                      {/* Card Info Details */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-serif italic font-bold text-2xl text-foreground truncate">
                              {rest.restaurantName}
                            </h3>
                            <span className="text-xs font-bold text-[#E77B49] shrink-0">
                              {rest.cuisine || "Multi-Cuisine"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-2">
                            {rest.description || `${rest.address || ""} ${rest.city ? `• ${rest.city}` : ""}`}
                          </p>
                        </div>

                        {/* Badges Counter */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                          <div className="p-2.5 rounded-2xl bg-secondary/30 dark:bg-slate-800/60 border border-border/50 flex items-center gap-2">
                            <Calendar className="size-4 text-[#E77B49]" />
                            <div>
                              <span className="block text-[10px] text-muted-foreground uppercase font-extrabold">Seating</span>
                              <span className="text-foreground">
                                {availableTables > 0 ? `${availableTables} Tables Free` : "Check In-Venue"}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-secondary/30 dark:bg-slate-800/60 border border-border/50 flex items-center gap-2">
                            <UtensilsCrossed className="size-4 text-[#E77B49]" />
                            <div>
                              <span className="block text-[10px] text-muted-foreground uppercase font-extrabold">Live Items</span>
                              <span className="text-foreground">
                                {liveItems > 0 ? `${liveItems} Available` : "Menu Loading"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 pt-0 space-y-2">
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/customer/restaurant/$restaurantId", params: { restaurantId: restId } })}
                        className="w-full py-3.5 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <span>View Live Menu</span>
                        <ArrowRight className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRestrictedAction("reserve a table", () =>
                            navigate({ to: "/customer/restaurant/$restaurantId", params: { restaurantId: restId } })
                          )
                        }
                        className="w-full py-2.5 rounded-2xl bg-secondary/30 hover:bg-secondary/50 text-[#60241E] dark:text-slate-200 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="size-3.5 text-[#E77B49]" />
                        <span>Reserve Table</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* GUEST AUTHENTICATION MODAL */}
      {/* -------------------------------------------------- */}
      <GuestAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* -------------------------------------------------- */}
      {/* SECTION 5 – WHY STOCKDINE */}
      {/* -------------------------------------------------- */}
      <section id="why-stockdine" className="py-20 bg-[#F8F9FA]/70 dark:bg-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
              SMART DINE-IN OS
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100">
              Why StockDine?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Eliminating long waiting lines and food stock uncertainty with live kitchen telemetry.
            </p>
          </div>

          {/* 8 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_STOCKDINE_FEATURES.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#E77B49] transition-all duration-300 space-y-4 group"
                >
                  <div
                    className="size-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color }}
                  >
                    <IconComp className="size-7 stroke-[2.2]" />
                  </div>

                  <div>
                    <h3 className="font-serif italic font-bold text-xl text-foreground group-hover:text-[#60241E] dark:group-hover:text-[#E77B49] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 6 – HOW STOCKDINE WORKS */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-white dark:bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
              SEAMLESS WORKFLOW
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold text-[#60241E] dark:text-slate-100">
              How StockDine Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              From craving to table in 5 simple seamless steps.
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between hover:border-[#E77B49] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-serif italic font-extrabold text-3xl text-[#E77B49] opacity-40">
                        {step.number}
                      </span>
                      <div className="size-10 rounded-xl bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center">
                        <StepIcon className="size-5" />
                      </div>
                    </div>

                    <h3 className="font-serif italic font-bold text-lg text-foreground group-hover:text-[#60241E] dark:group-hover:text-[#E77B49] transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-border dark:text-slate-700">
                      <ChevronRight className="size-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 7 – APP SHOWCASE */}
      {/* -------------------------------------------------- */}
      <section className="py-20 bg-gradient-to-br from-[#60241E] via-[#7B2B24] to-[#95271D] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(231,123,73,0.3),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase">
              <Smartphone className="size-4 text-[#E77B49]" />
              <span>Mobile Experience</span>
            </div>

            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Dining Intelligence <br />
              <span className="text-[#E77B49] not-italic font-sans">In Your Pocket</span>
            </h2>

            <p className="text-sm text-white/90 font-medium leading-relaxed max-w-lg">
              Download the StockDine app to get instant push alerts when your favorite dishes are fresh out of the kitchen, view live table seat maps, and check in effortlessly.
            </p>

            {/* Highlights Checklist */}
            <div className="space-y-2.5 pt-2 text-xs font-bold text-white/95">
              {[
                "Live menu stock updates every 3 seconds",
                "Instant table reservation & arrival pass",
                "Integrated Google Maps turn-by-turn navigation",
                "Touchless QR scanner at kitchen pass",
                "Verified diner reviews & photo uploads",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-5 rounded-full bg-[#E77B49] flex items-center justify-center shrink-0">
                    <Check className="size-3 text-white stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* App Store Download Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => alert("Redirecting to Google Play Store...")}
                className="px-5 py-3 rounded-2xl bg-black/80 hover:bg-black text-white font-bold text-xs flex items-center gap-3 border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone className="size-6 text-[#E77B49]" />
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70 font-semibold">Get it on</span>
                  <span className="text-sm font-extrabold block">Google Play</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => alert("Redirecting to Apple App Store...")}
                className="px-5 py-3 rounded-2xl bg-black/80 hover:bg-black text-white font-bold text-xs flex items-center gap-3 border border-white/20 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Globe className="size-6 text-[#E77B49]" />
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70 font-semibold">Download on the</span>
                  <span className="text-sm font-extrabold block">App Store</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Mobile Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-72 sm:w-80 h-[520px] bg-slate-900 rounded-[40px] border-8 border-slate-800 shadow-2xl p-4 overflow-hidden flex flex-col justify-between text-slate-100 font-sans">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Mock App Screen Content */}
              <div className="space-y-4 text-left flex-1 overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[10px] text-[#E77B49] font-extrabold uppercase">Live Pass</span>
                    <h4 className="font-serif italic font-bold text-base text-white">Heritage Spice</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    Open Now
                  </span>
                </div>

                {/* Mock Card 1 */}
                <div className="bg-slate-800/80 rounded-2xl p-3 space-y-2 border border-slate-700">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Chef's Reshmi Kebab</span>
                    <span className="text-[#E77B49]">₹380</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>12 Portions Left</span>
                    <span className="text-emerald-400 font-bold">Available</span>
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div className="bg-slate-800/80 rounded-2xl p-3 space-y-2 border border-slate-700">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Chicken Dum Biryani</span>
                    <span className="text-[#E77B49]">₹320</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>4 Portions Left</span>
                    <span className="text-amber-400 font-bold">Fast Selling</span>
                  </div>
                </div>
              </div>

              {/* Bottom Mock Bar */}
              <div className="pt-2 border-t border-slate-800 flex justify-around text-[10px] font-bold text-slate-400">
                <span className="text-[#E77B49]">Menu</span>
                <span>Bookings</span>
                <span>Maps</span>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 8 – CALL TO ACTION */}
      {/* -------------------------------------------------- */}
      <section id="cta" className="py-20 bg-white dark:bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#60241E] via-[#95271D] to-[#B34A44] rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-72 bg-[#E77B49]/20 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase">
              <Zap className="size-4 text-[#E77B49] fill-current" />
              <span>Get Started Today</span>
            </span>

            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
              Ready to Experience Smarter Dining?
            </h2>

            <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl mx-auto leading-relaxed">
              Join thousands of food enthusiasts finding available dishes in real time, or register your restaurant to boost table occupancy.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: "/customer" })}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="size-4" />
                <span>Explore Restaurants</span>
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/signup" })}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Building2 className="size-4 text-[#E77B49]" />
                <span>Join as Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 9 – FOOTER */}
      {/* -------------------------------------------------- */}
      <footer id="footer" className="bg-[#111827] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Column 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div>
                <span className="font-serif italic text-3xl font-bold tracking-tight text-white block leading-none">
                  StockDine
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#E77B49] font-extrabold block mt-1">
                  Live Dine-In OS
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                StockDine is the global dine-in intelligence platform connecting hungry diners with live restaurant stock, portion availability, and instant table seating.
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Globe className="size-4 text-[#E77B49]" />
                <span>Operating Globally across 50+ Cities</span>
              </div>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3 text-xs font-semibold">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white">Company</span>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#why-stockdine" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#hero" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#hero" className="hover:text-white transition-colors">Press &amp; Media</a></li>
                <li><a href="#footer" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-3 text-xs font-semibold">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white">Platform</span>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/customer" className="hover:text-white transition-colors">Explore Restaurants</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Kitchen Terminal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Restaurant Admin</Link></li>
                <li><Link to="/super-admin" className="hover:text-white transition-colors">Super Admin Portal</Link></li>
              </ul>
            </div>

            {/* Column 4: Legal & Social */}
            <div className="space-y-3 text-xs font-semibold">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white">Legal &amp; Connect</span>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#footer" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#footer" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#footer" className="hover:text-white transition-colors">Security Overview</a></li>
                <li className="pt-2 flex items-center gap-3 text-white">
                  <a href="#footer" className="hover:text-[#E77B49] transition-colors" title="Instagram">Instagram</a>
                  <span>•</span>
                  <a href="#footer" className="hover:text-[#E77B49] transition-colors" title="Facebook">Facebook</a>
                  <span>•</span>
                  <a href="#footer" className="hover:text-[#E77B49] transition-colors" title="LinkedIn">LinkedIn</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <p>© 2026 StockDine. All rights reserved. Powered by Live Dine-In Telemetry.</p>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}