import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ChefHat,
  LogOut,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Activity,
  Calendar,
  UtensilsCrossed,
  Edit2,
  Trash2,
  Search,
  ArrowLeftRight,
  ChevronDown,
  Building2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  X,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore, StockType, Dish, sanitizeNumberInput } from "@/lib/stockdine-store";
import { api } from "@/lib/api";


export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Terminal — StockDine" },
      {
        name: "description",
        content: "Live food management, batch counter, and incoming holds for the pass.",
      },
    ],
  }),
  component: KitchenPage,
});

export function KitchenPage() {
  const navigate = useNavigate();
  const {
    activityLogs,
    addDish,
    updateDish,
    deleteDish,
    adjustStock,
    setStockType,
    updateBookingStatus,
    signOut,
    authSession,
    getDishes,
    getBookings,
    getRestaurantProfile,
    verifyAdminPortalPassword,
    getAdminPortalPassword,
    setAdminPortalPassword,
  } = useStockDineStore();

  const currentRestId = authSession?.restaurantId || "";
  const currentProfile = getRestaurantProfile(currentRestId);
  const dishes = getDishes(currentRestId);
  const bookings = getBookings(currentRestId);

function playKitchenOrderChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio chime error:", e);
  }
}

  const [activeSubTab, setActiveSubTab] = useState<"stock" | "menu" | "orders" | "activity">("stock");

  // Live Backend Orders State
  const [liveOrders, setLiveOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchKitchenOrders() {
      try {
        const res: any = await api.kitchen.getOrders();
        if (res.success && res.orders) {
          if (res.orders.length > liveOrders.length && liveOrders.length > 0) {
            playKitchenOrderChime();
          }
          setLiveOrders(res.orders);
        }
      } catch (err) {
        console.log("Using store bookings fallback for kitchen");
      }
    }
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000);
    return () => clearInterval(interval);
  }, [activeSubTab, liveOrders.length]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    playKitchenOrderChime();
    try {
      await api.kitchen.updateStatus(orderId, newStatus);
      setLiveOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, bookingStatus: newStatus } : o))
      );
    } catch (e) {
      updateBookingStatus(orderId, newStatus as any);
    }
  };

  // Fast Kitchen Search Query
  const [kitchenSearchQuery, setKitchenSearchQuery] = useState("");

  // Add/Edit Dish Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState<{
    name: string;
    category: string;
    price: number;
    description: string;
    prepTime: string;
    portionsLeft: number;
    image: string;
    enabled: boolean;
    availableToday: boolean;
    stockType: StockType;
  }>({
    name: "",
    category: "Main Course",
    price: 380,
    description: "",
    prepTime: "15-20 min",
    portionsLeft: 12,
    image: "",
    enabled: true,
    availableToday: true,
    stockType: "Available",
  });

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDishId) {
      updateDish(editingDishId, foodForm);
    } else {
      addDish({
        ...foodForm,
        restaurantId: "heritage-spice",
        image:
          foodForm.image ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      });
    }
    setShowFoodModal(false);
    setEditingDishId(null);
  };

  const handleEditDish = (d: Dish) => {
    setEditingDishId(d.id);
    setFoodForm({
      name: d.name,
      category: d.category,
      price: d.price,
      description: d.description || "",
      prepTime: d.prepTime,
      portionsLeft: d.portionsLeft,
      image: d.image,
      enabled: d.enabled,
      availableToday: d.availableToday,
      stockType: d.stockType,
    });
    setShowFoodModal(true);
  };

  // Filtered queries based on Kitchen search
  const q = kitchenSearchQuery.toLowerCase().trim();
  const filteredDishes = dishes.filter(
    (d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
  );
  const activeOrders = bookings.filter(
    (b) =>
      ["Confirmed", "Accepted", "Preparing"].includes(b.bookingStatus) &&
      (b.customerName.toLowerCase().includes(q) ||
        b.tableNumber.toLowerCase().includes(q) ||
        b.bookingId.toLowerCase().includes(q))
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto selection:bg-[#E77B49] selection:text-white relative pb-28 transition-colors duration-300">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#60241E] dark:text-[#E77B49]">
            <span>Kitchen Operating Terminal • Live Sync</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold mt-1 text-[#60241E] dark:text-slate-100">
            {currentProfile?.name || "StockDine Kitchen"}
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5 font-medium">
            Terminal ID: {currentRestId} • Food Stock &amp; Pass Control
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {typeof window !== "undefined" && sessionStorage.getItem("stockdine_admin_unlocked") === "true" && (
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-200 bg-[#60241E]/10 dark:bg-slate-800 hover:bg-[#60241E] hover:text-white dark:hover:bg-[#E77B49] border border-[#60241E]/20 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Return to Admin Dashboard"
            >
              <BarChart3 className="size-3.5 text-[#E77B49]" />
              <span>Return to Admin Dashboard</span>
            </button>
          )}

          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate({ to: "/login" });
            }}
            className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 border border-rose-500/20 rounded-2xl px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Sign Out of Session"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Fast Kitchen Search Box */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={kitchenSearchQuery}
          onChange={(e) => setKitchenSearchQuery(e.target.value)}
          placeholder="Fast Kitchen Search: Food Item, Category, Customer Name, Table Number, Order Ticket..."
          className="w-full h-13 pl-11 pr-4 rounded-2xl bg-[#F8F9FA] border-2 border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm transition-all placeholder:text-[#6B7280]/60"
        />
        <Search className="absolute left-4 top-4 size-4 text-[#E77B49] pointer-events-none" />
        {kitchenSearchQuery && (
          <button
            type="button"
            onClick={() => setKitchenSearchQuery("")}
            className="absolute right-4 top-3.5 text-xs font-bold text-[#6B7280] hover:text-[#1F2937]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E5E7EB] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("stock")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === "stock"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          <Flame className="size-4 text-[#E77B49]" />
          <span>Live Stock Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("menu")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === "menu"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          <UtensilsCrossed className="size-4" />
          <span>Today's Menu ({filteredDishes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("orders")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === "orders"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          <Calendar className="size-4" />
          <span>Incoming Tickets ({activeOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("activity")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeSubTab === "activity"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
          }`}
        >
          <Activity className="size-4" />
          <span>Recent Activity ({activityLogs.length})</span>
        </button>
      </div>

      {/* Main Container Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SUB-TAB 1: LIVE STOCK TOUCH CONTROLS */}
          {activeSubTab === "stock" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif italic font-bold text-[#60241E]">Touch-Friendly Stock Control</h2>
                  <p className="text-xs text-[#6B7280] font-medium">Adjust live portions instantly on customer and admin screens.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingDishId(null);
                    setFoodForm({
                      name: "",
                      category: "Main Course",
                      price: 380,
                      description: "",
                      prepTime: "15-20 min",
                      portionsLeft: 12,
                      image: "",
                      enabled: true,
                      availableToday: true,
                      stockType: "Available",
                    });
                    setShowFoodModal(true);
                  }}
                  className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="size-4" />
                  <span>Add Dish to Menu</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredDishes.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="size-16 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center mx-auto">
                      <UtensilsCrossed className="size-8 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-xl text-foreground">
                        No dishes added yet. Start by adding your first dish.
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium max-w-sm mx-auto">
                        Add menu items to manage live kitchen portions and availability.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDishId(null);
                        setFoodForm({
                          name: "",
                          category: "Main Course",
                          price: 380,
                          description: "",
                          prepTime: "15-20 min",
                          portionsLeft: 12,
                          image: "",
                          enabled: true,
                          availableToday: true,
                          stockType: "Available",
                        });
                        setShowFoodModal(true);
                      }}
                      className="py-3 px-5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>Add Your First Dish</span>
                    </button>
                  </div>
                ) : (
                  filteredDishes.map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-4 hover-lift hover:border-[#E77B49]/50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={d.image}
                          alt={d.name}
                          className="size-16 rounded-2xl object-cover shrink-0 border border-[#E5E7EB] shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-2xl font-bold text-[#1F2937]">{d.name}</h3>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                d.stockType === "Available"
                                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                  : d.stockType === "Fast Selling"
                                  ? "bg-[#E77B49]/15 text-[#95271D] border border-[#E77B49]/30"
                                  : d.stockType === "Almost Sold Out"
                                  ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                                  : "bg-red-500/15 text-red-700"
                              }`}
                            >
                              {d.stockType}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] mt-1 font-medium">
                            Category: {d.category} • Price: ₹{d.price} • Updated: {d.lastUpdated}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif text-5xl italic font-bold text-[#60241E]">
                          {d.portionsLeft}
                        </span>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B7280]">Portions Left</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 pt-2 border-t border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, -10)}
                        className="py-3 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E7EB] text-[#1F2937] hover:bg-[#F8F9FA] text-xs font-extrabold transition-all active:scale-95"
                      >
                        -10
                      </button>

                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, -5)}
                        className="py-3 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E7EB] text-[#1F2937] hover:bg-[#F8F9FA] text-xs font-extrabold transition-all active:scale-95"
                      >
                        -5
                      </button>

                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, -1)}
                        className="py-3 rounded-2xl bg-[#FFFFFF] border-2 border-[#E5E7EB] text-[#1F2937] hover:bg-[#F8F9FA] text-xs font-extrabold transition-all active:scale-95"
                      >
                        -1
                      </button>

                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, 1)}
                        className="py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all active:scale-95 shadow-sm"
                      >
                        +1
                      </button>

                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, 5)}
                        className="py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all active:scale-95 shadow-sm"
                      >
                        +5
                      </button>

                      <button
                        type="button"
                        onClick={() => adjustStock(d.id, 10)}
                        className="py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all active:scale-95 shadow-sm"
                      >
                        +10
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStockType(d.id, d.stockType === "Sold Out" ? "Available" : "Sold Out")}
                        className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                          d.stockType === "Sold Out" ? "bg-[#E77B49] text-white shadow-sm" : "bg-[#95271D] text-white shadow-sm"
                        }`}
                      >
                        {d.stockType === "Sold Out" ? "Mark Available" : "Mark Sold Out"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditDish(d)}
                        className="py-2.5 px-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#1F2937] text-xs font-bold transition-colors"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

          {/* SUB-TAB 2: TODAY'S MENU */}
          {activeSubTab === "menu" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif italic font-bold text-[#60241E]">Today's Menu Items</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDishId(null);
                    setShowFoodModal(true);
                  }}
                  className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="size-4" />
                  <span>Add Daily Special</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDishes.map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-4 shadow-sm flex gap-4 relative overflow-hidden hover-lift"
                  >
                    <img
                      src={d.image}
                      alt={d.name}
                      className="size-24 rounded-2xl object-cover shrink-0 border border-[#E5E7EB]"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg font-bold text-[#1F2937] truncate">{d.name}</h3>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#60241E]/10 text-[#60241E]">
                            ₹{d.price}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1 font-medium">{d.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] mt-2">
                        <span className="text-xs font-bold text-[#1F2937]">Portions: {d.portionsLeft}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditDish(d)}
                            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#60241E] hover:bg-white transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDish(d.id)}
                            className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#95271D] hover:bg-[#95271D]/10 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: INCOMING ORDERS */}
          {activeSubTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif italic font-bold text-[#60241E]">Incoming Order Tickets</h2>
              <div className="space-y-4">
                {activeOrders.map((b) => (
                  <div
                    key={b.bookingId}
                    className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-4 hover-lift"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-[#60241E] text-white px-2.5 py-0.5 rounded-md shadow-sm">
                          {b.bookingId}
                        </span>
                        <h3 className="font-serif italic text-2xl font-bold text-[#1F2937] mt-1">{b.customerName}</h3>
                        <p className="text-xs text-[#6B7280] font-medium">
                          {b.tableNumber} • Arrival: {b.time}
                        </p>
                      </div>

                      <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-[#B34A44]/10 text-[#B34A44] border border-[#B34A44]/20">
                        {b.bookingStatus}
                      </span>
                    </div>

                    <ul className="text-xs space-y-2 py-3 border-y border-[#E5E7EB]">
                      {b.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-[#1F2937] font-semibold">
                          <span>{item.name}</span>
                          <span className="font-bold text-[#E77B49]">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(b.bookingId, "Preparing")}
                        className="py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                      >
                        Preparing
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(b.bookingId, "Ready")}
                        className="py-2.5 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Ready</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: RECENT ACTIVITY TIMELINE */}
          {activeSubTab === "activity" && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif italic font-bold text-[#60241E]">Recent Activity Timeline</h2>
              <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[9px] ${
                          log.type === "Food Added"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : log.type === "Booking Received"
                            ? "bg-[#E77B49]/15 text-[#95271D]"
                            : log.type === "Food Sold Out"
                            ? "bg-red-500/15 text-red-700"
                            : "bg-[#60241E]/10 text-[#60241E]"
                        }`}
                      >
                        {log.type}
                      </span>
                      <p className="font-semibold text-[#1F2937]">{log.message}</p>
                    </div>
                    <span className="text-[10px] font-medium text-[#6B7280]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Activity Stream */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E] flex items-center gap-2">
              <Activity className="size-4 text-[#E77B49]" />
              <span>Live Activity Stream</span>
            </h2>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-3xl p-4 shadow-sm space-y-3 max-h-[500px] overflow-y-auto">
            {activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-[#60241E] uppercase">{log.type}</span>
                  <span className="text-[#6B7280]">{log.timestamp}</span>
                </div>
                <p className="text-xs font-semibold text-[#1F2937] leading-snug">{log.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          setEditingDishId(null);
          setFoodForm({
            name: "",
            category: "Main Course",
            price: 380,
            description: "",
            prepTime: "15-20 min",
            portionsLeft: 12,
            image: "",
            enabled: true,
            availableToday: true,
            stockType: "Available",
          });
          setShowFoodModal(true);
        }}
        className="fixed bottom-8 right-8 z-40 size-14 rounded-full bg-[#E77B49] hover:bg-[#D66A38] text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        title="Add New Food Item"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </button>

      {/* KITCHEN FOOD FORM MODAL */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-premium rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative border-2 border-[#E5E7EB] animate-splash-in bg-[#FFFFFF]">
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
              <h3 className="font-serif text-2xl font-bold text-[#60241E]">
                {editingDishId ? "Edit Kitchen Dish" : "Add New Dish to Menu"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFoodModal(false)}
                className="text-[#6B7280] hover:text-[#1F2937] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFoodSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Food Item Name</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Chef's Special Reshmi Kebab"
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Category</label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Pizza">Pizza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: sanitizeNumberInput(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Aromatic spices & ingredients..."
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Stock Type Badge</label>
                  <select
                    value={foodForm.stockType}
                    onChange={(e) => setFoodForm({ ...foodForm, stockType: e.target.value as StockType })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited Stock">Limited Stock</option>
                    <option value="Fast Selling">Fast Selling</option>
                    <option value="Almost Sold Out">Almost Sold Out</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#60241E] mb-1">Initial Portions Stock</label>
                  <input
                    type="number"
                    value={foodForm.portionsLeft}
                    onChange={(e) => setFoodForm({ ...foodForm, portionsLeft: sanitizeNumberInput(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1F2937] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.enabled}
                    onChange={(e) => setFoodForm({ ...foodForm, enabled: e.target.checked })}
                    className="size-4 text-[#E77B49] rounded"
                  />
                  Enable Item
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#1F2937] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.availableToday}
                    onChange={(e) => setFoodForm({ ...foodForm, availableToday: e.target.checked })}
                    className="size-4 text-[#E77B49] rounded"
                  />
                  Available Today
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-sm font-extrabold shadow-md transition-colors mt-2"
              >
                Save &amp; Sync Item Instantly
              </button>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}