import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, KeyRound, CheckCircle2, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/auth/customer/login")({
  head: () => ({
    meta: [
      { title: "Customer Sign In — StockDine" },
      { name: "description", content: "Sign in using your Email Address and Password." },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const navigate = useNavigate();
  const { setAuthSession } = useStockDineStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1 = Request, 2 = Reset
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter your Email Address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your Password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.customerLogin({ email: cleanEmail, password });
      setIsLoading(false);

      if (res && res.success && res.token) {
        const userRole = (res.role || res.user?.role || "customer").toLowerCase();
        if (userRole === "restaurant" || userRole === "admin" || userRole === "kitchen") {
          setErrorMsg("This account is registered as a Restaurant Partner. Please sign in as a Restaurant Partner.");
          return;
        }

        localStorage.setItem("stockdine_token", res.token);
        const userProf = res.user || {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          role: res.role || "customer",
        };

        setAuthSession({
          userEmail: cleanEmail,
          restaurantId: "",
          permissions: "both",
          isLoggedIn: true,
          userRole: res.role || "customer",
          profileData: userProf,
        });

        // Optionally fetch real profile from database
        try {
          const profRes: any = await api.auth.getProfile();
          if (profRes && profRes.success && (profRes.profile || profRes.user)) {
            const realProf = profRes.profile || profRes.user;
            setAuthSession({
              userEmail: realProf.email || cleanEmail,
              restaurantId: "",
              permissions: "both",
              isLoggedIn: true,
              userRole: realProf.role || "customer",
              profileData: realProf,
            });
          }
        } catch (pErr) {}

        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => {
          navigate({ to: "/customer", replace: true });
        }, 800);
      } else {
        setErrorMsg("Invalid email or password.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg("Invalid email or password.");
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setResetError("Please enter your Email Address.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email: cleanEmail });
      setResetLoading(false);
      if (res && res.success) {
        setResetSuccess(res.message || "Password reset token sent.");
        if (res.resetToken) {
          setResetTokenInput(res.resetToken);
          setResetSuccess(`Password reset token generated: ${res.resetToken}`);
        }
        setResetStep(2);
      } else {
        setResetError(res.message || "Failed to process request.");
      }
    } catch (err: any) {
      setResetLoading(false);
      setResetError(err.message || "Failed to process request.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetTokenInput.trim()) {
      setResetError("Please enter the Reset Token.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.auth.resetPassword({
        token: resetTokenInput.trim(),
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setResetLoading(false);

      if (res && res.success) {
        setResetSuccess("Password reset successfully! Please sign in below.");
        setTimeout(() => {
          setShowForgotPassword(false);
          setEmail(resetEmail);
          setResetStep(1);
          setResetTokenInput("");
          setNewPassword("");
          setConfirmNewPassword("");
        }, 1500);
      } else {
        setResetError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setResetLoading(false);
      setResetError(err.message || "Password reset failed. Invalid or expired token.");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextInputId?: string) => {
    if (e.key === "Enter") {
      if (nextInputId) {
        e.preventDefault();
        const nextElem = document.getElementById(nextInputId);
        if (nextElem) {
          nextElem.focus();
        }
      }
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
                <button
                  type="button"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all text-center bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md cursor-default"
                >
                  <span>CUSTOMER</span>
                </button>

                <Link
                  to="/auth/restaurant/login"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all text-center text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>RESTAURANT PARTNER</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 dark:bg-[#222222]/80 backdrop-blur-xl border border-[#E5E5E5] dark:border-[#404040] p-8 sm:p-10 shadow-2xl space-y-6 sd-fade-up">
            {/* Title Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-full">
                CUSTOMER SIGN IN
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email + Password Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, "login-password")}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(email);
                      setResetStep(1);
                      setResetError("");
                      setResetSuccess("");
                    }}
                    className="text-xs font-extrabold text-[#d2d0c1] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
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
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ShieldCheck className="size-4 text-[#d2d0c1]" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-end pt-2 border-t border-[#E5E5E5] dark:border-[#404040] text-xs font-extrabold">
              <Link
                to="/auth/customer/signup"
                className="text-[#111111] dark:text-[#d2d0c1] hover:underline"
              >
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#404040] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
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
                {resetStep === 1
                  ? "Enter your registered Email Address to receive a password reset token."
                  : "Enter your Reset Token and new Password below."}
              </p>
            </div>

            {resetError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-xs font-bold focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {resetLoading ? "Generating Reset Token..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-xs font-mono font-bold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    New Password (Min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-xs font-bold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-xs font-bold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] text-xs font-extrabold cursor-pointer border border-[#E5E5E5]"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-2/3 py-3 rounded-2xl bg-[#111111] dark:bg-[#d2d0c1] text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-4 pb-2 text-center text-[11px] text-[#737373] dark:text-slate-500 font-medium">
        © StockDine Inc. All rights reserved.
      </footer>
    </div>
  );
}
