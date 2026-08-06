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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-6 text-[#1F2937] selection:bg-[#E77B49] selection:text-white">
        <div className="max-w-md w-full text-center bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-8 shadow-xl space-y-4">
          <div className="size-14 rounded-2xl bg-[#95271D]/10 text-[#95271D] flex items-center justify-center mx-auto">
            <ShieldCheck className="size-7 text-[#95271D]" />
          </div>
          <h1 className="text-2xl font-serif italic font-bold text-[#60241E]">
            Super Admin Access Required
          </h1>
          <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
            Your current logged in session (<code>{authSession?.userEmail || "Guest"}</code>) does not have Super Admin permissions.
          </p>
          <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] text-[11px] text-[#60241E] font-mono text-left">
            Sign in as <code>superadmin@stockdine.com</code> with password <code>super123</code> to unlock the Super Admin OS.
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login"
              search={{ view: "workspace" }}
              className="px-5 py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all"
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
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-[#E77B49] selection:text-white pb-28 transition-colors duration-300">
      {/* Super Admin Top Command Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-border dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#60241E] dark:text-[#E77B49]">
            <Globe2 className="size-4 text-[#E77B49]" />
            <span>StockDine Global Super Admin Platform OS</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold mt-1 text-[#60241E] dark:text-slate-100">
            Platform Executive Command Center
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5 font-medium flex items-center gap-2">
            <span>Global Operations ID: HQ-SUPER-990</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
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
              className="h-10 px-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-extrabold text-[#60241E] focus:outline-none focus:ring-2 focus:ring-[#E77B49] cursor-pointer shadow-sm"
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
              className="h-10 px-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-extrabold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#E77B49] cursor-pointer shadow-sm"
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
            className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-[#6B7280] hover:text-[#1F2937] border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 hover:bg-[#F8F9FA] transition-colors shadow-sm"
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
          className="w-full h-13 pl-11 pr-4 rounded-2xl bg-[#F8F9FA] border-2 border-[#E5E7EB] text-[#1F2937] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm transition-all placeholder:text-[#6B7280]/60"
        />
        <Search className="absolute left-4 top-4 size-5 text-[#E77B49] pointer-events-none" />
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              Global GMV Volume
            </span>
            <span className="size-8 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-2">
            {formatCurrency(totalGMV)}
          </p>
          <span className="text-[10px] font-semibold text-[#E77B49] flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="size-3" /> +34% MoM Platform Growth
          </span>
        </div>

        <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              Commission Earnings
            </span>
            <span className="size-8 rounded-2xl bg-[#60241E]/10 text-[#60241E] flex items-center justify-center">
              <DollarSign className="size-4 text-[#60241E]" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-2">
            {formatCurrency(totalCommissions)}
          </p>
          <span className="text-[10px] font-semibold text-[#6B7280] mt-1 block">
            Avg 10.4% Take Rate across venue tiers
          </span>
        </div>

        <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              Verified Establishments
            </span>
            <span className="size-8 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Building2 className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#1F2937] mt-2">
            {verifiedCount} <span className="text-xs font-sans text-[#6B7280]">/ {platformRestaurants.length}</span>
          </p>
          <span className="text-[10px] font-semibold text-[#B34A44] mt-1 block">
            {pendingCount} Pending Onboarding Review
          </span>
        </div>

        <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              Global Platform Users
            </span>
            <span className="size-8 rounded-2xl bg-[#B34A44]/10 text-[#B34A44] flex items-center justify-center">
              <Users className="size-4" />
            </span>
          </div>
          <p className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-2">
            {platformCustomers.length * 940}
          </p>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
            Across 14 Target Global Countries
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex gap-2 mb-6 border-b border-[#E5E7EB] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
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
            <div className="md:col-span-2 bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif italic text-2xl font-bold text-[#60241E]">
                    Global Country Revenue &amp; GMV Breakdown
                  </h2>
                  <p className="text-xs text-[#6B7280] font-medium">
                    Gross merchandise value processed per target market.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#B34A44] bg-[#B34A44]/10 border border-[#B34A44]/20 px-3 py-1 rounded-full">
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
                  <div key={item.country} className="p-4 rounded-2xl bg-white border border-[#E5E7EB] space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#60241E] flex items-center gap-2">
                        {item.country} <span className="text-[#6B7280] font-normal">({item.count} venues)</span>
                      </span>
                      <span className="font-serif italic text-base text-[#1F2937]">
                        {formatCurrency(item.gmv)} ({item.share})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F8F9FA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E77B49] rounded-full transition-all duration-500"
                        style={{ width: item.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#60241E] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                <Sparkles className="size-4 text-[#E77B49]" />
                <span>AI Recommendation Engine Status</span>
              </h3>

              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs space-y-2">
                <div className="flex justify-between font-bold text-[#60241E]">
                  <span>AI Match Score Accuracy</span>
                  <span className="text-emerald-700">98.4%</span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Real-time dish companion &amp; diner preference alignment active across all customer apps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs space-y-2">
                <div className="flex justify-between font-bold text-[#60241E]">
                  <span>Smart Mood Filters</span>
                  <span className="text-[#E77B49]">5 Mood Presets</span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
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
              <h2 className="text-xl font-serif italic font-bold text-[#60241E]">
                Onboarded Restaurant Verification &amp; Settings
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">
                Approve new venues, configure platform commission %, toggle AI spotlight, and manage status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRestaurants.map((r) => (
              <div
                key={r.id}
                className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden hover-lift"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">{r.name}</h3>
                      {r.isFeatured && (
                        <span className="text-[9px] font-extrabold uppercase bg-[#E77B49] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="size-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5 font-medium">
                      {r.city}, {r.country} • Tier: <span className="font-bold text-[#1F2937]">{r.subscriptionTier}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      r.verificationStatus === "Verified"
                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                        : r.verificationStatus === "Pending"
                        ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                        : "bg-red-500/15 text-red-700 border border-red-500/20"
                    }`}
                  >
                    {r.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white border border-[#E5E7EB] text-xs font-medium">
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-extrabold uppercase block">Processed GMV</span>
                    <span className="font-serif italic font-bold text-[#60241E] text-sm">
                      {formatCurrency(r.gmv)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6B7280] font-extrabold uppercase block">Take Rate</span>
                    <span className="font-bold text-[#1F2937] text-sm">{r.commissionRate}%</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6B7280] font-extrabold uppercase block">Rating / AI Score</span>
                    <span className="font-bold text-[#E77B49] text-sm">★ {r.rating} ({r.aiMatchScore}%)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5">
                    {r.verificationStatus !== "Verified" && (
                      <button
                        type="button"
                        onClick={() => verifyRestaurant(r.id, "Verified")}
                        className="py-1.5 px-3 rounded-xl bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3.5" /> Approve &amp; Verify
                      </button>
                    )}

                    {r.verificationStatus !== "Suspended" && (
                      <button
                        type="button"
                        onClick={() => verifyRestaurant(r.id, "Suspended")}
                        className="py-1.5 px-3 rounded-xl bg-[#95271D]/10 text-[#95271D] text-[11px] font-bold hover:bg-[#95271D] hover:text-white transition-colors flex items-center gap-1"
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
                          ? "bg-[#E77B49]/15 text-[#95271D] border border-[#E77B49]/30"
                          : "bg-white text-[#6B7280] border border-[#E5E7EB]"
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
                          className="w-14 p-1 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#1F2937]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRestaurantCommission(r.id, tempCommission);
                            setEditingCommissionId(null);
                          }}
                          className="px-2 py-1 bg-[#60241E] text-white text-xs font-bold rounded-xl"
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
                        className="py-1.5 px-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#1F2937] text-[11px] font-bold hover:bg-[#F8F9FA] flex items-center gap-1"
                      >
                        <Sliders className="size-3 text-[#E77B49]" /> Rate
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
          <h2 className="text-xl font-serif italic font-bold text-[#60241E]">
            Registered Global Customers Directory
          </h2>

          <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#60241E] uppercase text-[10px] font-extrabold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Total Bookings</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {platformCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white transition-colors">
                    <td className="py-3 font-bold text-[#1F2937]">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-[#6B7280] font-normal">{c.email}</div>
                    </td>
                    <td className="py-3 font-semibold text-[#1F2937]">{c.country}</td>
                    <td className="py-3 font-bold text-[#60241E]">{c.totalBookings} passes</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
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
          <h2 className="text-xl font-serif italic font-bold text-[#60241E]">
            Platform Restaurant Subscription Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Basic Tier</span>
              <h3 className="font-serif italic text-3xl font-bold text-[#60241E]">
                {formatCurrency(4000)} <span className="text-xs font-sans font-normal text-[#6B7280]">/ mo</span>
              </h3>
              <ul className="text-xs space-y-2 text-[#1F2937] font-semibold">
                <li>• 8% Platform Commission</li>
                <li>• Up to 200 Table Bookings / mo</li>
                <li>• Standard Kitchen Tablet Portal</li>
              </ul>
            </div>

            <div className="bg-[#60241E] text-white border-2 border-[#60241E] rounded-3xl p-6 shadow-md space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-[#E77B49]">Pro Tier (Most Popular)</span>
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

            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Enterprise Tier</span>
              <h3 className="font-serif italic text-3xl font-bold text-[#60241E]">
                {formatCurrency(32000)} <span className="text-xs font-sans font-normal text-[#6B7280]">/ mo</span>
              </h3>
              <ul className="text-xs space-y-2 text-[#1F2937] font-semibold">
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
          <h2 className="text-xl font-serif italic font-bold text-[#60241E]">
            Platform Support &amp; Moderation Pipeline
          </h2>

          <div className="space-y-3">
            {supportTickets.map((t) => (
              <div
                key={t.id}
                className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover-lift"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#60241E] text-white px-2.5 py-0.5 rounded-lg">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-[#60241E]">{t.requester}</span>
                    <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">({t.type})</span>
                  </div>
                  <h3 className="font-serif italic text-lg font-bold text-[#1F2937] mt-1">{t.subject}</h3>
                  <p className="text-xs text-[#6B7280] font-medium">Submitted {t.createdAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      t.priority === "High"
                        ? "bg-red-500/15 text-red-700 border border-red-500/20"
                        : "bg-amber-500/15 text-amber-800 border border-amber-500/30"
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
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#60241E] bg-[#60241E]/10 px-2.5 py-0.5 rounded-full">
              Super Admin Control
            </span>
            <h2 className="text-2xl font-serif italic font-bold text-[#60241E] mt-1">
              Global Platform Review Moderation
            </h2>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
              Moderate reported, spam, or abusive reviews across all partner establishments.
            </p>
          </div>

          {/* Moderation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Total Diner Reviews</span>
              <p className="font-serif italic text-3xl font-bold text-[#60241E]">
                {getReviews("").length || 3}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold">4.85 Platform Rating Avg</span>
            </div>

            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Verified Foodie Diners</span>
              <p className="font-serif italic text-3xl font-bold text-[#1F2937]">1,840</p>
              <span className="text-[10px] text-[#60241E] font-bold">100% Verified Community</span>
            </div>

            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#6B7280]">Flagged Moderation Queue</span>
              <p className="font-serif italic text-3xl font-bold text-amber-600">0 Pending</p>
              <span className="text-[10px] text-emerald-700 font-bold">100% Genuine Diners</span>
            </div>
          </div>

          <div className="space-y-4">
            {getReviews("").map((r) => (
              <div
                key={r.id}
                className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={r.customerAvatar}
                      alt={r.customerName}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-xs text-[#1F2937]">{r.customerName}</span>
                    <span className="text-[10px] font-bold bg-[#60241E]/10 text-[#60241E] px-2 py-0.5 rounded-md">
                      {r.restaurantId}
                    </span>
                    <span className="text-xs font-bold text-amber-500">★ {r.rating}.0</span>
                  </div>
                  <p className="text-xs text-[#4B5563] italic font-medium">"{r.comment}"</p>
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
            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#60241E]">
                Infrastructure &amp; Server Health
              </h3>

              <div className="space-y-3 text-xs font-medium">
                <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex justify-between">
                  <span>WebSocket Real-Time Engine</span>
                  <span className="text-emerald-700 font-bold">Connected (0 Loss)</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex justify-between">
                  <span>API Response Latency</span>
                  <span className="text-emerald-700 font-bold">18ms Avg</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex justify-between">
                  <span>Database Connections</span>
                  <span className="text-emerald-700 font-bold">Healthy (Pool 12/50)</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex justify-between">
                  <span>Automated Backups</span>
                  <span className="text-[#60241E] font-bold">Last backup 12m ago</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-[#60241E]">
                Platform Real-Time Activity Log
              </h3>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-white border border-[#E5E7EB] text-xs space-y-0.5">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span className="text-[#60241E] uppercase">{log.type}</span>
                      <span className="text-[#6B7280]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#1F2937] font-semibold">{log.message}</p>
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
