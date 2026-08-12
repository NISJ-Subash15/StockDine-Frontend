import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  Clock,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Store,
  Compass,
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Users,
  Grid,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";


export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Restaurant Registration — StockDine Global" },
      {
        name: "description",
        content: "Register your restaurant on StockDine to enable live stock management, table reservations, and kitchen control.",
      },
    ],
  }),
  component: SignupPage,
});

const PRESET_LOGOS = [
  { label: "Bistro & Fine Dining", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=300" },
  { label: "Italian & Pizza", url: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&q=80&w=300" },
  { label: "Cafe & Coffee", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=300" },
  { label: "Asian & Sushi", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300" },
];

const PRESET_COVERS = [
  { label: "Luxury Dining Room", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200" },
  { label: "Warm Wood & Lights", url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200" },
  { label: "Modern Outdoor Terrace", url: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=1200" },
  { label: "Rustic Brick Bistro", url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200" },
];

const CUISINE_OPTIONS = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Continental",
  "Japanese",
  "Thai",
  "Mediterranean",
  "American",
  "BBQ & Grill",
  "Bakery & Desserts",
  "Seafood",
];

const RESTAURANT_TYPES = [
  "Fine Dining",
  "Casual Dining",
  "Fast Food / QSR",
  "Cafe & Bakery",
  "Bistro & Bar",
  "Family Restaurant",
  "Buffet Restaurant",
];

function SignupPage() {
  const navigate = useNavigate();



  const { registerRestaurantAdmin, checkEmailExists, checkRestaurantExists, setAuthSession } = useStockDineStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Owner Info
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Restaurant Info
  const [restaurantName, setRestaurantName] = useState("");
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [coverImageUrl, setCoverImageUrl] = useState(PRESET_COVERS[0].url);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [zipCode, setZipCode] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);

  // Step 3: Business Details
  const [restaurantType, setRestaurantType] = useState("Fine Dining");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(["Italian", "Continental"]);
  const [openingHours, setOpeningHours] = useState("09:00 AM");
  const [closingHours, setClosingHours] = useState("11:00 PM");
  const [numberOfTables, setNumberOfTables] = useState(12);
  const [seatingCapacity, setSeatingCapacity] = useState(48);

  // Step 4: Confirmation
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Validation state
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isPhoneValid = (p: string) => p.replace(/\D/g, "").length >= 7;
  const isPasswordStrong = password.length >= 6;

  const toggleCuisine = (c: string) => {
    if (selectedCuisines.includes(c)) {
      if (selectedCuisines.length > 1) {
        setSelectedCuisines(selectedCuisines.filter((item) => item !== c));
      }
    } else {
      setSelectedCuisines([...selectedCuisines, c]);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!ownerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!isEmailValid(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!isPhoneValid(phone)) {
      setFormError("Please enter a valid mobile phone number.");
      return;
    }
    if (!isPasswordStrong) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Password and Confirm Password do not match.");
      return;
    }

    if (checkEmailExists(email)) {
      setFormError("An account with this email address is already registered. Please sign in instead.");
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!restaurantName.trim()) {
      setFormError("Please enter your restaurant name.");
      return;
    }
    if (checkRestaurantExists(restaurantName)) {
      setFormError("A restaurant with this name is already registered.");
      return;
    }
    if (!address.trim()) {
      setFormError("Please enter the restaurant address.");
      return;
    }
    if (!city.trim()) {
      setFormError("Please enter the city.");
      return;
    }
    if (!zipCode.trim()) {
      setFormError("Please enter the PIN/ZIP code.");
      return;
    }

    setStep(3);
  };

  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (selectedCuisines.length === 0) {
      setFormError("Please select at least one cuisine type.");
      return;
    }
    if (numberOfTables < 1) {
      setFormError("Number of tables must be at least 1.");
      return;
    }
    if (seatingCapacity < 1) {
      setFormError("Seating capacity must be at least 1.");
      return;
    }

    setStep(4);
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!acceptTerms || !acceptPrivacy) {
      setFormError("You must accept the Terms & Conditions and Privacy Policy to register.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${address}, ${city}, ${state}, ${country} ${zipCode}`;
      const apiRes: any = await api.auth.restaurantSignup({
        restaurantName,
        ownerName,
        email,
        mobileNumber: phone,
        password,
        address: fullAddress,
        latitude,
        longitude,
        cuisine: selectedCuisines.join(", "),
      });

      setIsSubmitting(false);
      if (apiRes.success) {
        if (apiRes.token) {
          localStorage.setItem("stockdine_token", apiRes.token);
        }

        const restId = apiRes.restaurant?._id || apiRes.restaurant?.id || apiRes.restaurant?.restaurantId || "REST-NEW";
        setAuthSession({
          userEmail: apiRes.restaurant?.email || email,
          restaurantId: restId,
          permissions: "both",
          isLoggedIn: true,
          userRole: "restaurant",
          profileData: apiRes.restaurant,
        });

        // Automatically navigate to Workspace Selection page
        navigate({
          to: "/auth/workspace",
        });
        return;
      } else {
        setFormError(apiRes.message || "Registration failed.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || "Registration failed. Please check your inputs.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#d2d0c1] selection:text-white transition-colors duration-300">
      {/* Background Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,208,193,0.08),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-3xl font-bold text-[#111111] dark:text-[#d2d0c1] tracking-tight block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#d2d0c1] font-extrabold block mt-1">
              Partner Registration
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-extrabold text-[#111111] dark:text-slate-200 hover:text-[#d2d0c1] transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 dark:bg-[#383838]/80 border border-border/60"
          >
            <span>Existing Owner? Sign In</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-3xl mx-auto">
          <div className="glass-card-premium rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#E5E5E5] bg-card dark:bg-[#222222]/90 dark:border-[#404040] transition-all animate-splash-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d2d0c1]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Stepper Header Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#d2d0c1]/20 text-[#111111] dark:text-[#d2d0c1] text-xs font-bold border border-[#E5E5E5]">
                  <Sparkles className="size-3.5 fill-current text-[#d2d0c1]" />
                  <span>Step {step} of 4 — {step === 1 ? "Owner Details" : step === 2 ? "Restaurant Profile" : step === 3 ? "Business Specs" : "Account Setup"}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%"} Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-secondary/30 dark:bg-[#383838] overflow-hidden">
                <div
                  className="h-full bg-[#111111] dark:bg-[#d2d0c1] transition-all duration-500 rounded-full"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>

              {/* Step Badges */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                {[
                  { num: 1, label: "Owner Info" },
                  { num: 2, label: "Restaurant" },
                  { num: 3, label: "Business" },
                  { num: 4, label: "Confirm" },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    disabled={s.num > step}
                    onClick={() => setStep(s.num as any)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      step === s.num
                        ? "bg-[#111111] dark:bg-[#d2d0c1] text-white shadow-md"
                        : step > s.num
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-secondary/10 dark:bg-[#383838]/40 text-muted-foreground opacity-60"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <span>{s.num}.</span>
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message display */}
            {formError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: OWNER INFORMATION */}
            {/* ========================================================================= */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-5">
                <div className="text-center sm:text-left mb-6">
                  <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
                    Owner & Admin Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                    Enter your personal account details as the restaurant owner or primary administrator.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Owner Full Name *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Chef Marcus Vance"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <User className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marcus@heritagekitchen.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Mail className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 987-6543 or +91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                    />
                    <Phone className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Password *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Lock className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Lock className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {password && (
                  <div className="p-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-xs font-semibold flex items-center justify-between">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span
                      className={`font-extrabold ${
                        password.length >= 8
                          ? "text-emerald-600 dark:text-emerald-400"
                          : password.length >= 6
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {password.length >= 8 ? "Strong (Secure)" : password.length >= 6 ? "Medium" : "Weak (Min 6 chars)"}
                    </span>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 h-13 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Restaurant Profile</span>
                    <ArrowRight className="size-4 text-[#d2d0c1]" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: RESTAURANT INFORMATION */}
            {/* ========================================================================= */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="space-y-5">
                <div className="text-center sm:text-left mb-6">
                  <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
                    Restaurant Details
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                    Set up your restaurant brand, location, and visual assets.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                    Restaurant / Venue Name *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Royal Heritage Spice & Grill"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                    />
                    <Store className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                  </div>
                </div>

                {/* Cover Banner Preset */}
                <div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Restaurant Cover Banner
                    </label>
                    <div className="flex gap-2 items-center mb-2">
                      <img src={coverImageUrl} alt="Cover Preview" className="h-12 w-20 rounded-2xl object-cover border-2 border-[#111111] shadow-sm shrink-0" />
                      <input
                        type="url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="Image URL..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COVERS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCoverImageUrl(p.url)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                            coverImageUrl === p.url
                              ? "bg-[#111111] text-white border-[#111111]"
                              : "bg-[#F5F5F5] dark:bg-[#383838] border-[#E5E5E5] hover:bg-secondary/20"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address & City */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                    Street Address *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 104 Connaught Place, Block B"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                    />
                    <MapPin className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New Delhi"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Delhi"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      PIN/ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="110001"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111]"
                    />
                  </div>
                </div>

                {/* Google Maps Pin Simulation */}
                <div className="p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838]/60 border border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111111] dark:text-slate-200 flex items-center gap-1.5">
                      <Compass className="size-4 text-[#d2d0c1]" />
                      <span>Google Maps Location Pin</span>
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Lat: {latitude.toFixed(4)}, Long: {longitude.toFixed(4)}
                    </span>
                  </div>

                  <div className="h-28 rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center border border-slate-700">
                    <div className="absolute inset-0 bg-[radial-gradient(#d2d0c1_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                    <div className="relative text-center space-y-1">
                      <div className="size-10 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce border border-[#d2d0c1]">
                        <MapPin className="size-5 fill-current text-[#d2d0c1]" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-200">
                        {restaurantName || "Your Restaurant Location"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {address ? `${address}, ${city}` : "Drag pin to set exact coordinates"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 h-12 rounded-2xl bg-[#F5F5F5] hover:bg-secondary/30 text-foreground font-extrabold text-xs transition-all flex items-center gap-1.5 border border-[#E5E5E5] cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 h-12 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Business Specifications</span>
                    <ArrowRight className="size-4 text-[#d2d0c1]" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: BUSINESS DETAILS */}
            {/* ========================================================================= */}
            {step === 3 && (
              <form onSubmit={handleNextStep3} className="space-y-5">
                <div className="text-center sm:text-left mb-6">
                  <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
                    Business & Capacity
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                    Configure your restaurant type, opening hours, table count, and seating setup.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-2">
                    Restaurant Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {RESTAURANT_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRestaurantType(t)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                          restaurantType === t
                            ? "bg-[#111111] dark:bg-[#d2d0c1] text-white border-transparent shadow-md"
                            : "bg-white dark:bg-[#383838] border-[#E5E5E5] dark:border-[#404040] text-foreground hover:bg-secondary/10"
                        }`}
                      >
                        <span>{t}</span>
                        {restaurantType === t && <Check className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-2">
                    Cuisine Types Offered *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((c) => {
                      const isSelected = selectedCuisines.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCuisine(c)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-[#111111] dark:bg-[#d2d0c1] text-white border-[#111111] dark:border-[#d2d0c1] shadow-sm"
                              : "bg-white dark:bg-[#383838] border-[#E5E5E5] dark:border-[#404040] text-foreground hover:border-[#111111]"
                          }`}
                        >
                          {isSelected && <Check className="size-3.5" />}
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Opening Time *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Clock className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Closing Time *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={closingHours}
                        onChange={(e) => setClosingHours(e.target.value)}
                        placeholder="11:00 PM"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Clock className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Total Number of Tables *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        required
                        value={numberOfTables}
                        onChange={(e) => setNumberOfTables(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Grid className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#111111] dark:text-slate-300 mb-1.5">
                      Total Seating Capacity *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        required
                        value={seatingCapacity}
                        onChange={(e) => setSeatingCapacity(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] dark:border-[#404040] text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#111111] shadow-sm"
                      />
                      <Users className="absolute left-3.5 size-4 text-[#333333] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 h-12 rounded-2xl bg-[#F5F5F5] hover:bg-secondary/30 text-foreground font-extrabold text-xs transition-all flex items-center gap-1.5 border border-[#E5E5E5] cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-8 h-12 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Final Confirmation</span>
                    <ArrowRight className="size-4 text-[#d2d0c1]" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: ACCOUNT CONFIRMATION */}
            {/* ========================================================================= */}
            {step === 4 && (
              <form onSubmit={handleFinalRegister} className="space-y-6">
                <div className="text-center sm:text-left mb-6">
                  <h1 className="font-serif italic text-3xl sm:text-4xl text-[#111111] dark:text-slate-100 font-bold tracking-tight">
                    Confirm &amp; Register
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                    Review your registration summary and accept terms to launch your StockDine portal.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#F5F5F5] dark:bg-[#383838]/80 rounded-3xl p-5 border border-[#E5E5E5] space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-[#E5E5E5]">
                    <img src={logoUrl} alt={restaurantName} className="size-14 rounded-2xl object-cover border-2 border-[#111111] shadow-md" />
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-slate-100">{restaurantName}</h2>
                      <p className="text-xs text-muted-foreground font-medium">{restaurantType} • {selectedCuisines.join(", ")}</p>
                      <p className="text-xs text-[#d2d0c1] font-bold mt-0.5">{address}, {city}, {country}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Owner Name</span>
                      <span className="font-bold text-foreground">{ownerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Owner Email</span>
                      <span className="font-bold text-foreground truncate block">{email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Mobile Phone</span>
                      <span className="font-bold text-foreground">{phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Operating Hours</span>
                      <span className="font-bold text-foreground">{openingHours} - {closingHours}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Tables</span>
                      <span className="font-bold text-foreground">{numberOfTables} Tables</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Seating Capacity</span>
                      <span className="font-bold text-foreground">{seatingCapacity} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] cursor-pointer transition-all hover:border-[#111111]">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="size-5 mt-0.5 text-[#111111] rounded focus:ring-[#111111]"
                    />
                    <span className="text-xs font-semibold text-foreground leading-relaxed">
                      I agree to the <span className="text-[#111111] dark:text-[#d2d0c1] underline font-bold">StockDine Partner Terms &amp; Conditions</span> and commission agreement (10% platform fee).
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#383838] border border-[#E5E5E5] cursor-pointer transition-all hover:border-[#111111]">
                    <input
                      type="checkbox"
                      checked={acceptPrivacy}
                      onChange={(e) => setAcceptPrivacy(e.target.checked)}
                      className="size-5 mt-0.5 text-[#111111] rounded focus:ring-[#111111]"
                    />
                    <span className="text-xs font-semibold text-foreground leading-relaxed">
                      I agree to the <span className="text-[#111111] dark:text-[#d2d0c1] underline font-bold">Privacy Policy</span> and data handling protocols for guest dine-in bookings.
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 h-13 rounded-2xl bg-[#F5F5F5] hover:bg-secondary/30 text-foreground font-extrabold text-xs transition-all flex items-center gap-1.5 border border-[#E5E5E5] cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !acceptTerms || !acceptPrivacy}
                    className="flex-1 sm:flex-initial px-8 h-13 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Registering Restaurant...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-5 text-[#d2d0c1]" />
                        <span>Register Restaurant Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground font-medium">
        <p>© 2026 StockDine. All rights reserved. Powered by Live Dine-in Intelligence.</p>
      </footer>
    </div>
  );
}
