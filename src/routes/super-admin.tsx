import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe2,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Headphones,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Sliders,
  Star,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useStockDineStore,
  formatCurrency,
  CURRENCIES,
  CurrencyCode,
  LANGUAGES,
  LanguageCode,
} from "@/lib/stockdine-store";

export const Route = createFileRoute("/super-admin")({
  head: () => ({
    meta: [
      { title: "Super Admin Platform OS — StockDine Global" },
      {
        name: "description",
        content: "Global Platform Administration for StockDine restaurant ecosystem.",
      },
    ],
  }),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const navigate = useNavigate();
  const {
    authSession,
    platformRestaurants,
    platformCustomers,
    supportTickets,
    activityLogs,
    verifyRestaurant,
    setRestaurantCommission,
    toggleFeaturedRestaurant,
    getReviews,
    deleteReview,
    reportReview,
    activeCurrency,
    setCurrency,
    activeLanguage,
    setLanguage,
    resolveSupportTicket,
  } = useStockDineStore();

  const isSuperAdmin =
    authSession?.permissions === "superadmin" ||
    authSession?.userEmail?.toLowerCase().includes("superadmin");

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#2b2b2b] flex items-center justify-center p-6 text-foreground dark:text-slate-100 selection:bg-[#d2d0c1] selection:text-white">
        <div className="max-w-md w-full text-center bg-card dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-8 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-[#111111]/10 text-[#111111] dark:text-[#d2d0c1] flex items-center justify-center mx-auto">
            <ShieldCheck className="size-7 text-[#111111] dark:text-[#d2d0c1]" />
          </div>
          <h1 className="text-2xl font-serif italic font-bold text-[#111111] dark:text-slate-100">
            Super Admin Access Required
          </h1>
          <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium leading-relaxed">
            Your current logged in session (<code>{authSession?.userEmail || "Guest"}</code>) does not have Super Admin permissions.
          </p>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-[11px] text-[#111111] dark:text-[#d2d0c1] font-mono text-left">
            Sign in as <code>superadmin@stockdine.com</code> with password <code>super123</code> to unlock the Super Admin OS.
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login"
              search={{ view: "workspace" }}
              className="px-5 py-2.5 rounded-2xl bg-[#d2d0c1] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all"
            >
              Sign In as Super Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    "analytics" | "restaurants" | "customers" | "subscriptions" | "tickets" | "moderation" | "health"
  >("analytics");

  const [searchQuery, setSearchQuery] = useState("");
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [tempCommission, setTempCommission] = useState<number>(10);

  const deduplicatePlatform = (list: typeof platformRestaurants) => {
    const seen = new Set<string>();
    return list.filter((r) => {
      if (!r || (!r.id && !r.name)) return false;
      const key = r.id || r.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniquePlatformRestaurants = deduplicatePlatform(platformRestaurants);

  // Platform Analytics Calculations
  const totalGMV = uniquePlatformRestaurants.reduce((sum, r) => sum + r.gmv, 0);
  const totalCommissions = uniquePlatformRestaurants.reduce(
    (sum, r) => sum + (r.gmv * r.commissionRate) / 100,
    0
  );
  const verifiedCount = uniquePlatformRestaurants.filter((r) => r.verificationStatus === "Verified").length;
  const pendingCount = uniquePlatformRestaurants.filter((r) => r.verificationStatus === "Pending").length;

  const filteredRestaurants = uniquePlatformRestaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background dark:bg-[#2b2b2b] text-foreground dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-[#d2d0c1] selection:text-white pb-28 transition-colors duration-300">
      {/* Super Admin Top Command Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-border dark:border-[#404040]">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#111111] dark:text-[#d2d0c1]">
            <Globe2 className="size-4 text-[#d2d0c1]" />
            <span>StockDine Global Super Admin Platform OS</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold mt-1 text-[#111111] dark:text-slate-100">
            Platform Executive Command Center
          </h1>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5 font-medium flex items-center gap-2">
            <span>Global Operations ID: HQ-SUPER-990</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time WebSocket Engine Live (18ms)
            </span>
          </p>
        </div>

        {/* Header Controls: Currency, Language, Theme, Exit */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={activeCurrency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="h-10 px-3 rounded-2xl bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-xs font-extrabold text-[#111111] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#d2d0c1] cursor-pointer shadow-sm"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={activeLanguage}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="h-10 px-3 rounded-2xl bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-xs font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#d2d0c1] cursor-pointer shadow-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <ThemeToggle />

          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white border border-border dark:border-[#404040] rounded-2xl px-3.5 py-2.5 bg-white dark:bg-[#383838] hover:bg-secondary/10 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <LogOut className="size-3.5" />
            <span>Exit Portal</span>
          </Link>
        </div>
      </header>

      {/* Global Real-Time Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global Platform Search: Restaurant Name, City, Country, Customer Email, Ticket ID..."
          className="w-full h-13 pl-11 pr-4 rounded-2xl bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] text-foreground dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d2d0c1] shadow-sm transition-all placeholder:text-muted-foreground/60"
        />
        <Search className="absolute left-4 top-4 size-5 text-[#d2d0c1] pointer-events-none" />
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
              Global GMV Volume
            </span>
            <span className="size-8 rounded-2xl bg-[#d2d0c1]/10 text-[#d2d0c1] flex items-center justify-center">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#111111] dark:text-[#d2d0c1] mt-2">
            {formatCurrency(totalGMV)}
          </p>
          <span className="text-[10px] font-semibold text-[#d2d0c1] flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="size-3" /> +34% MoM Platform Growth
          </span>
        </div>

        <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
              Commission Earnings
            </span>
            <span className="size-8 rounded-2xl bg-[#111111]/10 dark:bg-[#383838] text-[#111111] dark:text-[#d2d0c1] flex items-center justify-center">
              <DollarSign className="size-4 text-[#111111] dark:text-[#d2d0c1]" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#111111] dark:text-[#d2d0c1] mt-2">
            {formatCurrency(totalCommissions)}
          </p>
          <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 mt-1 block">
            Avg 10.4% Take Rate across venue tiers
          </span>
        </div>

        <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
              Verified Establishments
            </span>
            <span className="size-8 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-100 mt-2">
            {verifiedCount} <span className="text-xs font-sans text-muted-foreground dark:text-slate-400">/ {platformRestaurants.length}</span>
          </p>
          <span className="text-[10px] font-semibold text-[#333333] dark:text-rose-400 mt-1 block">
            {pendingCount} Pending Onboarding Review
          </span>
        </div>

        <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
              Global Platform Users
            </span>
            <span className="size-8 rounded-2xl bg-[#333333]/10 dark:bg-rose-500/10 text-[#333333] dark:text-rose-400 flex items-center justify-center">
              <Users className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#111111] dark:text-[#d2d0c1] mt-2">
            {platformCustomers.length * 940}
          </p>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1 block">
            Across 14 Target Global Countries
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex gap-2 mb-6 border-b border-border dark:border-[#404040] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <TrendingUp className="size-4" />
          <span>Platform Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("restaurants")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "restaurants"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Building2 className="size-4" />
          <span>Restaurant Directory ({platformRestaurants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "customers"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Users className="size-4" />
          <span>Customers ({platformCustomers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "subscriptions"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Layers className="size-4" />
          <span>Subscription Tiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "tickets"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Headphones className="size-4" />
          <span>Support Desk ({supportTickets.filter((t) => t.status === "Open").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "moderation"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Star className="size-4" />
          <span>Review Moderation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "health"
              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
              : "bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white"
          }`}
        >
          <Activity className="size-4" />
          <span>System Health</span>
        </button>
      </div>

      {/* SUB-TABS CONTENT */}
      {/* 1. PLATFORM ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-slate-100">
                    Global Country Revenue &amp; GMV Breakdown
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">
                    Gross merchandise value processed per target market.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#333333] dark:text-rose-400 bg-[#333333]/10 dark:bg-rose-500/10 border border-[#333333]/20 dark:border-rose-500/20 px-3 py-1 rounded-full">
                  14 Markets Active
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { country: "India 🇮🇳", gmv: 4850000, share: "34%", count: 18 },
                  { country: "United States 🇺🇸", gmv: 3900000, share: "28%", count: 12 },
                  { country: "Japan 🇯🇵", gmv: 2800000, share: "20%", count: 6 },
                  { country: "UAE 🇦🇪", gmv: 1800000, share: "12%", count: 4 },
                  { country: "France 🇫🇷", gmv: 850000, share: "6%", count: 2 },
                ].map((item) => (
                  <div key={item.country} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#111111] dark:text-[#d2d0c1] flex items-center gap-2">
                        {item.country} <span className="text-muted-foreground dark:text-slate-400 font-normal">({item.count} venues)</span>
                      </span>
                      <span className="font-serif italic text-base text-foreground dark:text-slate-100">
                        {formatCurrency(item.gmv)} ({item.share})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#d2d0c1] rounded-full transition-all duration-500"
                        style={{ width: item.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#111111] dark:text-slate-100 flex items-center gap-2 border-b border-border dark:border-[#404040] pb-3">
                <Sparkles className="size-4 text-[#d2d0c1]" />
                <span>AI Recommendation Engine Status</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] text-xs space-y-2">
                <div className="flex justify-between font-bold text-[#111111] dark:text-slate-100">
                  <span>AI Match Score Accuracy</span>
                  <span className="text-emerald-700 dark:text-emerald-400">98.4%</span>
                </div>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Real-time dish companion &amp; diner preference alignment active across all customer apps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] text-xs space-y-2">
                <div className="flex justify-between font-bold text-[#111111] dark:text-slate-100">
                  <span>Smart Mood Filters</span>
                  <span className="text-[#d2d0c1]">5 Mood Presets</span>
                </div>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Fine Dining, Business Lunch, Romantic Date, Vegan &amp; Organic, Family Feast.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESTAURANT DIRECTORY & VERIFICATION */}
      {activeTab === "restaurants" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif italic font-bold text-[#111111] dark:text-slate-100">
                Onboarded Restaurant Verification &amp; Settings
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">
                Approve new venues, configure platform commission %, toggle AI spotlight, and manage status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRestaurants.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden hover-lift"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-slate-100">{r.name}</h3>
                      {r.isFeatured && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#d2d0c1] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="size-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5 font-medium">
                      {r.city}, {r.country} • Tier: <span className="font-bold text-foreground dark:text-slate-200">{r.subscriptionTier}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      r.verificationStatus === "Verified"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : r.verificationStatus === "Pending"
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30"
                        : "bg-red-500/15 text-red-700 dark:text-rose-400 border border-red-500/20"
                    }`}
                  >
                    {r.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] text-xs font-medium">
                  <div>
                    <span className="text-[10px] text-muted-foreground dark:text-slate-400 font-extrabold uppercase block">Processed GMV</span>
                    <span className="font-serif italic font-bold text-[#111111] dark:text-[#d2d0c1] text-sm">
                      {formatCurrency(r.gmv)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground dark:text-slate-400 font-extrabold uppercase block">Take Rate</span>
                    <span className="font-bold text-foreground dark:text-slate-200 text-sm">{r.commissionRate}%</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground dark:text-slate-400 font-extrabold uppercase block">Rating / AI Score</span>
                    <span className="font-bold text-[#d2d0c1] text-sm">★ {r.rating} ({r.aiMatchScore}%)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-[#404040]">
                  <div className="flex items-center gap-1.5">
                    {r.verificationStatus !== "Verified" && (
                      <button
                        type="button"
                        onClick={() => verifyRestaurant(r.id, "Verified")}
                        className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3.5" /> Approve &amp; Verify
                      </button>
                    )}

                    {r.verificationStatus !== "Suspended" && (
                      <button
                        type="button"
                        onClick={() => verifyRestaurant(r.id, "Suspended")}
                        className="py-1.5 px-3 rounded-xl bg-[#111111]/10 dark:bg-rose-500/10 text-[#111111] dark:text-rose-400 text-[11px] font-bold hover:bg-[#111111] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <XCircle className="size-3.5" /> Suspend
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFeaturedRestaurant(r.id)}
                      className={`py-1.5 px-3 rounded-xl text-[11px] font-extrabold transition-colors ${
                        r.isFeatured
                          ? "bg-[#d2d0c1]/15 text-[#111111] dark:text-[#d2d0c1] border border-[#d2d0c1]/30"
                          : "bg-white dark:bg-[#383838] text-muted-foreground dark:text-slate-300 border border-border dark:border-[#404040]"
                      }`}
                    >
                      {r.isFeatured ? "Featured" : "Spotlight"}
                    </button>

                    {editingCommissionId === r.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempCommission}
                          onChange={(e) => setTempCommission(Number(e.target.value))}
                          className="w-14 p-1 rounded-xl bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-xs font-bold text-foreground dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRestaurantCommission(r.id, tempCommission);
                            setEditingCommissionId(null);
                          }}
                          className="px-2 py-1 bg-[#111111] dark:bg-[#d2d0c1] text-white text-xs font-bold rounded-xl"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommissionId(r.id);
                          setTempCommission(r.commissionRate);
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#383838] border border-border dark:border-[#404040] text-foreground dark:text-slate-200 text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                      >
                        <Sliders className="size-3 text-[#d2d0c1]" /> Rate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CUSTOMER DIRECTORY */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif italic font-bold text-[#111111] dark:text-slate-100">
            Registered Global Customers Directory
          </h2>

          <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border dark:border-[#404040] text-[#111111] dark:text-[#d2d0c1] uppercase text-[10px] font-extrabold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Total Bookings</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-800">
                {platformCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#383838]/50 transition-colors">
                    <td className="py-3 font-bold text-foreground dark:text-slate-200">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-muted-foreground dark:text-slate-400 font-normal">{c.email}</div>
                    </td>
                    <td className="py-3 font-semibold text-foreground dark:text-slate-300">{c.country}</td>
                    <td className="py-3 font-bold text-[#111111] dark:text-[#d2d0c1]">{c.totalBookings} passes</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUBSCRIPTION TIERS */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif italic font-bold text-[#111111] dark:text-slate-100">
            Platform Restaurant Subscription Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">Basic Tier</span>
              <h3 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-slate-100">
                {formatCurrency(4000)} <span className="text-xs font-sans font-normal text-muted-foreground dark:text-slate-400">/ mo</span>
              </h3>
              <ul className="text-xs space-y-2 text-foreground dark:text-slate-200 font-semibold">
                <li>• 8% Platform Commission</li>
                <li>• Up to 200 Table Bookings / mo</li>
                <li>• Standard Kitchen Tablet Portal</li>
              </ul>
            </div>

            <div className="bg-[#111111] dark:bg-[#383838] text-white border-2 border-[#111111] dark:border-[#d2d0c1] rounded-3xl p-6 shadow-md space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-[#d2d0c1]">Pro Tier (Most Popular)</span>
              <h3 className="font-serif italic text-3xl font-bold text-white">
                {formatCurrency(12000)} <span className="text-xs font-sans font-normal text-white/70">/ mo</span>
              </h3>
              <ul className="text-xs space-y-2 text-white/90 font-semibold">
                <li>• 10% Platform Commission</li>
                <li>• Unlimited Table &amp; Pre-Order Bookings</li>
                <li>• AI Recommendation Spotlight Engine</li>
                <li>• Real-Time Inventory &amp; Multi-Staff CRUD</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">Enterprise Tier</span>
              <h3 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-slate-100">
                {formatCurrency(32000)} <span className="text-xs font-sans font-normal text-muted-foreground dark:text-slate-400">/ mo</span>
              </h3>
              <ul className="text-xs space-y-2 text-foreground dark:text-slate-200 font-semibold">
                <li>• Custom 12-15% Commission Rate</li>
                <li>• Dedicated Account Manager &amp; 24/7 SLA</li>
                <li>• Multi-chain Location Management</li>
                <li>• Priority Featured Placement</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPPORT QUEUE */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif italic font-bold text-[#111111] dark:text-slate-100">
            Platform Support &amp; Moderation Pipeline
          </h2>

          <div className="space-y-3">
            {supportTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover-lift"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#111111] dark:bg-[#d2d0c1] text-white px-2.5 py-0.5 rounded-lg">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-[#111111] dark:text-slate-100">{t.requester}</span>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">({t.type})</span>
                  </div>
                  <h3 className="font-serif italic text-lg font-bold text-foreground dark:text-slate-100 mt-1">{t.subject}</h3>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">Submitted {t.createdAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      t.priority === "High"
                        ? "bg-red-500/15 text-red-700 dark:text-rose-400 border border-red-500/20"
                        : "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {t.priority} Priority
                  </span>

                  {t.status !== "Resolved" ? (
                    <button
                      type="button"
                      onClick={() => resolveSupportTicket(t.id)}
                      className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-colors"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. REVIEW MODERATION & ANALYTICS */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-[#d2d0c1] bg-[#111111]/10 dark:bg-[#383838] px-2.5 py-0.5 rounded-full">
              Super Admin Control
            </span>
            <h2 className="text-2xl font-serif italic font-bold text-[#111111] dark:text-slate-100 mt-1">
              Global Platform Review Moderation
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium mt-0.5">
              Moderate reported, spam, or abusive reviews across all partner establishments.
            </p>
          </div>

          {/* Moderation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">Total Diner Reviews</span>
              <p className="font-serif italic text-3xl font-bold text-[#111111] dark:text-[#d2d0c1]">
                {getReviews("").length || 3}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">4.85 Platform Rating Avg</span>
            </div>

            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">Verified Foodie Diners</span>
              <p className="font-serif italic text-3xl font-bold text-foreground dark:text-slate-100">1,840</p>
              <span className="text-[10px] text-[#111111] dark:text-[#d2d0c1] font-bold">100% Verified Community</span>
            </div>

            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground dark:text-slate-400">Flagged Moderation Queue</span>
              <p className="font-serif italic text-3xl font-bold text-amber-600 dark:text-amber-400">0 Pending</p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">100% Genuine Diners</span>
            </div>
          </div>

          <div className="space-y-4">
            {getReviews("").map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={r.customerAvatar}
                      alt={r.customerName}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-xs text-foreground dark:text-slate-200">{r.customerName}</span>
                    <span className="text-[10px] font-bold bg-[#111111]/10 dark:bg-[#383838] text-[#111111] dark:text-[#d2d0c1] px-2 py-0.5 rounded-md">
                      {r.restaurantId}
                    </span>
                    <span className="text-xs font-bold text-amber-500">★ {r.rating}.0</span>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-slate-300 italic font-medium">"{r.comment}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => deleteReview(r.id)}
                    className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-colors"
                  >
                    Remove Fake/Spam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SYSTEM HEALTH */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#111111] dark:text-slate-100">
                Infrastructure &amp; Server Health
              </h3>

              <div className="space-y-3 text-xs font-medium">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] flex justify-between">
                  <span className="text-foreground dark:text-slate-200">WebSocket Real-Time Engine</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Connected (0 Loss)</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] flex justify-between">
                  <span className="text-foreground dark:text-slate-200">API Response Latency</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">18ms Avg</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] flex justify-between">
                  <span className="text-foreground dark:text-slate-200">Database Connections</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Healthy (Pool 12/50)</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] flex justify-between">
                  <span className="text-foreground dark:text-slate-200">Automated Backups</span>
                  <span className="text-[#111111] dark:text-[#d2d0c1] font-bold">Last backup 12m ago</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#222222] border-2 border-border dark:border-[#404040] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#111111] dark:text-slate-100">
                Platform Real-Time Activity Log
              </h3>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] text-xs space-y-0.5">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span className="text-[#111111] dark:text-[#d2d0c1] uppercase">{log.type}</span>
                      <span className="text-muted-foreground dark:text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-foreground dark:text-slate-200 font-semibold">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
