import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Star, MapPin, ArrowRight, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/customer/favorites")({
  head: () => ({
    meta: [
      { title: "Saved Favorites — StockDine" },
      { name: "description", content: "Your saved restaurants and favorite venues." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { getAllRestaurantProfiles } = useStockDineStore();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavourites() {
      setLoading(true);
      try {
        const res: any = await api.auth.getProfile();
        if (res && res.success && res.profile && res.profile.favouriteRestaurants) {
          const deduplicateFavs = (list: any[]) => {
            const seen = new Set<string>();
            return list.filter((r) => {
              const key = r._id || r.id || r.restaurantId || (r.restaurantName ? r.restaurantName.toLowerCase().trim() : "");
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          };
          setFavourites(deduplicateFavs(res.profile.favouriteRestaurants));
        } else {
          const profilesMap = getAllRestaurantProfiles();
          setFavourites(Object.values(profilesMap).slice(0, 0)); // Empty state if no favorites yet
        }
      } catch (err) {
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    }
    loadFavourites();
  }, []);

  return (
    <div className="px-4 sm:px-6 pt-8 max-w-xl mx-auto pb-28 selection:bg-[#E77B49] selection:text-white bg-[#FFFFFF] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/customer"
            className="p-2.5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-200 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Back to Customer Portal"
          >
            <ArrowLeft className="size-4 text-[#60241E] dark:text-[#E77B49]" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#E77B49] font-extrabold">
              Saved Establishments
            </p>
            <h1 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
              Favorites
            </h1>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="size-8 border-4 border-[#E77B49] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#6B7280] dark:text-slate-400">Loading your favourite restaurants...</p>
        </div>
      ) : favourites.length > 0 ? (
        <div className="space-y-4">
          {favourites.map((r) => (
            <div
              key={r._id || r.id}
              className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-[#E77B49]/50 transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="font-serif text-xl font-bold text-[#1F2937] dark:text-slate-100 truncate">
                        {r.restaurantName || r.name}
                      </h2>
                      <button className="text-[#95271D] hover:scale-125 transition-transform p-1">
                        <Heart className="size-4 fill-current" />
                      </button>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="size-3 text-[#E77B49]" /> {r.address || r.city || "Local Venue"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-[#1F2937] dark:text-slate-200 flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{r.rating ? r.rating.toFixed(1) : "5.0"}</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-[#E77B49]/10 text-[#E77B49] px-3 py-1 rounded-full border border-[#E77B49]/20">
                      Verified Venue
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#E5E7EB] dark:border-slate-800 flex gap-2.5">
                <Link
                  to="/customer/restaurant/$restaurantId"
                  params={{ restaurantId: String(r._id || r.id) }}
                  className="flex-1 py-2.5 text-center text-xs font-extrabold uppercase tracking-wider bg-[#E77B49] hover:bg-[#D66A38] text-white rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>View Venue</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-3">
          <Heart className="size-12 text-[#6B7280] dark:text-slate-500 mx-auto opacity-40" />
          <h2 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">No Favourite Restaurants</h2>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-xs mx-auto font-medium">
            Explore nearby restaurants and tap the heart icon to save your top dining spots.
          </p>
          <div className="pt-2">
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all"
            >
              <Building2 className="size-4" />
              <span>Discover Restaurants</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}