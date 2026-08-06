import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Utensils,
  Search,
  SlidersHorizontal,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  Filter,
  Check,
  Building2,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import {
  useStockDineStore,
  Dish,
  formatCurrency,
  RestaurantDetails,
  Booking,
} from "@/lib/stockdine-store";
import { api } from "@/lib/api";
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

export const Route = createFileRoute("/customer/dishes")({
  head: () => ({
    meta: [
      { title: "Browse Signature Dishes — StockDine" },
      {
        name: "description",
        content: "Explore delicacies, live portions, ingredients, and prep times across partner restaurants.",
      },
    ],
  }),
  component: DishesPage,
});

function DishesPage() {
  const navigate = useNavigate();
  const {
    dishes,
    tables,
    getAllRestaurantProfiles,
    createBooking,
  } = useStockDineStore();

  const [liveDishes, setLiveDishes] = useState<Dish[]>([]);

  useEffect(() => {
    api.dishes.getAll().then((res: any) => {
      if (res && res.success && Array.isArray(res.dishes)) {
        const mapped = res.dishes.map((d: any) => ({
          id: d._id,
          restaurantId: d.restaurant?._id || d.restaurant || "",
          restaurantName: d.restaurant?.restaurantName || "",
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
        setLiveDishes(mapped);
      }
    }).catch(() => {});
  }, []);

  const restaurantMap = getAllRestaurantProfiles();
  const restaurantList = Object.values(restaurantMap);

  const dishesPool = liveDishes.length > 0 ? liveDishes : (dishes || []);

  // Attach restaurant name & ratings to dishes
  const enrichedDishes: Dish[] = dishesPool.map((d) => {
    const profile = restaurantMap[d.restaurantId] || restaurantList[0] || defaultFallbackRestaurant;
    return {
      ...d,
      restaurantName: d.restaurantName || profile?.name || "StockDine Partner",
      restaurantLogo: d.restaurantLogo || profile?.logo,
      rating: d.rating || profile?.rating || 4.9,
    };
  });

  // State Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDiet, setSelectedDiet] = useState<"All" | "Veg" | "Non-Veg" | "Vegan" | "Organic">("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [bestsellersOnly, setBestsellersOnly] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTargetRestaurant, setBookingTargetRestaurant] = useState<RestaurantDetails>(
    restaurantList[0] || defaultFallbackRestaurant
  );
  const [bookingPreselectedDish, setBookingPreselectedDish] = useState<Dish | null>(null);

  // Filter Logic
  const filteredDishes = enrichedDishes.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.restaurantName && d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      d.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDiet =
      selectedDiet === "All"
        ? true
        : selectedDiet === "Veg"
        ? d.isVeg === true
        : selectedDiet === "Non-Veg"
        ? d.isVeg === false
        : selectedDiet === "Vegan"
        ? d.isVegan === true
        : selectedDiet === "Organic"
        ? d.isOrganic === true
        : true;

    const matchesAvailability = !onlyAvailable || (d.availableToday && d.portionsLeft > 0);
    const matchesBestseller = !bestsellersOnly || d.isBestseller === true;

    return matchesSearch && matchesCategory && matchesDiet && matchesAvailability && matchesBestseller;
  });

  const categories = ["All", "Starters", "Main Course", "Pizza", "Desserts", "Drinks"];

  const handleOpenBookingForDish = (dish: Dish) => {
    const rest = restaurantMap[dish.restaurantId] || restaurantList[0] || defaultFallbackRestaurant;
    setBookingTargetRestaurant(rest);
    setBookingPreselectedDish(dish);
    setShowBookingModal(true);
  };

  const activeTargetId = bookingTargetRestaurant?.id || defaultFallbackRestaurant.id;
  const availableTables = (tables || []).filter(
    (t) => (t.restaurantId === activeTargetId || !t.restaurantId) && t.status === "Available"
  );

  return (
    <div className="flex flex-col max-w-5xl mx-auto selection:bg-[#E77B49] selection:text-white pb-28 bg-background text-foreground px-4 sm:px-6 transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="py-6 border-b border-border dark:border-slate-800 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/customer" })}
              className="p-2.5 rounded-2xl bg-card dark:bg-slate-900 border border-border dark:border-slate-800 text-foreground hover:bg-secondary/20 transition-colors shadow-xs"
              title="Back to Home"
            >
              <ChevronLeft className="size-4 text-[#E77B49]" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest">
                <Flame className="size-3 text-[#E77B49] fill-current" />
                <span>Live Menu Inventory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif italic text-[#60241E] dark:text-slate-100 font-bold tracking-tight mt-0.5">
                Signature Delicacies
              </h1>
            </div>
          </div>

          <ThemeToggle />
        </div>

        {/* Global Dish Search & Filter Controls */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name, ingredients, or restaurant..."
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

          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`h-11 px-4 rounded-2xl border-2 text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              selectedDiet !== "All" || onlyAvailable || bestsellersOnly
                ? "bg-[#60241E] text-white border-[#60241E] shadow-sm"
                : "bg-card dark:bg-slate-900 border-border dark:border-slate-800 text-foreground"
            }`}
          >
            <SlidersHorizontal className="size-4 text-[#E77B49]" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#60241E] text-white shadow-md scale-102"
                  : "bg-card dark:bg-slate-900 border border-border dark:border-slate-800 text-muted-foreground hover:bg-secondary/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Filter Drawer / Quick Controls */}
      {showFilterDrawer && (
        <div className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-4 sm:p-6 mb-6 shadow-md space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-3">
            <h3 className="font-serif italic font-bold text-lg text-[#60241E] dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#E77B49]" />
              <span>Refine Dishes</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedDiet("All");
                setOnlyAvailable(false);
                setBestsellersOnly(false);
              }}
              className="text-xs font-bold text-[#E77B49] hover:underline"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            {/* Diet Filter */}
            <div>
              <label className="block text-muted-foreground mb-1.5 uppercase text-[10px]">Dietary Preference</label>
              <div className="flex rounded-xl overflow-hidden border border-border dark:border-slate-800 p-0.5 bg-secondary/10">
                {(["All", "Veg", "Non-Veg", "Vegan"] as const).map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setSelectedDiet(diet)}
                    className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                      selectedDiet === diet ? "bg-[#60241E] text-white shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toggle Controls */}
            <div className="flex items-center justify-around sm:col-span-2 pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="accent-[#E77B49] size-4"
                />
                <span className="text-foreground">Available Today Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestsellersOnly}
                  onChange={(e) => setBestsellersOnly(e.target.checked)}
                  className="accent-[#E77B49] size-4"
                />
                <span className="text-foreground">Chef Bestsellers Only ⭐</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Dishes Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">
            Available Menu Delicacies ({filteredDishes.length})
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">Live Portion Tracking</span>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Utensils className="size-10 text-[#E77B49] mx-auto opacity-50" />
            <h3 className="font-serif italic text-xl font-bold text-[#60241E] dark:text-slate-100">
              No signature dishes found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search term, selecting "All" categories, or resetting dietary filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDiet("All");
                setOnlyAvailable(false);
                setBestsellersOnly(false);
              }}
              className="py-2.5 px-5 rounded-2xl bg-[#E77B49] text-white text-xs font-extrabold shadow-sm hover:bg-[#D66A38] transition-all"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onAddBooking={handleOpenBookingForDish} />
            ))}
          </div>
        )}
      </section>

      {/* Booking Dialog Modal */}
      {showBookingModal && bookingTargetRestaurant && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          restaurant={bookingTargetRestaurant}
          availableTables={availableTables}
          dishes={enrichedDishes.filter((d) => d.restaurantId === (bookingTargetRestaurant.id || ""))}
          preSelectedDish={bookingPreselectedDish}
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
