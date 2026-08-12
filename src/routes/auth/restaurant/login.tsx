import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/auth/restaurant/login")({
  head: () => ({
    meta: [
      { title: "Restaurant Partner Sign In — StockDine" },
      { name: "description", content: "Sign in to manage live stock, menu items, table reservations, and kitchen orders." },
    ],
  }),
  component: RestaurantLoginPage,
});

function RestaurantLoginPage() {
  const navigate = useNavigate();
  const { setAuthSession, resolveLoginRole } = useStockDineStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email/mobile and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setIsLoading(false);

      if (res.success && res.token) {
        const userRole = (res.role || res.user?.role || "restaurant").toLowerCase();
        if (userRole === "customer" || userRole === "user") {
          setErrorMsg("This account is registered as a Customer. Please sign in as a Customer.");
          return;
        }

        localStorage.setItem("stockdine_token", res.token);
        const restMongoId = res.user?._id || res.user?.id || res.user?.restaurantId || "";
        setAuthSession({
          userEmail: res.user?.email || email,
          restaurantId: restMongoId,
          permissions: "both",
          isLoggedIn: true,
          userRole: "restaurant",
          profileData: res.user,
        });

        // Navigate to Workspace Selection page
        navigate({ to: "/auth/workspace", replace: true });
      } else {
        setErrorMsg(res.message || "Invalid credentials. Please check your email/mobile and password.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Invalid credentials. Please check your email/mobile and password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#2b2b2b] text-[#111111] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#d2d0c1] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,208,193,0.1),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#d2d0c1] block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d2d0c1] dark:text-slate-400 font-extrabold block mt-1">
              Member Access
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth/select-role"
            search={{ mode: "signup" }}
            className="text-xs font-extrabold text-[#111111] dark:text-slate-200 hover:text-[#d2d0c1] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-[#383838]/80 border border-border/60 shadow-xs cursor-pointer active:scale-95"
          >
            <span>Don't have an account? Get Started</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2.5 sd-fade-up">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#383838] text-[#111111] dark:text-[#d2d0c1] text-[11px] font-extrabold uppercase tracking-widest border border-[#E5E5E5]">
              <span>MEMBER ACCESS</span>
            </div>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-sm mx-auto">
              Sign in to continue your StockDine experience.
            </p>

            {/* 1-CLICK ROLE SWITCHER TAB BAR */}
            <div className="pt-2 max-w-md mx-auto">
              <div className="p-1 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] dark:border-[#404040] flex items-center gap-1">
                <Link
                  to="/auth/customer/login"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all text-center text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>CUSTOMER</span>
                </Link>

                <button
                  type="button"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all text-center bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md cursor-default flex items-center justify-center gap-1.5"
                >
                  <span>RESTAURANT PARTNER</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 dark:bg-[#222222]/80 backdrop-blur-xl border border-[#E5E5E5] dark:border-[#404040] p-8 sm:p-10 shadow-2xl space-y-6 sd-fade-up">
            {/* Title Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-full">
                RESTAURANT PARTNER SIGN IN
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Email Address / Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#737373] hover:text-[#111111] dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue as Restaurant</span>
                    <ArrowRight className="size-4 text-[#d2d0c1]" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#404040] text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span>Don't have a restaurant account?</span>
                <Link
                  to="/signup"
                  className="text-[#111111] dark:text-[#d2d0c1] font-extrabold hover:underline"
                >
                  Register Your Restaurant
                </Link>
              </div>
              <p className="text-[11px] text-muted-foreground/80 font-medium leading-tight max-w-xs mx-auto">
                Manage your restaurant, menu, tables, bookings, and live operations.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 pb-2 text-center text-[11px] text-[#737373] dark:text-slate-500 font-medium">
        © StockDine Inc. All rights reserved.
      </footer>
    </div>
  );
}
