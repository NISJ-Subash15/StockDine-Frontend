import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Star,
  Headphones,
  Sliders,
  LogOut,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  RefreshCw,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore, formatCurrency } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/stockdine-superadmin")({
  head: () => ({
    meta: [
      { title: "Super Admin Portal — StockDine OS" },
      { name: "description", content: "Dedicated Super Admin Platform Administration for StockDine." },
    ],
  }),
  component: StockDineSuperAdminPage,
});

type SuperAdminTab =
  | "dashboard"
  | "users"
  | "restaurants"
  | "bookings"
  | "payments"
  | "reviews"
  | "crm"
  | "settings";

function StockDineSuperAdminPage() {
  const navigate = useNavigate();
  const { authSession, setAuthSession, signOut } = useStockDineStore();

  const isSuperAdmin =
    authSession?.isLoggedIn &&
    (authSession?.userRole === "superadmin" ||
      authSession?.userRole === "super_admin" ||
      authSession?.permissions === "superadmin");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("nisjsubash@gmail.com");
  const [loginPassword, setLoginPassword] = useState("15082007");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Portal active tab state
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("dashboard");

  // Real Database Data State
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [crmTickets, setCrmTickets] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle dedicated Super Admin Login
  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await api.superAdmin.login({
        email: loginEmail,
        password: loginPassword,
      });

      setIsLoggingIn(false);

      if (res && res.success && res.token) {
        localStorage.setItem("stockdine_token", res.token);
        setAuthSession({
          userEmail: res.user?.email || loginEmail,
          restaurantId: "HQ-SUPERADMIN",
          permissions: "superadmin",
          isLoggedIn: true,
          userRole: "superadmin",
          profileData: res.user,
        });
      } else {
        setLoginError(res.message || "Invalid Super Admin credentials.");
      }
    } catch (err: any) {
      setIsLoggingIn(false);
      setLoginError(err.message || "Authentication failed. Access Denied.");
    }
  };

  // Fetch real database data when authenticated as Super Admin
  const fetchSuperAdminData = async () => {
    if (!isSuperAdmin) return;
    setLoadingData(true);
    try {
      const [
        statsRes,
        usersRes,
        restsRes,
        bookingsRes,
        paymentsRes,
        reviewsRes,
        crmRes,
        settingsRes,
      ] = await Promise.allSettled([
        api.superAdmin.getStats(),
        api.superAdmin.getUsers(),
        api.superAdmin.getRestaurants(),
        api.superAdmin.getBookings(),
        api.superAdmin.getPayments(),
        api.superAdmin.getReviews(),
        api.superAdmin.getCrm(),
        api.superAdmin.getSettings(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setStats(statsRes.value.stats);
      }
      if (usersRes.status === "fulfilled" && usersRes.value?.success) {
        setUsersList(usersRes.value.users || []);
      }
      if (restsRes.status === "fulfilled" && restsRes.value?.success) {
        setRestaurantsList(restsRes.value.restaurants || []);
      }
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
        setBookingsList(bookingsRes.value.bookings || []);
      }
      if (paymentsRes.status === "fulfilled" && paymentsRes.value?.success) {
        setPaymentsData(paymentsRes.value.analytics);
      }
      if (reviewsRes.status === "fulfilled" && reviewsRes.value?.success) {
        setReviewsList(reviewsRes.value.reviews || []);
      }
      if (crmRes.status === "fulfilled" && crmRes.value?.success) {
        setCrmTickets(crmRes.value.tickets || []);
      }
      if (settingsRes.status === "fulfilled" && settingsRes.value?.success) {
        setPlatformSettings(settingsRes.value.settings);
      }
    } catch (e) {
      console.warn("Failed to fetch superadmin metrics", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSuperAdminData();
    }
  }, [isSuperAdmin]);

  // Restaurant Approval Handlers
  const handleApproveRestaurant = async (id: string) => {
    try {
      const res = await api.superAdmin.approveRestaurant(id);
      if (res.success) {
        setRestaurantsList((prev) =>
          prev.map((r) => (r._id === id || r.id === id ? { ...r, status: "Approved" } : r))
        );
        fetchSuperAdminData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to approve restaurant.");
    }
  };

  const handleRejectRestaurant = async (id: string) => {
    try {
      const res = await api.superAdmin.rejectRestaurant(id);
      if (res.success) {
        setRestaurantsList((prev) =>
          prev.map((r) => (r._id === id || r.id === id ? { ...r, status: "Rejected" } : r))
        );
        fetchSuperAdminData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to reject restaurant.");
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this restaurant?")) return;
    try {
      const res = await api.superAdmin.deleteRestaurant(id);
      if (res.success) {
        setRestaurantsList((prev) => prev.filter((r) => r._id !== id && r.id !== id));
        fetchSuperAdminData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete restaurant.");
    }
  };

  // User Deletion Handler
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    try {
      const res = await api.superAdmin.deleteUser(id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== id && u.id !== id));
        fetchSuperAdminData();
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete user.");
    }
  };

  // Review Deletion Handler
  const handleDeleteReview = async (id: string) => {
    try {
      const res = await api.superAdmin.deleteReview(id);
      if (res.success) {
        setReviewsList((prev) => prev.filter((r) => r._id !== id && r.id !== id));
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete review.");
    }
  };

  // -------------------------------------------------------------
  // 1. UNAUTHENTICATED: DEDICATED SUPER ADMIN LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#2b2b2b] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#d2d0c1] selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,36,30,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(96,36,30,0.4),transparent_70%)] pointer-events-none" />

        {/* Top Header */}
        <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full pt-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#111111] border border-[#d2d0c1]/40 flex items-center justify-center shadow-lg">
              <ShieldCheck className="size-6 text-[#d2d0c1]" />
            </div>
            <div>
              <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-slate-100 block leading-none">
                StockDine OS
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#d2d0c1] font-extrabold block mt-1">
                Super Admin Security Gateway
              </span>
            </div>
          </div>

          <ThemeToggle />
        </header>

        {/* Super Admin Login Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-white/90 dark:bg-[#222222]/90 backdrop-blur-2xl border border-border dark:border-[#404040] p-8 sm:p-10 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#d2d0c1]/10 text-[#d2d0c1] text-[10px] font-extrabold uppercase tracking-widest border border-[#d2d0c1]/20">
                  <Lock className="size-3" />
                  <span>Restricted Access</span>
                </div>
                <h1 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-slate-100">
                  Super Admin Portal
                </h1>
                <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">
                  Enter your encrypted Super Admin credentials to unlock platform administration.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="superadmin@stockdine.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#383838]/80 border border-border dark:border-[#404040] text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#d2d0c1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#383838]/80 border border-border dark:border-[#404040] text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#d2d0c1]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-2xl bg-[#d2d0c1] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoggingIn ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Unlock Super Admin OS</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-[11px] text-muted-foreground dark:text-slate-500 font-mono">
                  Default credentials pre-filled for demo testing
                </span>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 pb-2 text-center text-[11px] text-muted-foreground dark:text-slate-500 font-medium">
          © StockDine Inc. Dedicated Super Admin Gateway.
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED: SUPER ADMIN PLATFORM OS DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#2b2b2b] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#d2d0c1] selection:text-white transition-colors duration-300">
      {/* Top Super Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-xl border-b border-border dark:border-[#404040] px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-[#d2d0c1] text-white flex items-center justify-center shadow-lg font-bold">
            <ShieldCheck className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-2xl font-bold tracking-tight text-[#111111] dark:text-white leading-none">
                StockDine HQ
              </span>
              <span className="text-[10px] uppercase font-extrabold bg-[#d2d0c1]/20 text-[#d2d0c1] px-2.5 py-0.5 rounded-full border border-[#d2d0c1]/30">
                Super Admin OS
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground dark:text-slate-400 font-mono mt-0.5">
              Logged in as: {authSession?.userEmail}
            </p>
          </div>
        </div>

        {/* Global Controls & Sign Out */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSuperAdminData}
            disabled={loadingData}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#383838] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-border dark:border-[#404040] transition-all cursor-pointer"
            title="Refresh Real MongoDB Data"
          >
            <RefreshCw className={`size-4 ${loadingData ? "animate-spin" : ""}`} />
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              signOut();
              navigate({ to: "/stockdine-superadmin" });
            }}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <nav className="bg-white/80 dark:bg-[#222222]/60 border-b border-border dark:border-[#404040] px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          {[
            { id: "dashboard", label: "Dashboard Overview", icon: <TrendingUp className="size-4" /> },
            { id: "users", label: "User Management", icon: <Users className="size-4" /> },
            { id: "restaurants", label: "Restaurants & Approvals", icon: <Building2 className="size-4" /> },
            { id: "bookings", label: "Booking Oversight", icon: <Calendar className="size-4" /> },
            { id: "payments", label: "Payments & GMV", icon: <DollarSign className="size-4" /> },
            { id: "reviews", label: "Review Moderation", icon: <Star className="size-4" /> },
            { id: "crm", label: "CRM & Support", icon: <Headphones className="size-4" /> },
            { id: "settings", label: "Platform Settings", icon: <Sliders className="size-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SuperAdminTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#d2d0c1] text-white shadow-lg"
                  : "bg-slate-100 dark:bg-[#383838]/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#383838] hover:text-slate-900 dark:hover:text-white border border-border/60 dark:border-[#404040]/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-20">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Real MongoDB Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total Users</span>
                  <Users className="size-5 text-[#d2d0c1]" />
                </div>
                <p className="text-3xl font-serif italic font-bold text-[#111111] dark:text-white">
                  {stats?.totalUsers || usersList.length || 0}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">Real MongoDB Registered Diners & Admins</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total Restaurants</span>
                  <Building2 className="size-5 text-amber-500" />
                </div>
                <p className="text-3xl font-serif italic font-bold text-[#111111] dark:text-white">
                  {stats?.totalRestaurants || restaurantsList.length || 0}
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {stats?.activeRestaurants || 0} Approved • {stats?.pendingApprovals || 0} Pending
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total Bookings</span>
                  <Calendar className="size-5 text-blue-500" />
                </div>
                <p className="text-3xl font-serif italic font-bold text-[#111111] dark:text-white">
                  {stats?.totalBookings || bookingsList.length || 0}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                  {stats?.completedBookings || 0} Completed • {stats?.cancelledBookings || 0} Cancelled
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-muted-foreground dark:text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Gross GMV</span>
                  <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-serif italic font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats?.gmv || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                  Advance Collected: {formatCurrency(stats?.advancePayments || 0)}
                </p>
              </div>
            </div>

            {/* Pending Restaurant Approvals Section */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#d2d0c1] bg-[#d2d0c1]/10 px-3 py-1 rounded-full border border-[#d2d0c1]/20">
                    Action Required
                  </span>
                  <h2 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-white">
                    Pending Restaurant Approvals ({restaurantsList.filter((r) => r.status === "Pending").length})
                  </h2>
                </div>
              </div>

              {restaurantsList.filter((r) => r.status === "Pending").length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#383838]/40 rounded-2xl border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-400 text-xs font-semibold">
                  ✨ No pending restaurant approvals. All partner applications have been reviewed.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantsList
                    .filter((r) => r.status === "Pending")
                    .map((r) => (
                      <div
                        key={r._id || r.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-[#383838]/80 border border-border dark:border-[#404040] space-y-3"
                      >
                        <div>
                          <h3 className="font-serif italic text-xl font-bold text-[#111111] dark:text-white">
                            {r.restaurantName}
                          </h3>
                          <p className="text-xs text-muted-foreground dark:text-slate-400">Owner: {r.ownerName || r.email}</p>
                          <p className="text-xs text-muted-foreground dark:text-slate-400">City: {r.city || r.address || "Local"}</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveRestaurant(r._id || r.id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="size-4" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRestaurant(r._id || r.id)}
                            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <XCircle className="size-4" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                  User Management ({usersList.length})
                </h2>
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                  Real MongoDB registered diners, restaurant owners, and super admins.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user name, email, mobile..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#d2d0c1]"
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#383838]/80 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-border dark:border-[#404040]">
                    <tr>
                      <th className="p-4">Customer / User</th>
                      <th className="p-4">Mobile Number</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-slate-800">
                    {usersList
                      .filter(
                        (u) =>
                          !searchTerm ||
                          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.mobile?.includes(searchTerm)
                      )
                      .map((u) => (
                        <tr key={u._id || u.id} className="hover:bg-slate-50 dark:hover:bg-[#383838]/40">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-muted-foreground dark:text-slate-400 font-mono">{u.email || "No email"}</div>
                          </td>
                          <td className="p-4 font-mono">{u.mobile}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                u.role === "superadmin" || u.role === "super_admin"
                                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                  : u.role === "restaurant"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              }`}
                            >
                              {u.role || "customer"}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground dark:text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Live"}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id || u.id)}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 transition-all cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESTAURANT MANAGEMENT & APPROVALS */}
        {activeTab === "restaurants" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                  Restaurant Management ({restaurantsList.length})
                </h2>
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                  Approve new partner venues, set commission rates, and manage venue status.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantsList.map((r) => (
                <div
                  key={r._id || r.id}
                  className="bg-white dark:bg-[#222222] border border-border dark:border-[#404040] rounded-3xl p-5 shadow-lg space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border mb-2 ${
                          r.status === "Approved"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : r.status === "Rejected"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        Status: {r.status || "Pending"}
                      </span>
                      <h3 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-white">
                        {r.restaurantName}
                      </h3>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">{r.cuisine || "Multi-Cuisine"} • {r.city || "Local"}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#383838]/60 border border-border dark:border-[#404040] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground dark:text-slate-400">Owner:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{r.ownerName || "Partner"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground dark:text-slate-400">Email:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-300">{r.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground dark:text-slate-400">Mobile:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-300">{r.mobileNumber || r.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {r.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => handleApproveRestaurant(r._id || r.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="size-4" /> Approve
                      </button>
                    )}
                    {r.status !== "Rejected" && (
                      <button
                        type="button"
                        onClick={() => handleRejectRestaurant(r._id || r.id)}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="size-4" /> Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteRestaurant(r._id || r.id)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#383838] hover:bg-rose-50 dark:hover:bg-rose-950 border border-border dark:border-[#404040] hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
                      title="Delete Restaurant"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BOOKING OVERSIGHT */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                Booking Oversight ({bookingsList.length})
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Platform-wide real MongoDB dining table reservations and advance payments.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#383838]/80 text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-border dark:border-[#404040]">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Restaurant</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Amounts</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-slate-800">
                    {bookingsList.map((b) => (
                      <tr key={b._id || b.id || b.bookingId} className="hover:bg-slate-50 dark:hover:bg-[#383838]/40">
                        <td className="p-4 font-mono font-bold text-[#d2d0c1]">
                          {b.bookingId || b._id}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{b.restaurantName}</td>
                        <td className="p-4">{b.customerName}</td>
                        <td className="p-4 text-muted-foreground dark:text-slate-400">{b.date}, {b.time}</td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          Total: {formatCurrency(b.totalAmount)} (Advance: {formatCurrency(b.advanceAmount)})
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              b.bookingStatus === "Completed"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : b.bookingStatus === "Cancelled"
                                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENTS & GMV */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                Payment &amp; GMV Analytics
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Gross Merchandise Value, advance payments, and revenue metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-xl space-y-2">
                <span className="text-xs font-extrabold uppercase text-muted-foreground dark:text-slate-400">Total Platform GMV</span>
                <p className="text-4xl font-serif italic font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paymentsData?.gmv || stats?.gmv || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">Non-cancelled reservation value</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-xl space-y-2">
                <span className="text-xs font-extrabold uppercase text-muted-foreground dark:text-slate-400">Advance Payments Collected</span>
                <p className="text-4xl font-serif italic font-bold text-[#d2d0c1]">
                  {formatCurrency(paymentsData?.totalAdvance || stats?.advancePayments || 0)}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">Total upfront deposits processed</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] shadow-xl space-y-2">
                <span className="text-xs font-extrabold uppercase text-muted-foreground dark:text-slate-400">Platform Commission (10%)</span>
                <p className="text-4xl font-serif italic font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(((paymentsData?.gmv || stats?.gmv || 0) * 10) / 100)}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-slate-400">Estimated net platform earnings</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                Review Moderation ({reviewsList.length})
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Monitor and moderate customer ratings across partner restaurants.
              </p>
            </div>

            {reviewsList.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#222222] rounded-3xl border border-border dark:border-[#404040] text-muted-foreground dark:text-slate-400 text-xs font-semibold">
                ⭐ No reported or flagged reviews found in database.
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div
                    key={rev._id || rev.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] flex justify-between items-start gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          ★ {rev.rating || 5.0}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.userName || "Diner"}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{rev.comment}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev._id || rev.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                    >
                      Remove Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CRM & SUPPORT */}
        {activeTab === "crm" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                CRM &amp; Support Tickets ({crmTickets.length})
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Customer support, reservation inquiries, and billing assistance.
              </p>
            </div>

            <div className="space-y-4">
              {crmTickets.map((t) => (
                <div
                  key={t.id || t.ticketId}
                  className="p-5 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-[#d2d0c1] font-bold block">
                        {t.ticketId}
                      </span>
                      <h3 className="font-serif italic text-xl font-bold text-[#111111] dark:text-white">
                        {t.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">
                        From: {t.customerName} ({t.customerEmail})
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                        t.status === "Open"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-[#383838]/60 p-3 rounded-2xl border border-border dark:border-[#404040]">
                    "{t.message}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: PLATFORM SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-white">
                Platform Settings
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Configure global defaults, commission rates, and feature toggles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#222222] border border-border dark:border-[#404040] space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center py-2 border-b border-border dark:border-[#404040]">
                <span className="text-slate-900 dark:text-slate-100">Default Restaurant Commission Rate</span>
                <span className="text-[#d2d0c1] font-mono">10%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border dark:border-[#404040]">
                <span className="text-slate-900 dark:text-slate-100">Advance Payment Percentage</span>
                <span className="text-[#d2d0c1] font-mono">20%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border dark:border-[#404040]">
                <span className="text-slate-900 dark:text-slate-100">Platform Currency</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">INR (₹)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-900 dark:text-slate-100">Database Connection</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">MongoDB Atlas Connected 🟢</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
