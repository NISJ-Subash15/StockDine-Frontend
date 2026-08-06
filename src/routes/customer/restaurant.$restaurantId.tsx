import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Heart,
  Plus,
  Minus,
  CreditCard,
  X,
  Award,
  Wifi,
  Car,
  Wind,
  Music,
  Wine,
  UserCheck,
  Accessibility,
  Eye,
  ChevronRight,
  Maximize2,
  Filter,
  Utensils,
  Search,
  Navigation,
  Mail,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  useStockDineStore,
  formatCurrency,
  Booking,
  GalleryImageCategory,
  Dish,
} from "@/lib/stockdine-store";
import { api, formatImageUrl } from "@/lib/api";

import { BookingModal } from "@/components/BookingModal";
import { ReviewModal } from "@/components/ReviewModal";
import { DirectionsModal } from "@/components/DirectionsModal";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/customer/restaurant/$restaurantId")({
  head: () => ({
    meta: [
      { title: "Restaurant Live Menu & Reservation — StockDine" },
      {
        name: "description",
        content: "Discover real-time available menu dishes, photo galleries, amenities, verified reviews, and reserve dining tables instantly.",
      },
    ],
  }),
  component: CustomerRestaurantDetailPage,
});

function CustomerRestaurantDetailPage() {
  const { restaurantId } = Route.useParams();
  const navigate = useNavigate();

  const {
    getRestaurantProfile,
    getGalleryImages,
    fetchGalleryImages,
    getReviews,
    dishes,
    tables,
    createBooking,
    likeReviewHelpful,
  } = useStockDineStore();

  const profile = getRestaurantProfile(restaurantId);
  const gallery = getGalleryImages(profile?.id || restaurantId) || [];
  const reviewsList = getReviews(profile?.id || restaurantId) || [];

  useEffect(() => {
    const target = profile?.id || restaurantId;
    if (target) {
      fetchGalleryImages(target);
    }
  }, [restaurantId, profile?.id]);

  // Defensive arrays and objects
  const cuisinesArray = Array.isArray(profile?.cuisines)
    ? profile.cuisines
    : typeof profile?.cuisines === "string"
    ? [profile.cuisines]
    : ["North Indian", "Mughlai", "Fine Dining"];

  const amenities = profile?.amenities || {
    parking: true,
    wifi: true,
    ac: true,
    outdoorSeating: true,
    familyFriendly: true,
    privateDining: true,
    liveMusic: true,
    wheelchairAccessible: true,
  };

  // Interactive Header Action States
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Section 2 Live Available Menu Search & Filter States
  const [dishSearchQuery, setDishSearchQuery] = useState("");
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("All");
  const [selectedDietFilter, setSelectedDietFilter] = useState<"All" | "Veg" | "Non-Veg" | "Vegan" | "Organic">("All");

  // Gallery State (Section 4)
  const [selectedGalleryCat, setSelectedGalleryCat] = useState<string>("All");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Review Filters State (Section 6)
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<"All" | "5Stars" | "4Stars" | "WithPhotos">("All");

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [preselectedTableId, setPreselectedTableId] = useState<string | undefined>(undefined);
  const [preselectedDish, setPreselectedDish] = useState<Dish | null>(null);

  // Live MongoDB Dishes & Tables
  const [apiDishes, setApiDishes] = useState<Dish[]>([]);

  useEffect(() => {
    if (restaurantId) {
      api.restaurants.getById(restaurantId).then((res: any) => {
        if (res && res.success && Array.isArray(res.dishes)) {
          const mapped = res.dishes.map((d: any) => ({
            id: d._id,
            restaurantId: d.restaurant?._id || d.restaurant || "",
            name: d.dishName,
            category: d.category,
            price: d.price,
            description: d.description || "",
            prepTime: d.preparationTime || "15 mins",
            portionsLeft: d.portionsLeft,
            image: d.dishImage || "",
            enabled: d.available !== false,
            availableToday: d.available !== false,
            stockType: d.portionsLeft === 0 ? "Sold Out" : d.portionsLeft <= 5 ? "Almost Sold Out" : "Available",
            lastUpdated: "Just now",
            isVeg: d.isVeg,
            rating: 5.0,
            availability: d.available !== false ? "Available" : "Sold Out",
          }));
          setApiDishes(mapped);
        }
      }).catch(() => {});
    }
  }, [restaurantId]);

  // All restaurant dishes (available + sold out status)
  const allDishesPool = apiDishes.length > 0 ? apiDishes : (dishes || []);
  const restaurantDishes = allDishesPool.filter((d) => {
    if (apiDishes.length > 0) return true;
    const restMatch =
      d.restaurantId === profile?.id ||
      d.restaurantId === profile?._id ||
      d.restaurantId === restaurantId ||
      d.restaurantId === "heritage-spice";
    return restMatch && d.enabled !== false;
  });

  // Available dishes count
  const availableDishesCount = restaurantDishes.filter(
    (d) => d.availableToday && d.portionsLeft > 0 && d.stockType !== "Sold Out"
  ).length;

  const availableTables = (tables || []).filter(
    (t) => (t.restaurantId === profile?.id || !t.restaurantId) && t.status === "Available"
  );

  const galleryCategories = [
    "All",
    "Interior",
    "Exterior",
    "Dining Area",
    "Private Rooms",
    "Kitchen Preview",
    "Signature Dishes",
  ];

  const filteredGallery = gallery.filter((g) => {
    if (selectedGalleryCat === "All") return true;
    return (g.category || "").toLowerCase() === selectedGalleryCat.toLowerCase();
  });

  // Filtered Live Available Menu Dishes
  const filteredDishes = restaurantDishes.filter((d) => {
    const name = d.name || "";
    const desc = d.description || "";
    const ingredients = d.ingredients || "";
    const cat = d.category || "";

    const matchesSearch =
      dishSearchQuery.trim() === "" ||
      name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
      ingredients.toLowerCase().includes(dishSearchQuery.toLowerCase());

    const matchesCat =
      selectedMenuCategory === "All" ||
      cat.toLowerCase() === selectedMenuCategory.toLowerCase();

    const matchesDiet =
      selectedDietFilter === "All"
        ? true
        : selectedDietFilter === "Veg"
        ? d.isVeg === true
        : selectedDietFilter === "Non-Veg"
        ? d.isVeg === false
        : selectedDietFilter === "Vegan"
        ? d.isVegan === true
        : selectedDietFilter === "Organic"
        ? d.isOrganic === true
        : true;

    return matchesSearch && matchesCat && matchesDiet;
  });

  // Filtered Reviews
  const filteredReviews = reviewsList.filter((r) => {
    if (selectedReviewFilter === "5Stars") return r.rating === 5;
    if (selectedReviewFilter === "4Stars") return r.rating === 4;
    if (selectedReviewFilter === "WithPhotos") return r.photos && r.photos.length > 0;
    return true;
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name || "Restaurant"} — Live Available Menu & Booking`,
        text: `Check out live food availability and reserve a table at ${profile?.name || "Restaurant"}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] font-sans pb-28 selection:bg-[#E77B49] selection:text-white max-w-5xl mx-auto">
      {/* Sticky Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              navigate({ to: "/customer" });
            }
          }}
          className="flex items-center gap-1.5 text-xs font-extrabold text-[#60241E] hover:text-[#E77B49] transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" /> Back to Discovery
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle className="border-2 border-[#E5E7EB]" />
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="py-2 px-4 rounded-xl bg-[#E77B49] text-white text-xs font-extrabold hover:bg-[#D66A38] transition-all shadow-sm active:scale-95"
          >
            Book Table
          </button>
        </div>
      </header>

      {/* HERO SECTION — RESTAURANT HEADER */}
      <section className="relative">
        <div className="h-72 sm:h-96 w-full relative overflow-hidden">
          <img
            src={profile?.coverImage || profile?.logo}
            alt={profile?.name || "Restaurant"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Header Content Overlay Card */}
        <div className="px-4 sm:px-6 -mt-20 relative z-10">
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-2.5 py-0.5 rounded-full border border-[#E77B49]/20">
                    {profile?.category || "Fine Dining"}
                  </span>
                  <span className="text-xs text-[#6B7280] font-bold">
                    {profile?.distanceKm || 1.2} km away • {profile?.travelTime || "12 mins"}
                  </span>
                </div>
                <h1 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E]">
                  {profile?.name || "StockDine Partner"}
                </h1>
                <p className="text-xs text-[#4B5563] font-medium flex items-center gap-1.5 mt-1">
                  <MapPin className="size-3.5 text-[#E77B49] shrink-0" />
                  <span>{profile?.address || "Connaught Place, New Delhi"}</span>
                </p>
              </div>

              {/* Action Buttons Bar: Book Table, Get Directions, Call, Share, Favorite */}
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedTableId(undefined);
                    setPreselectedDish(null);
                    setShowBookingModal(true);
                  }}
                  className="py-3 px-5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="size-4" />
                  <span>Book Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDirectionsModal(true)}
                  className="py-3 px-5 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="size-4 text-[#E77B49]" />
                  <span>Get Directions</span>
                </button>

                <a
                  href={`tel:${profile?.contactPhone || "+91 98765 43210"}`}
                  className="p-3 rounded-2xl bg-[#F8F9FA] border-2 border-[#E5E7EB] text-[#60241E] hover:bg-[#60241E] hover:text-white transition-all shadow-sm"
                  title="Call Restaurant"
                >
                  <Phone className="size-4" />
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-2xl bg-[#F8F9FA] border-2 border-[#E5E7EB] text-[#60241E] hover:bg-[#60241E] hover:text-white transition-all shadow-sm relative"
                  title="Share Restaurant"
                >
                  <Share2 className="size-4" />
                  {copiedShare && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-2xl border-2 transition-all shadow-sm ${
                    isFavorite
                      ? "bg-rose-50 border-rose-300 text-rose-600"
                      : "bg-[#F8F9FA] border-[#E5E7EB] text-[#60241E] hover:bg-[#60241E] hover:text-white"
                  }`}
                  title="Save to Favorites"
                >
                  <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E5E7EB] text-xs font-bold">
              <div className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E5E7EB]">
                <Star className="size-4 fill-amber-500 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase">Rating</p>
                  <p className="text-[#60241E]">{profile?.rating || 4.9} ({profile?.reviewsCount || 342} Reviews)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E5E7EB]">
                <Clock className="size-4 text-[#E77B49] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase">Opening Hours</p>
                  <p className="text-[#60241E] truncate">{profile?.openingHours || "12:00 PM - 11:30 PM"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E5E7EB]">
                <Phone className="size-4 text-[#E77B49] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase">Phone</p>
                  <p className="text-[#60241E]">{profile?.contactPhone || "+91 98765 43210"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-2xl border border-[#E5E7EB]">
                <Utensils className="size-4 text-[#E77B49] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#6B7280] uppercase">Cuisines</p>
                  <p className="text-[#60241E] truncate">{cuisinesArray.slice(0, 2).join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 sm:px-6 mt-8 space-y-12">
        {/* SECTION 2 — CURRENTLY AVAILABLE MENU (HIGHEST PRIORITY RIGHT BELOW HERO) */}
        <section id="live-menu" className="space-y-6">
          <div className="bg-gradient-to-r from-[#60241E] to-[#95271D] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-white bg-white/20 px-3 py-1 rounded-full">
                    SECTION 2 • CORE FEATURE
                  </span>
                  <span className="text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                    <Flame className="size-3.5 fill-current" /> Live Kitchen Available
                  </span>
                </div>
                <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-white mt-2">
                  Currently Available Menu
                </h2>
                <p className="text-xs text-white/80 font-medium mt-1">
                  Dishes currently available in the kitchen right now ({availableDishesCount} Available).
                </p>
              </div>

              {/* In-Restaurant Dish Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 size-4 text-[#E77B49]" />
                <input
                  type="text"
                  value={dishSearchQuery}
                  onChange={(e) => setDishSearchQuery(e.target.value)}
                  placeholder="Search dishes, ingredients..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white text-[#1F2937] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                />
              </div>
            </div>

            {/* Category & Dietary Filter Bar */}
            <div className="pt-2 space-y-3 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-white/80 uppercase text-[10px] tracking-wider mr-1">Categories:</span>
                {["All", "Starters", "Main Course", "Rice", "Desserts", "Drinks", "Pizza"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMenuCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full transition-all ${
                      selectedMenuCategory === cat
                        ? "bg-white text-[#60241E] font-extrabold shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="text-white/80 uppercase text-[10px] tracking-wider mr-1">Dietary:</span>
                {(["All", "Veg", "Non-Veg", "Vegan", "Organic"] as const).map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setSelectedDietFilter(diet)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      selectedDietFilter === diet
                        ? "bg-[#E77B49] text-white font-extrabold shadow-xs"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dish Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDishes.map((dish) => {
              const isAvailableNow = dish.availableToday && dish.portionsLeft > 0 && dish.stockType !== "Sold Out";

              return (
                <div
                  key={dish.id}
                  className={`bg-white border-2 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isAvailableNow ? "border-[#E5E7EB]" : "border-gray-200 opacity-75"
                  }`}
                >
                  {!isAvailableNow && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full z-10 shadow-md tracking-wider">
                      SOLD OUT
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="relative size-28 rounded-2xl overflow-hidden border border-[#E5E7EB] shrink-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                      {isAvailableNow && (
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full backdrop-blur-xs">
                          Available Now
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`size-4 rounded-sm flex items-center justify-center border ${
                            dish.isVeg !== false ? "border-emerald-600 bg-white" : "border-red-600 bg-white"
                          }`}
                        >
                          <span
                            className={`size-2 rounded-full ${
                              dish.isVeg !== false ? "bg-emerald-600" : "bg-red-600"
                            }`}
                          />
                        </span>

                        {dish.isVegan && (
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                            Vegan
                          </span>
                        )}

                        {dish.isOrganic && (
                          <span className="text-[10px] font-extrabold uppercase bg-teal-700 text-white px-2 py-0.5 rounded-full">
                            Organic
                          </span>
                        )}

                        {dish.isBestseller && (
                          <span className="text-[10px] font-extrabold uppercase bg-[#E77B49] text-white px-2 py-0.5 rounded-full">
                            Bestseller
                          </span>
                        )}

                        {dish.isChefRecommended && (
                          <span className="text-[10px] font-extrabold uppercase bg-amber-600 text-white px-2 py-0.5 rounded-full">
                            Chef Special
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif italic font-bold text-lg text-[#60241E] truncate">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">{dish.description}</p>
                      
                      <div className="flex items-center gap-3 text-[11px] text-[#6B7280] font-semibold pt-0.5">
                        <span>Prep: {dish.prepTime}</span>
                        {dish.portionsLeft > 0 && (
                          <span className="text-[#E77B49] font-bold">
                            {dish.portionsLeft} Portions Left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E7EB]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif italic font-bold text-xl text-[#60241E]">
                        {formatCurrency(dish.discountPrice || dish.price)}
                      </span>
                      {dish.discountPrice && (
                        <span className="line-through text-xs text-[#9CA3AF]">
                          {formatCurrency(dish.price)}
                        </span>
                      )}
                    </div>

                    {isAvailableNow ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedDish(dish);
                          setShowBookingModal(true);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Hold Dish &amp; Book Table</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="py-2.5 px-4 rounded-xl bg-gray-200 text-gray-500 text-xs font-bold cursor-not-allowed"
                      >
                        SOLD OUT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RESTAURANT INFORMATION (BELOW MENU) */}
        <section className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#60241E] bg-[#60241E]/10 px-3 py-1 rounded-full">
              SECTION 3 • RESTAURANT DETAILS
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#60241E] mt-2">
              About {profile?.name || "Restaurant"}
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium mt-2">
              {profile?.description || "Authentic dining experience with handpicked ingredients."}
            </p>
            {profile?.story && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs text-[#60241E]">
                <strong className="block text-xs uppercase font-extrabold mb-1">Our Heritage &amp; Culinary Story</strong>
                <p className="italic text-[#4B5563]">{profile.story}</p>
              </div>
            )}
          </div>

          {/* Contact Specs & Direct Navigation Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB]">
            <div className="space-y-2 text-xs font-medium">
              <p><strong className="text-[#60241E]">Cuisine Types:</strong> {cuisinesArray.join(", ")}</p>
              <p><strong className="text-[#60241E]">Opening Hours:</strong> {profile?.openingHours || "12:00 PM - 11:30 PM"}</p>
              <p><strong className="text-[#60241E]">Contact Phone:</strong> {profile?.contactPhone || "+91 98765 43210"}</p>
              <p><strong className="text-[#60241E]">Email:</strong> contact@{profile?.id || "restaurant"}.com</p>
            </div>

            <div className="space-y-2 text-xs font-medium flex flex-col justify-between">
              <div>
                <p><strong className="text-[#60241E]">Address:</strong> {profile?.address || "Connaught Place, New Delhi"}</p>
                <p><strong className="text-[#60241E]">Average Cost:</strong> {profile?.priceRange || "₹1,400 for two"}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowDirectionsModal(true)}
                className="py-2.5 px-4 rounded-xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 self-start mt-2"
              >
                <Navigation className="size-4 text-[#E77B49]" />
                <span>Get Live Directions</span>
              </button>
            </div>
          </div>

          {/* Restaurant Policies */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5 text-xs text-amber-900">
            <span className="text-[10px] uppercase font-extrabold text-[#60241E] block">
              Restaurant Dining Policies
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-medium">
              <li>• Dress Code: Smart Casual</li>
              <li>• Non-Smoking Indoors</li>
              <li>• Free Cancellation up to 2 hrs prior</li>
            </ul>
          </div>

          {/* Complete 8 Amenities Checklist */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E] mb-3">
              Amenities &amp; Dining Comforts (8 Features)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.parking ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Car className="size-4 text-[#E77B49]" />
                <span>Parking Available</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.wifi ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Wifi className="size-4 text-[#E77B49]" />
                <span>Free WiFi</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.ac ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Wind className="size-4 text-[#E77B49]" />
                <span>Air Conditioning</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.outdoorSeating ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Flame className="size-4 text-[#E77B49]" />
                <span>Outdoor Seating</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.familyFriendly ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <UserCheck className="size-4 text-[#E77B49]" />
                <span>Family Dining</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.privateDining ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Wine className="size-4 text-[#E77B49]" />
                <span>Private Dining</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.liveMusic ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Music className="size-4 text-[#E77B49]" />
                <span>Live Music</span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${amenities.wheelchairAccessible !== false ? "bg-white border-[#E5E7EB] text-[#1F2937]" : "bg-gray-100 text-gray-400 opacity-60"}`}>
                <Accessibility className="size-4 text-[#E77B49]" />
                <span>Wheelchair Accessible</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — RESTAURANT GALLERY */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#60241E] bg-[#60241E]/10 px-3 py-1 rounded-full">
                SECTION 4 • AMBIANCE GALLERY
              </span>
              <h2 className="font-serif italic text-2xl font-bold text-[#60241E] mt-1.5">
                Restaurant Gallery
              </h2>
            </div>

            {/* Gallery Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedGalleryCat(cat)}
                  className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                    selectedGalleryCat === cat
                      ? "bg-[#60241E] text-white shadow-sm"
                      : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredGallery.map((img) => (
              <div
                key={img.id}
                onClick={() => setFullscreenImage(formatImageUrl(img.url))}
                className="relative h-40 rounded-2xl overflow-hidden border-2 border-[#E5E7EB] shadow-xs group cursor-pointer"
              >
                <img
                  src={formatImageUrl(img.url)}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-wider text-[#E77B49] font-extrabold">
                    {img.category}
                  </span>
                  <span className="text-xs text-white font-bold truncate">{img.title}</span>
                  <Maximize2 className="size-4 text-white absolute top-2 right-2" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — TABLE BOOKING */}
        <section className="bg-[#60241E] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/20 pb-4">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/80 bg-white/20 px-3 py-1 rounded-full">
                SECTION 5 • RESERVATION WIZARD
              </span>
              <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-white mt-1.5">
                Available Tables &amp; Booking
              </h2>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                Select a table card below to trigger instant step-by-step table reservation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPreselectedTableId(undefined);
                setShowBookingModal(true);
              }}
              className="py-3 px-6 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Launch Booking Wizard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTables.map((t) => (
              <div
                key={t.id}
                className="bg-white text-[#1F2937] rounded-2xl p-4 space-y-3 border border-[#E5E7EB] shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 border border-[#E5E7EB]">
                    <img
                      src={t.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600"}
                      alt={t.tableName || t.tableNumber}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                      {t.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#E77B49] uppercase tracking-wider">
                        {t.tableNumber}
                      </span>
                      <h4 className="font-serif italic font-bold text-lg text-[#60241E]">
                        {t.tableName || "Dining Table"}
                      </h4>
                    </div>
                    <span className="text-xs font-bold bg-[#60241E]/10 text-[#60241E] px-2.5 py-1 rounded-full">
                      {t.capacity} Guests
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7280] font-medium mt-1">
                    {t.locationDesc} • Type: {t.type || t.location}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreselectedTableId(t.id);
                    setShowBookingModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#60241E] text-white text-xs font-extrabold hover:bg-[#4A1B17] transition-colors shadow-sm"
                >
                  Reserve {t.tableNumber}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — REVIEWS & RATINGS */}
        <section className="space-y-6 border-t-2 border-[#E5E7EB] pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#60241E] bg-[#60241E]/10 px-3 py-1 rounded-full">
                SECTION 6 • REVIEWS &amp; RATINGS
              </span>
              <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-1.5">
                Verified Customer Reviews
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="size-4 fill-current text-white" />
                <span>Write Review</span>
              </button>
            </div>
          </div>

          {/* Rating Summary Header Card */}
          <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Score & Star Overall */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="font-serif italic text-5xl font-black text-[#60241E]">
                  {profile?.rating || 4.9}
                </span>
                <span className="text-sm text-[#6B7280] font-bold">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Based on {profile?.reviewsCount || 342} verified diner reviews</p>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-1.5 text-xs font-semibold text-[#4B5563]">
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] font-bold">5 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[85%]" />
                </div>
                <span className="w-8 text-right text-[11px] font-bold">85%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] font-bold">4 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[12%]" />
                </div>
                <span className="w-8 text-right text-[11px] font-bold">12%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] font-bold">3 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[3%]" />
                </div>
                <span className="w-8 text-right text-[11px] font-bold">3%</span>
              </div>
            </div>

            {/* Category Average Scores */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] space-y-1.5 text-xs font-medium">
              <span className="text-[10px] uppercase font-extrabold text-[#60241E] block mb-1">
                Category Score Breakdown
              </span>
              <div className="flex justify-between">
                <span>Food Quality</span>
                <span className="font-bold text-[#60241E]">★ 4.9</span>
              </div>
              <div className="flex justify-between">
                <span>Service Hospitality</span>
                <span className="font-bold text-[#60241E]">★ 4.8</span>
              </div>
              <div className="flex justify-between">
                <span>Ambience &amp; Music</span>
                <span className="font-bold text-[#60241E]">★ 4.9</span>
              </div>
              <div className="flex justify-between">
                <span>Cleanliness &amp; Hygiene</span>
                <span className="font-bold text-[#60241E]">★ 5.0</span>
              </div>
            </div>
          </div>

          {/* Review Filter Buttons */}
          <div className="flex items-center gap-2 text-xs font-bold pt-2">
            {(
              [
                { id: "All", label: "All Reviews" },
                { id: "5Stars", label: "5 Stars" },
                { id: "4Stars", label: "4 Stars" },
                { id: "WithPhotos", label: "With Photos" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedReviewFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  selectedReviewFilter === f.id
                    ? "bg-[#60241E] text-[#FFFFFF] shadow-xs"
                    : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.customerAvatar}
                      alt={r.customerName}
                      className="size-11 rounded-full object-cover border border-[#E5E7EB]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#1F2937]">{r.customerName}</h4>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-emerald-600" /> Verified Diner
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7280]">{r.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-[#F8F9FA] px-3 py-1 rounded-full border border-[#E5E7EB]">
                    <Star className="size-3.5 fill-current" /> ★ {r.rating}.0
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed font-medium">"{r.comment}"</p>

                {/* Customer Uploaded Photos */}
                {r.photos && r.photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {r.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt="Customer dining photo"
                        onClick={() => setFullscreenImage(p)}
                        className="size-20 rounded-2xl object-cover border border-[#E5E7EB] cursor-pointer hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                )}

                {/* Official Restaurant Response Box */}
                {r.adminReply && (
                  <div className="bg-[#F8F9FA] border-l-4 border-[#60241E] p-3 rounded-r-2xl text-xs space-y-1 mt-2">
                    <p className="font-extrabold text-[#60241E] text-[11px] flex items-center gap-1">
                      <span>Response from Management ({r.adminReplyDate || "Recently"})</span>
                    </p>
                    <p className="text-[#4B5563] italic">"{r.adminReply}"</p>
                  </div>
                )}

                {/* Helpful Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      likeReviewHelpful(r.id);
                    }}
                    className="text-[#6B7280] hover:text-[#60241E] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Heart className="size-3.5 text-rose-500" />
                    <span>Helpful ({r.helpfulCount || 0})</span>
                  </button>

                  <span className="text-[10px] text-[#9CA3AF]">StockDine Verified Entry</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Fullscreen Image Preview Lightbox Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X className="size-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen gallery view"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Directions Navigation Modal */}
      {profile && (
        <DirectionsModal
          isOpen={showDirectionsModal}
          onClose={() => setShowDirectionsModal(false)}
          restaurant={profile}
        />
      )}

      {/* Table Booking Modal */}
      {profile && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          restaurant={profile}
          availableTables={availableTables}
          dishes={restaurantDishes.filter((d) => d.availableToday && d.portionsLeft > 0)}
          preSelectedDish={preselectedDish}
          onConfirmBooking={(bookingData) => {
            const itemsList = Object.entries(bookingData.selectedDishes).map(([id, quantity]) => {
              const dish = (dishes || []).find((d) => d.id === id);
              return {
                dishId: id,
                name: dish?.name || "Specials",
                price: dish ? (dish.discountPrice || dish.price) : 250,
                quantity,
              };
            });

            return createBooking({
              restaurantId: profile?.id || restaurantId || "",
              restaurantName: profile?.name || "Partner Restaurant",
              customerName: bookingData.customerName,
              customerPhone: bookingData.customerPhone,
              date: bookingData.date,
              time: bookingData.time,
              guests: bookingData.guests,
              items: itemsList,
              tableId: bookingData.tableId,
              tableNumber: bookingData.tableNumber,
              totalAmount: bookingData.totalAmount,
              advanceAmount: bookingData.advanceAmount,
              remainingAmount: bookingData.remainingAmount,
              paymentMethod: bookingData.paymentMethod,
            });
          }}
        />
      )}

      {/* Review Submission Modal */}
      {profile && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          restaurant={profile}
        />
      )}
    </div>
  );
}
