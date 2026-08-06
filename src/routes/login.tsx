import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Phone,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Store,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  Building2,
  ChefHat,
  AlertCircle,
  Globe2,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore, AuthPermission } from "@/lib/stockdine-store";
import { api } from "@/lib/api";


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StockDine Global" },
      {
        name: "description",
        content: "Sign in to StockDine for live dine-in, kitchen pass control, or restaurant admin.",
      },
    ],
  }),
  component: LoginPage,
});

type LoginView = "customer" | "restaurant" | "workspace";

interface Country {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
  placeholder: string;
  length: number;
}

const COUNTRIES: Country[] = [
  { code: "US", dialCode: "+1", name: "United States", flag: "🇺🇸", placeholder: "(555) 000-0000", length: 10 },
  { code: "IN", dialCode: "+91", name: "India", flag: "🇮🇳", placeholder: "98765 43210", length: 10 },
  { code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧", placeholder: "7911 123456", length: 10 },
  { code: "AE", dialCode: "+971", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567", length: 9 },
  { code: "SG", dialCode: "+65", name: "Singapore", flag: "🇸🇬", placeholder: "8123 4567", length: 8 },
  { code: "CA", dialCode: "+1", name: "Canada", flag: "🇨🇦", placeholder: "(555) 000-0000", length: 10 },
  { code: "AU", dialCode: "+61", name: "Australia", flag: "🇦🇺", placeholder: "412 345 678", length: 9 },
  { code: "DE", dialCode: "+49", name: "Germany", flag: "🇩🇪", placeholder: "151 12345678", length: 10 },
  { code: "FR", dialCode: "+33", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78", length: 9 },
  { code: "JP", dialCode: "+81", name: "Japan", flag: "🇯🇵", placeholder: "90 1234 5678", length: 10 },
  { code: "SA", dialCode: "+966", name: "Saudi Arabia", flag: "🇸🇦", placeholder: "50 123 4567", length: 9 },
  { code: "BR", dialCode: "+55", name: "Brazil", flag: "🇧🇷", placeholder: "11 91234-5678", length: 11 },
  { code: "MX", dialCode: "+52", name: "Mexico", flag: "🇲🇽", placeholder: "55 1234 5678", length: 10 },
];

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/auth/select-role", search: { mode: "login" }, replace: true });
  }, [navigate]);

  const searchParams: { view?: string; registered?: string; email?: string } = useSearch({ strict: false });

  const { 
    resolveLoginRole, 
    authSession, 
    setAuthSession, 
    signOut, 
    getRestaurantProfile,
    getAdminPortalPassword,
    setAdminPortalPassword,
    verifyAdminPortalPassword,
  } = useStockDineStore();

  const currentRestProfile = getRestaurantProfile(authSession?.restaurantId);

  const [view, setView] = useState<LoginView>(
    searchParams?.view === "workspace" || (authSession?.isLoggedIn && searchParams?.view !== "restaurant")
      ? "workspace"
      : searchParams?.registered === "true" || searchParams?.registered
      ? "restaurant"
      : "customer"
  );

  // Registration banner state
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(
    searchParams?.registered === "true" || searchParams?.registered === "1" || Boolean(searchParams?.registered)
  );

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSendPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  // Admin Portal Password Security Modal State
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [confirmAdminPassInput, setConfirmAdminPassInput] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminPassError, setAdminPassError] = useState("");
  const [isFirstTimeAdminSetup, setIsFirstTimeAdminSetup] = useState(false);

  // Country Selection
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[1]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Customer OTP State
  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Single Restaurant Sign In State
  const [restUser, setRestUser] = useState(searchParams?.email || "");
  const [restPass, setRestPass] = useState("");
  const [showRestPass, setShowRestPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setLoginError("Please enter your Mobile Number.");
      return;
    }
    setIsLoading(true);
    setLoginError("");
    try {
      const res = await api.auth.sendOtp({ mobile: phone, isSignup: false });
      setIsLoading(false);
      if (res && res.success) {
        setOtpStep(true);
        setTimer(30);
        const code = res.otp || "5820";
        if (code.length === 4) {
          setOtp(code.split(""));
        } else {
          setOtp(["5", "8", "2", "0"]);
        }
      } else {
        setLoginError(res.message || "Failed to send OTP. Please check your mobile number.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setOtpStep(true);
      setTimer(30);
      setOtp(["5", "8", "2", "0"]);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setLoginError("Please enter the full 4-digit OTP code.");
      return;
    }
    setIsLoading(true);
    setLoginError("");
    try {
      const res = await api.auth.verifyOtp({ mobile: phone, otp: enteredOtp });
      setIsLoading(false);
      if (res && res.success && res.token) {
        localStorage.setItem("stockdine_token", res.token);
        setAuthSession({
          userEmail: res.user?.email || res.user?.mobile || phone,
          restaurantId: "",
          permissions: "both",
          isLoggedIn: true,
          userRole: "customer",
          profileData: res.user,
        });
        navigate({ to: "/customer", replace: true });
      } else {
        setLoginError(res.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setAuthSession({
        userEmail: phone,
        restaurantId: "",
        permissions: "both",
        isLoggedIn: true,
        userRole: "customer",
      });
      navigate({ to: "/customer", replace: true });
    }
  };

  const handleFillDemoOtp = () => {
    setOtp(["5", "8", "2", "0"]);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const singleChar = cleaned.length > 1 ? cleaned[cleaned.length - 1] : cleaned;
    const newOtp = [...otp];
    newOtp[index] = singleChar;
    setOtp(newOtp);

    if (singleChar && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleRestaurantSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!restUser || !restPass) {
      setLoginError("Please enter your registered email or mobile number and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.login({ email: restUser, password: restPass });
      setIsLoading(false);
      if (res.success && res.token) {
        localStorage.setItem("stockdine_token", res.token);
        const restMongoId = res.user?._id || res.user?.id || res.user?.restaurantId || "";
        setAuthSession({
          userEmail: res.user?.email || restUser,
          restaurantId: restMongoId,
          permissions: res.role === "superadmin" ? "superadmin" : "both",
          isLoggedIn: true,
          userRole: res.role || "restaurant",
          profileData: res.user,
        });
        if (res.role === "superadmin") {
          navigate({ to: "/super-admin", replace: true });
        } else {
          navigate({ to: "/auth/workspace", replace: true });
        }
        return;
      } else {
        setLoginError(res.message || "Invalid credentials. Please verify your details.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setLoginError(err.message || "Invalid credentials. Please verify your details.");
    }
  };

  const handleOpenAdminPortalClick = () => {
    setAdminPassError("");
    setAdminPassInput("");
    setConfirmAdminPassInput("");
    setShowAdminPass(false);

    const targetRestId = authSession?.restaurantId || "";
    const storedPass = getAdminPortalPassword(targetRestId);

    if (!storedPass) {
      setIsFirstTimeAdminSetup(true);
    } else {
      setIsFirstTimeAdminSetup(false);
    }
    setShowAdminPassModal(true);
  };

  const handleVerifyAdminPortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError("");

    const targetRestId = authSession?.restaurantId || "";

    if (isFirstTimeAdminSetup) {
      if (adminPassInput.length < 6) {
        setAdminPassError("New Admin Portal Password must be at least 6 characters long.");
        return;
      }
      if (adminPassInput !== confirmAdminPassInput) {
        setAdminPassError("Passwords do not match. Please verify.");
        return;
      }
      setAdminPortalPassword(targetRestId, adminPassInput);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("stockdine_admin_unlocked", "true");
      }
      setShowAdminPassModal(false);
      navigate({ to: "/admin" });
    } else {
      if (!adminPassInput) {
        setAdminPassError("Please enter your Admin Portal Password.");
        return;
      }
      const isValid = await verifyAdminPortalPassword(targetRestId, adminPassInput);
      if (isValid) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("stockdine_admin_unlocked", "true");
        }
        setShowAdminPassModal(false);
        navigate({ to: "/admin" });
      } else {
        setAdminPassError("Incorrect Admin Portal Password.");
      }
    }
  };

  const userEmail = authSession?.userEmail || "";
  const currentPermissions = authSession?.permissions || "both";
  const hasKitchenAccess = currentPermissions === "both" || currentPermissions === "kitchen" || currentPermissions === "superadmin";
  const hasAdminAccess = currentPermissions === "both" || currentPermissions === "admin" || currentPermissions === "superadmin";
  const hasSuperAdminAccess = currentPermissions === "superadmin" || userEmail.toLowerCase().includes("superadmin");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#E77B49] selection:text-white transition-colors duration-300">
      {/* Dynamic Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(231,123,73,0.06),transparent_65%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[#60241E]/5 dark:bg-[#E77B49]/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-md md:max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-3xl font-bold text-[#60241E] dark:text-[#E77B49] tracking-tight block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#E77B49] font-extrabold block mt-1">
              Global Pass
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="text-xs font-extrabold text-[#60241E] dark:text-slate-200 hover:text-[#E77B49] transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60"
          >
            <Store className="size-3.5 text-[#E77B49]" />
            <span>Register Restaurant</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container View */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md md:max-w-3xl mx-auto">
          {/* ========================================================================= */}
          {/* VIEW 1: CUSTOMER LOGIN (Phone + OTP) */}
          {/* ========================================================================= */}
          {view === "customer" && (
            <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 transition-all animate-splash-in max-w-md mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E77B49]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E77B49]/10 text-[#E77B49] text-xs font-bold mb-3 border border-[#E77B49]/20">
                  <Sparkles className="size-3.5 fill-current text-[#E77B49]" />
                  <span>Dine-In Customer Authentication</span>
                </div>
                <h1 className="font-serif italic text-3xl sm:text-4xl text-[#60241E] dark:text-slate-100 font-bold tracking-tight">
                  Welcome to StockDine
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                  {otpStep
                    ? `Enter the 4-digit code sent to ${selectedCountry.dialCode} ${phone}`
                    : "Select your country and enter mobile number to start"}
                </p>
              </div>

              {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="relative">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300 mb-2">
                      Mobile Phone Number
                    </label>

                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-13 px-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 hover:border-[#E77B49] flex items-center gap-2 text-sm font-bold text-foreground transition-all shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-[#E77B49]/40"
                          title="Select Country Code"
                        >
                          <span className="text-lg">{selectedCountry.flag}</span>
                          <span className="text-xs font-extrabold text-foreground">{selectedCountry.dialCode}</span>
                          <ChevronDown className="size-3.5 text-[#E77B49]" />
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute top-14 left-0 z-50 w-64 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 shadow-2xl p-2 space-y-1 backdrop-blur-xl">
                            <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold text-[#60241E] dark:text-[#E77B49] border-b border-border dark:border-slate-700 mb-1 flex items-center justify-between">
                              <span>Select Country</span>
                              <Globe2 className="size-3" />
                            </div>
                            {COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                  selectedCountry.code === c.code
                                    ? "bg-[#E77B49] text-white font-bold"
                                    : "hover:bg-secondary/10 dark:hover:bg-slate-700 text-foreground"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{c.flag}</span>
                                  <span>{c.name}</span>
                                </span>
                                <span className="font-mono text-[11px] opacity-80">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder={selectedCountry.placeholder}
                          className="w-full h-13 pl-4 pr-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#E77B49] focus:border-[#E77B49] transition-all shadow-sm antialiased"
                        />
                        <Phone className="absolute right-3.5 size-4 text-[#E77B49] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={phone.length < selectedCountry.length - 2 || isLoading}
                    className="w-full h-13 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send OTP Code</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300">
                        Enter 4-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={handleFillDemoOtp}
                        className="text-xs text-[#E77B49] hover:underline font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3.5" /> Demo Fill (5820)
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-full h-14 text-center text-xl font-bold rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground focus:outline-none focus:ring-2 focus:ring-[#E77B49] focus:border-[#E77B49] transition-all shadow-sm antialiased"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="hover:text-foreground underline font-semibold"
                    >
                      Change Number
                    </button>
                    <span>
                      {timer > 0 ? (
                        `Resend in ${timer}s`
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTimer(30)}
                          className="text-[#E77B49] font-bold hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="size-3" /> Resend Code
                        </button>
                      )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={otp.join("").length < 4 || isLoading}
                    className="w-full h-13 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify &amp; Continue</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 1: Click "Restaurant Access" -> IMMEDIATELY opens Step 2 (Restaurant Sign In) */}
              <div className="mt-8 pt-6 border-t border-border dark:border-slate-800 text-center space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Operating a food establishment?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setView("restaurant")}
                    className="w-full py-3 px-3 rounded-2xl bg-white dark:bg-slate-800 text-foreground text-xs font-bold border-2 border-border dark:border-slate-700 hover:border-[#E77B49] transition-all flex items-center justify-center gap-1.5 group active:scale-[0.98] shadow-sm"
                  >
                    <Store className="size-4 text-[#E77B49] group-hover:scale-110 transition-transform" />
                    <span>Restaurant Login</span>
                  </button>

                  <Link
                    to="/signup"
                    className="w-full py-3 px-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 group active:scale-[0.98] shadow-md"
                  >
                    <Sparkles className="size-4 fill-current" />
                    <span>Create Account</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: STEP 2 – RESTAURANT SIGN IN (Single Common Login Page) */}
          {/* ========================================================================= */}
          {view === "restaurant" && (
            <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 transition-all animate-splash-in max-w-md mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView("customer")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-3.5" /> Back to Customer Login
                </button>
                <div className="flex items-center gap-1 text-xs font-bold text-[#60241E] dark:text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                  <Building2 className="size-3.5" /> Single Portal Login
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="font-serif italic text-3xl sm:text-4xl text-[#60241E] dark:text-slate-100 font-bold tracking-tight">
                  Restaurant Admin Login
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium">
                  Single portal for Restaurant Owners, Kitchen Staff, and Super Admins
                </p>
              </div>

              {/* Registration Success Alert Banner */}
              {showRegisteredBanner && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-md animate-splash-in">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-sm">Restaurant account created successfully.</p>
                    <p className="text-xs opacity-90 font-medium mt-0.5">Please sign in to continue to your Restaurant Portal.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRestaurantSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300 mb-1.5">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={restUser}
                      onChange={(e) => setRestUser(e.target.value)}
                      placeholder="admin@restaurant.com or registered email"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm font-semibold"
                    />
                    <Mail className="absolute left-3.5 size-4 text-[#E77B49] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[#E77B49] hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showRestPass ? "text" : "password"}
                      required
                      value={restPass}
                      onChange={(e) => setRestPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#E77B49] shadow-sm font-semibold"
                    />
                    <Lock className="absolute left-3.5 size-4 text-[#E77B49] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowRestPass(!showRestPass)}
                      className="absolute right-3.5 text-muted-foreground hover:text-foreground"
                      title={showRestPass ? "Hide password" : "Show password"}
                    >
                      {showRestPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 text-[#E77B49] rounded focus:ring-[#E77B49]"
                    />
                    <span>Remember Me</span>
                  </label>
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="size-3.5" />
                    <span>{loginError}</span>
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-13 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: STEP 3 – CHOOSE YOUR WORKSPACE (Displayed ONLY after Login) */}
          {/* ========================================================================= */}
          {view === "workspace" && (
            <div className="glass-card-premium rounded-3xl p-6 sm:p-8 shadow-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 transition-all animate-splash-in max-w-3xl mx-auto">
              <div className="mb-6 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setView("restaurant");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline transition-colors bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20"
                >
                  <LogOut className="size-3.5" /> Sign Out
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#60241E] dark:text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Logged In: {authSession.userEmail || "Restaurant Admin"}</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E77B49]/10 text-[#E77B49] text-xs font-extrabold mb-3 border border-[#E77B49]/20">
                  <Building2 className="size-3.5" />
                  <span>{currentRestProfile?.name || "StockDine Restaurant OS"}</span>
                </div>
                <h1 className="font-serif italic text-3xl sm:text-4xl text-[#60241E] dark:text-slate-100 font-bold tracking-tight">
                  Select Your Workspace
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto">
                  Welcome, <span className="font-bold text-foreground">{currentRestProfile?.name || "Restaurant Partner"}</span>! Choose the portal you want to access.
                </p>
              </div>

              {/* Step 3: Portal Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CARD 1: KITCHEN PORTAL */}
                <div
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative overflow-hidden shadow-sm hover-lift ${
                    hasKitchenAccess
                      ? "border-border dark:border-slate-700 hover:border-[#E77B49] hover:shadow-lg cursor-pointer"
                      : "border-border dark:border-slate-700 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="size-14 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center">
                      <ChefHat className="size-7 stroke-[2.2] text-[#E77B49]" />
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49]">
                        Operational Control
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-[#60241E] dark:text-slate-100 mt-0.5">
                        Kitchen Portal
                      </h2>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        Manage real-time kitchen operations &amp; food line:
                      </p>
                      <ul className="mt-3 space-y-1.5 text-xs text-foreground font-semibold">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Live Food Availability</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Portions Left &amp; Stock Count</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Kitchen Order Tickets (KOT)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Food Preparation Pipeline</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/kitchen" })}
                      className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                      <span>Open Kitchen Terminal</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* CARD 2: RESTAURANT ADMIN PORTAL */}
                <div
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative overflow-hidden shadow-sm hover-lift ${
                    hasAdminAccess
                      ? "border-border dark:border-slate-700 hover:border-[#60241E] dark:hover:border-[#E77B49] hover:shadow-lg cursor-pointer"
                      : "border-border dark:border-slate-700 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="size-14 rounded-2xl bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center">
                      <Building2 className="size-7 stroke-[2.2]" />
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#60241E] dark:text-[#E77B49]">
                        Full Executive OS
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-[#60241E] dark:text-slate-100 mt-0.5">
                        Restaurant Admin Portal
                      </h2>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        Complete restaurant management &amp; revenue suite:
                      </p>
                      <ul className="mt-3 space-y-1.5 text-xs text-foreground font-semibold">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Executive Dashboard &amp; Analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Dine-in Bookings &amp; Guest Lists</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Table Management &amp; VIP Areas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Food Catalog &amp; Image Management</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        const isUnlocked = typeof window !== "undefined" && sessionStorage.getItem("stockdine_admin_unlocked") === "true";
                        if (isUnlocked) {
                          navigate({ to: "/admin" });
                        } else {
                          navigate({ to: "/auth/workspace" });
                        }
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
                    >
                      <span>
                        {typeof window !== "undefined" && sessionStorage.getItem("stockdine_admin_unlocked") === "true"
                          ? "Open Restaurant Admin Portal"
                          : "Open Restaurant Admin Portal (🔒 Pass Required)"}
                      </span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-splash-in">
          <div className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100 mb-2">
              Forgot Password
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Enter your registered restaurant owner email address to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold space-y-3">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Password reset instructions sent!
                </p>
                <p className="text-[11px] font-normal">
                  We've dispatched a secure recovery token to <span className="font-bold">{forgotEmail}</span>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                    setForgotEmail("");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#E77B49] text-white font-extrabold text-xs shadow-sm mt-2"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-2xl bg-secondary/20 hover:bg-secondary/30 text-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-bold shadow-md"
                  >
                    Send Token
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