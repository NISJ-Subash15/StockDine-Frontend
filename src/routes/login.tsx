import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockDine" },
      {
        name: "description",
        content: "Sign in to continue to StockDine live dining, kitchen, or restaurant admin.",
      },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const searchParams: { registered?: string; email?: string } = useSearch({ strict: false });
  const { setAuthSession } = useStockDineStore();

  const [identifier, setIdentifier] = useState(searchParams?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // Registration banner state
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(
    searchParams?.registered === "true" || searchParams?.registered === "1" || Boolean(searchParams?.registered)
  );

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotTokenInput, setForgotTokenInput] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setLoginError("Please enter your Email Address or Mobile Number.");
      return;
    }
    if (!cleanPassword) {
      setLoginError("Please enter your Password.");
      return;
    }

    setIsLoading(true);

    try {
      const res: any = await api.auth.login({ email: cleanIdentifier, password: cleanPassword });
      setIsLoading(false);

      if (res && res.success && res.token) {
        localStorage.setItem("stockdine_token", res.token);
        const rawRole = (res.role || res.user?.role || "customer").toLowerCase();

        setLoginSuccess("Authentication successful! Redirecting...");

        // ROLE 1: Super Admin
        if (rawRole === "super_admin" || rawRole === "superadmin") {
          setAuthSession({
            userEmail: res.user?.email || cleanIdentifier,
            restaurantId: "HQ-SUPERADMIN",
            permissions: "superadmin",
            isLoggedIn: true,
            userRole: "superadmin",
            profileData: res.user,
          });

          setTimeout(() => {
            navigate({ to: "/stockdine-superadmin", replace: true });
          }, 600);
          return;
        }

        // ROLE 2: Customer / User
        if (rawRole === "customer" || rawRole === "user") {
          setAuthSession({
            userEmail: res.user?.email || cleanIdentifier,
            restaurantId: "",
            permissions: "both",
            isLoggedIn: true,
            userRole: "customer",
            profileData: res.user,
          });

          setTimeout(() => {
            navigate({ to: "/customer", replace: true });
          }, 600);
          return;
        }

        // ROLE 3: Kitchen Staff
        if (rawRole === "kitchen") {
          const restMongoId = res.user?.restaurantId || res.user?._id || "";
          setAuthSession({
            userEmail: res.user?.email || cleanIdentifier,
            restaurantId: restMongoId,
            permissions: "kitchen",
            isLoggedIn: true,
            userRole: "kitchen",
            profileData: res.user,
          });

          setTimeout(() => {
            navigate({ to: "/kitchen", replace: true });
          }, 600);
          return;
        }

        // ROLE 4: Restaurant Admin / Restaurant Account
        const restMongoId = res.user?._id || res.user?.id || res.user?.restaurantId || "";
        const workspaces = res.workspaces || ["admin", "kitchen"];

        setAuthSession({
          userEmail: res.user?.email || cleanIdentifier,
          restaurantId: restMongoId,
          permissions: "both",
          isLoggedIn: true,
          userRole: "restaurant",
          profileData: res.user,
        });

        setTimeout(() => {
          if (workspaces && workspaces.length > 1) {
            navigate({ to: "/auth/workspace", replace: true });
          } else if (workspaces && workspaces.includes("kitchen")) {
            navigate({ to: "/kitchen", replace: true });
          } else {
            navigate({ to: "/admin", replace: true });
          }
        }, 600);
      } else {
        setLoginError(res.message || "Invalid email or password.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setLoginError(err.message || "Invalid email or password.");
    }
  };

  const handleRequestForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccessMsg("");

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setForgotError("Please enter your Email Address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res: any = await api.auth.forgotPassword({ email: cleanEmail });
      setForgotLoading(false);
      if (res && res.success) {
        setForgotSuccessMsg(res.message || "Password reset token generated.");
        if (res.resetToken) {
          setForgotTokenInput(res.resetToken);
          setForgotSuccessMsg(`Reset token generated: ${res.resetToken}`);
        }
        setForgotStep(2);
      } else {
        setForgotError(res.message || "Failed to process password reset.");
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError(err.message || "Failed to process password reset.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccessMsg("");

    if (!forgotTokenInput.trim()) {
      setForgotError("Please enter the Reset Token.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      const res: any = await api.auth.resetPassword({
        token: forgotTokenInput.trim(),
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
      });
      setForgotLoading(false);

      if (res && res.success) {
        setForgotSuccessMsg("Password reset successfully! You can now sign in.");
        setTimeout(() => {
          setShowForgotModal(false);
          setIdentifier(forgotEmail);
          setForgotStep(1);
          setForgotTokenInput("");
          setForgotNewPassword("");
          setForgotConfirmPassword("");
        }, 1200);
      } else {
        setForgotError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#d2d0c1] selection:text-white transition-colors duration-300">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,208,193,0.08),transparent_65%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-md md:max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-3xl font-bold text-[#111111] dark:text-[#d2d0c1] tracking-tight block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#d2d0c1] font-extrabold block mt-1">
              Platform Access
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth/select-role"
            search={{ mode: "signup" }}
            className="text-xs font-extrabold text-[#111111] dark:text-slate-200 hover:text-[#d2d0c1] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-[#383838]/80 border border-border/60 shadow-xs active:scale-95"
          >
            <span>Don't have an account? Create Account</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2.5 sd-fade-up">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F5F5F5] text-[#111111] dark:bg-[#d2d0c1]/20 dark:text-[#d2d0c1] text-[11px] font-extrabold uppercase tracking-widest border border-[#E5E5E5]">
              <Sparkles className="size-3.5 text-[#d2d0c1]" />
              <span>STOCKDINE SIGN IN</span>
            </div>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-sm mx-auto">
              Sign in to continue to StockDine
            </p>
          </div>

          {/* Unified Sign In Card */}
          <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E5E5E5] dark:border-[#404040] bg-card dark:bg-[#222222]/90 transition-all sd-fade-up max-w-md mx-auto space-y-5 relative">
            {showRegisteredBanner && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-extrabold block">Account created successfully!</span>
                  <span className="text-[11px] opacity-90 block font-normal">Sign in below using your credentials.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisteredBanner(false)}
                  className="text-emerald-700 dark:text-emerald-300 hover:opacity-75"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2 animate-shake">
                <AlertCircle className="size-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                  Email Address / Mobile
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="user@example.com or Mobile Number"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-[#d2d0c1] shadow-sm font-semibold transition-all"
                  />
                  <Mail className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotEmail(identifier);
                      setForgotStep(1);
                      setForgotError("");
                      setForgotSuccessMsg("");
                    }}
                    className="text-xs text-[#d2d0c1] hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-[#d2d0c1] shadow-sm font-semibold transition-all"
                  />
                  <Lock className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer sd-hover-lift disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="size-4 text-[#d2d0c1]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#404040] text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span>Don't have an account?</span>
                <Link
                  to="/auth/select-role"
                  search={{ mode: "signup" }}
                  className="text-[#111111] dark:text-[#d2d0c1] font-extrabold hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-splash-in">
          <div className="bg-card dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#404040] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-[#383838] transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="size-12 rounded-2xl bg-[#F5F5F5] dark:bg-[#d2d0c1]/15 text-[#111111] dark:text-[#d2d0c1] flex items-center justify-center mx-auto border border-[#E5E5E5]">
              <KeyRound className="size-6 text-[#d2d0c1]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif italic font-bold text-2xl text-foreground">
                Reset Password
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {forgotStep === 1
                  ? "Enter your registered Email Address to receive password reset instructions."
                  : "Enter your Reset Token and new Password below."}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-2xl bg-secondary/20 hover:bg-secondary/30 text-foreground text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {forgotLoading ? "Sending..." : "Send Token"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotTokenInput}
                    onChange={(e) => setForgotTokenInput(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] text-xs font-extrabold cursor-pointer border border-[#E5E5E5]"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-2/3 py-3 rounded-2xl bg-[#111111] dark:bg-[#d2d0c1] text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground font-medium">
        <p>© 2026 StockDine. All rights reserved. Powered by Live Dine-in Intelligence.</p>
      </footer>
    </div>
  );
}