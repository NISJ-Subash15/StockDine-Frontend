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
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#E77B49] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(231,123,73,0.1),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#60241E] dark:text-[#E77B49] block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#E77B49] dark:text-slate-400 font-extrabold block mt-1">
              Partner Sign In
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth/restaurant/signup"
            className="text-xs font-extrabold text-[#60241E] dark:text-slate-200 hover:text-[#E77B49] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60"
          >
            <span>Register Restaurant</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 dark:border-slate-800 p-8 sm:p-10 shadow-2xl space-y-6">
            {/* Title Header */}
            <div className="text-center space-y-2">
              <h1 className="font-serif italic text-3xl font-bold text-[#60241E] dark:text-slate-100">
                Restaurant Partner Sign In
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                Sign in to manage live stock, dishes, kitchen portal & admin analytics.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                  Email Address / Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-[#6B7280]" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/80 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-[#6B7280]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/80 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#6B7280] hover:text-[#E77B49]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue as Restaurant</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/auth/select-role"
                search={{ mode: "login" }}
                className="text-xs font-extrabold text-[#6B7280] hover:text-[#E77B49] transition-colors"
              >
                ← Back to Role Selection
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 pb-2 text-center text-[11px] text-[#6B7280] dark:text-slate-500 font-medium">
        © StockDine Inc. All rights reserved.
      </footer>
    </div>
  );
}
