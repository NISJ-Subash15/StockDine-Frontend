import React, { useState } from "react";
import {
  X,
  Search,
  Flame,
  Plus,
  Utensils,
  ChevronRight,
  ExternalLink,
  Calendar,
  Navigation,
  Star,
  MapPin,
} from "lucide-react";
import { RestaurantDetails, Dish, formatCurrency } from "@/lib/stockdine-store";

interface MapMenuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantDetails | null;
  dishes: Dish[];
  onSelectDishToBook: (dish: Dish) => void;
  onOpenFullProfile: (restaurantId: string) => void;
  onOpenBookingModal: () => void;
  onOpenDirectionsModal: () => void;
}

export const MapMenuBottomSheet: React.FC<MapMenuBottomSheetProps> = ({
  isOpen,
  onClose,
  restaurant,
  dishes,
  onSelectDishToBook,
  onOpenFullProfile,
  onOpenBookingModal,
  onOpenDirectionsModal,
}) => {
  if (!isOpen || !restaurant) return null;

  const [dishSearchQuery, setDishSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDietFilter, setSelectedDietFilter] = useState<
    "All" | "Veg" | "Non-Veg" | "Vegan" | "Organic"
  >("All");

  // Only available dishes
  const availableDishesOnly = dishes.filter(
    (d) =>
      d.restaurantId === restaurant.id &&
      d.enabled !== false &&
      d.availableToday &&
      d.portionsLeft > 0 &&
      d.stockType !== "Sold Out"
  );

  // Filtered dishes
  const filteredDishes = availableDishesOnly.filter((dish) => {
    const name = dish.name || "";
    const desc = dish.description || "";
    const ingredients = dish.ingredients || "";
    const cat = dish.category || "";

    const matchesSearch =
      dishSearchQuery.trim() === "" ||
      name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
      ingredients.toLowerCase().includes(dishSearchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === "All" ||
      cat.toLowerCase() === selectedCategory.toLowerCase();

    const matchesDiet =
      selectedDietFilter === "All"
        ? true
        : selectedDietFilter === "Veg"
        ? dish.isVeg === true
        : selectedDietFilter === "Non-Veg"
        ? dish.isVeg === false
        : selectedDietFilter === "Vegan"
        ? dish.isVegan === true
        : selectedDietFilter === "Organic"
        ? dish.isOrganic === true
        : true;

    return matchesSearch && matchesCat && matchesDiet;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Card */}
      <div className="bg-white dark:bg-[#222222] text-[#111111] dark:text-slate-100 rounded-t-3xl max-h-[85vh] w-full max-w-4xl mx-auto flex flex-col shadow-2xl border-t-2 border-[#E5E5E5] dark:border-[#404040] overflow-hidden selection:bg-[#d2d0c1] selection:text-white">
        {/* Handle Bar & Top Header */}
        <div className="p-4 bg-white dark:bg-[#222222] border-b border-[#E5E5E5] dark:border-[#404040] sticky top-0 z-20 space-y-3">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto" />

          <div className="flex items-center justify-between gap-3">
            <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-[#d2d0c1]/10 text-[#d2d0c1] px-2.5 py-0.5 rounded-full border border-[#d2d0c1]/20">
                    Live Menu
                  </span>
                  <span className="text-xs text-[#737373] dark:text-slate-400 font-bold">
                    ★ {restaurant.rating} • {restaurant.distanceKm || 1.2} km away
                  </span>
                </div>
                <h3 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-slate-100">
                  {restaurant.name}
                </h3>
              </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenFullProfile(restaurant.id)}
                className="p-2.5 rounded-2xl bg-[#F5F5F5] hover:bg-[#111111] hover:text-white text-[#111111] border border-[#E5E5E5] transition-all cursor-pointer"
                title="View Full Profile"
              >
                <ExternalLink className="size-4" />
              </button>

              <button
                type="button"
                onClick={onOpenDirectionsModal}
                className="p-2.5 rounded-2xl bg-[#111111] text-white hover:bg-[#333333] transition-all cursor-pointer"
                title="Get Directions"
              >
                <Navigation className="size-4 text-[#d2d0c1]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-[#F5F5F5] hover:bg-gray-200 text-[#333333] transition-all cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Section */}
          <div className="space-y-2.5 pt-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 size-4 text-[#333333]" />
              <input
                type="text"
                value={dishSearchQuery}
                onChange={(e) => setDishSearchQuery(e.target.value)}
                placeholder="Search live dishes, ingredients..."
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] rounded-2xl text-xs font-semibold text-[#111111] placeholder:text-[#737373] border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#111111]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["All", "Starters", "Main Course", "Rice", "Desserts", "Drinks", "Pizza"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373]"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                {(["All", "Veg", "Non-Veg", "Vegan", "Organic"] as const).map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setSelectedDietFilter(diet)}
                    className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                      selectedDietFilter === diet
                        ? "bg-[#d2d0c1] text-white font-extrabold"
                        : "bg-[#F5F5F5] text-[#333333] border border-[#E5E5E5]"
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Dishes List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
            <span className="flex items-center gap-1.5">
              <Flame className="size-4 text-[#d2d0c1] fill-current animate-pulse" />
              Available Right Now ({filteredDishes.length} Items)
            </span>
            <span className="text-[10px] text-[#737373] font-semibold">
              Live Kitchen Stock Verified
            </span>
          </div>

          {filteredDishes.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Utensils className="size-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-[#737373]">
                No matching available dishes found for your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#d2d0c1] transition-all shadow-xs"
                >
                  <div className="flex gap-3">
                    <div className="relative size-24 rounded-xl overflow-hidden border border-[#E5E5E5] shrink-0 bg-white">
                      <img
                        src={(typeof dish.dishImage === "string" ? dish.dishImage : dish.dishImage?.imageUrl) || dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"}
                        alt={dish.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                        Available
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-3.5 rounded-sm flex items-center justify-center border ${
                            dish.isVeg !== false
                              ? "border-emerald-600 bg-white"
                              : "border-red-600 bg-white"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              dish.isVeg !== false ? "bg-emerald-600" : "bg-red-600"
                            }`}
                          />
                        </span>

                        {dish.isVegan && (
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-700 text-white px-1.5 py-0.5 rounded-md">
                            Vegan
                          </span>
                        )}

                        {dish.isOrganic && (
                          <span className="text-[9px] font-extrabold uppercase bg-slate-700 text-white px-1.5 py-0.5 rounded-md">
                            Organic
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif italic font-bold text-base text-[#111111] dark:text-slate-100 truncate">
                        {dish.name}
                      </h4>
                      <p className="text-[11px] text-[#333333] dark:text-slate-300 line-clamp-2 leading-tight">
                        {dish.description}
                      </p>
                      <p className="text-[10px] text-[#d2d0c1] font-bold">
                        {dish.portionsLeft} Portions Left • Prep: {dish.prepTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#404040]">
                    <span className="font-serif italic font-bold text-lg text-[#111111] dark:text-slate-100">
                      {formatCurrency(dish.discountPrice || dish.price)}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectDishToBook(dish);
                        onClose();
                      }}
                      className="py-2 px-3 rounded-xl bg-[#111111] hover:bg-[#333333] text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Plus className="size-3.5 text-[#d2d0c1]" />
                      <span>Hold &amp; Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-white dark:bg-[#222222] border-t border-[#E5E5E5] dark:border-[#404040] flex gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBookingModal();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#111111] hover:bg-[#333333] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Calendar className="size-4 text-[#d2d0c1]" />
            <span>Book Table Now</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullProfile(restaurant.id);
            }}
            className="py-3 px-5 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] hover:bg-[#111111] dark:hover:bg-[#d2d0c1] hover:text-white text-[#111111] dark:text-slate-200 text-xs font-extrabold border border-[#E5E5E5] dark:border-[#404040] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Full Profile</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
