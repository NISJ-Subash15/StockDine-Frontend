import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/auth/customer/signup")({
  head: () => ({
    meta: [
      { title: "Customer Sign Up — StockDine" },
      { name: "description", content: "Create your StockDine diner account using Email and Password." },
    ],
  }),
  component: CustomerSignupPage,
});

function CustomerSignupPage() {
  const navigate = useNavigate();
  const { setAuthSession } = useStockDineStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Full Name Validation
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Please enter your Full Name.");
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg("Full Name must be at least 2 characters long.");
      return;
    }

    // 2. Email Address Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter your Email Address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid Email Address (e.g. user@example.com).");
      return;
    }

    // 3. Mobile Number Validation
    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      setErrorMsg("Please enter your Mobile Number.");
      return;
    }

    // 4. Password Validation
    if (!password) {
      setErrorMsg("Please enter a Password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    // 5. Confirm Password Validation
    if (!confirmPassword) {
      setErrorMsg("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.customerSignup({
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password,
        confirmPassword,
      });

      setIsLoading(false);

      if (res && res.success && res.token) {
        localStorage.setItem("stockdine_token", res.token);
        const userProf = res.user || {
          name: cleanName,
          email: cleanEmail,
          mobile: cleanMobile,
          role: "customer",
        };

        setAuthSession({
          userEmail: cleanEmail,
          restaurantId: "",
          permissions: "both",
          isLoggedIn: true,
          userRole: "customer",
          profileData: userProf,
        });

        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate({ to: "/customer", replace: true });
        }, 800);
      } else {
        setErrorMsg(res.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.message || "";
      if (errMsg.toLowerCase().includes("already exists") || errMsg.includes("409")) {
        setErrorMsg("An account with this email already exists. Please sign in.");
      } else {
        setErrorMsg(errMsg || "Registration failed. Please check your details and try again.");
      }
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
              Customer Registration
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth/customer/login"
            className="text-xs font-extrabold text-[#111111] dark:text-slate-200 hover:text-[#d2d0c1] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-[#383838]/80 border border-border/60 cursor-pointer"
          >
            <span>Already have an account? Sign In</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-white/80 dark:bg-[#222222]/80 backdrop-blur-xl border border-[#E5E5E5] dark:border-[#404040] p-8 sm:p-10 shadow-2xl space-y-6">
            {/* Title Header */}
            <div className="text-center space-y-2">
              <h1 className="font-serif italic text-3xl font-bold text-[#111111] dark:text-slate-100">
                Create Account
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Sign up to reserve tables, hold live menu dishes, and manage dining bookings.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-extrabold flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Registration Form (noValidate disables silent browser blocking) */}
            <form onSubmit={handleSignup} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, "signup-email")}
                    placeholder="Subash Nethaji"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, "signup-mobile")}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="signup-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, "signup-password")}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Password <span className="text-rose-500">* (Min 6 chars)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleInputKeyDown(e, "signup-confirm-password")}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#111111] dark:text-slate-300 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-[#737373]" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/80 border border-[#E5E5E5] text-xs font-bold text-[#111111] dark:text-slate-100 focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-[#737373] hover:text-[#111111] dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ShieldCheck className="size-4 text-[#d2d0c1]" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#404040] text-xs font-extrabold">
              <Link
                to="/auth/select-role"
                search={{ mode: "signup" }}
                className="text-muted-foreground hover:text-[#111111] dark:hover:text-[#d2d0c1] transition-colors"
              >
                ← Role Selection
              </Link>
              <Link
                to="/auth/customer/login"
                className="text-[#111111] dark:text-[#d2d0c1] hover:underline"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-4 pb-2 text-center text-[11px] text-[#737373] dark:text-slate-500 font-medium">
        © StockDine Inc. All rights reserved.
      </footer>
    </div>
  );
}
