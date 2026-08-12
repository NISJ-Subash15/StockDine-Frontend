import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from "react";
import { ArrowRight, LogOut, Lock, X, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";

export const Route = createFileRoute("/auth/workspace")({
  head: () => ({
    meta: [
      { title: "Select Workspace — StockDine Partner" },
      { name: "description", content: "Choose between Kitchen Portal or Restaurant Admin Dashboard." },
    ],
  }),
  component: SelectWorkspacePage,
});

function SelectWorkspacePage() {
  const navigate = useNavigate();
  const { authSession, signOut, verifyAdminPortalPassword, getRestaurantProfile } = useStockDineStore();

  const currentRestId = authSession?.restaurantId || "";
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminPassError, setAdminPassError] = useState("");
  const [showAdminPassText, setShowAdminPassText] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const handleOpenAdminPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setAdminPassError(`Too many failed attempts. Security lock active for ${remainingSec} seconds.`);
      return;
    }

    if (!adminPassInput) {
      setAdminPassError("Please enter your Admin Security Password.");
      return;
    }
    setAdminPassError("");
    setIsVerifying(true);
    try {
      const isValid = await verifyAdminPortalPassword(currentRestId, adminPassInput);
      setIsVerifying(false);
      if (isValid) {
        setFailedAttempts(0);
        setLockoutUntil(null);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("stockdine_admin_unlocked", "true");
        }
        setShowAdminPassModal(false);
        navigate({ to: "/admin" });
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          const lockTime = Date.now() + 15 * 60 * 1000;
          setLockoutUntil(lockTime);
          setAdminPassError("Security lock active: 5 incorrect password attempts reached. Please try again in 15 minutes.");
        } else {
          setAdminPassError(`Incorrect Admin Security Password. Attempt ${nextAttempts} of 5. Please try again.`);
        }
      }
    } catch (err: any) {
      setIsVerifying(false);
      setAdminPassError(err.message || "Password verification failed.");
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#2b2b2b] text-[#111111] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#d2d0c1] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,208,193,0.1),transparent_70%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center">
          <div>
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#d2d0c1] block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#d2d0c1] dark:text-slate-400 font-extrabold block mt-1">
              Workspace Switcher
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 max-w-5xl mx-auto w-full">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F5] dark:bg-[#383838] border border-[#E5E5E5] text-[#111111] dark:text-[#d2d0c1] text-[11px] font-extrabold uppercase tracking-widest">
            <span>Authenticated Restaurant Admin</span>
          </div>

          <h1 className="font-serif italic text-4xl sm:text-5xl font-bold tracking-tight text-[#111111] dark:text-[#d2d0c1]">
            Select Your Workspace
          </h1>

          <p className="text-xs sm:text-sm text-[#737373] dark:text-slate-400 font-medium leading-relaxed">
            Welcome back! Choose which terminal or management workspace you would like to open.
          </p>
        </div>

        {/* Two Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          {/* WORKSPACE CARD 1: KITCHEN PORTAL */}
          <div className="group relative rounded-3xl bg-white/80 dark:bg-[#222222]/80 backdrop-blur-xl border border-[#E5E5E5] dark:border-[#404040] p-8 sm:p-10 shadow-xl hover:shadow-2xl hover:border-[#111111] dark:hover:border-[#d2d0c1] transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-full">
                  Kitchen Terminal
                </span>
              </div>

              <div>
                <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#111111] dark:text-slate-100">
                  Kitchen Portal
                </h2>
                <p className="text-xs text-[#737373] dark:text-slate-400 font-medium mt-1">
                  Fast live order execution terminal for kitchen chefs &amp; staff.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#333333] dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Manage incoming live customer orders in real-time</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Update food preparation statuses (Preparing, Ready, Served)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Change stock &amp; portion availability with touch controls</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>View pending &amp; queue order tickets instantly</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => navigate({ to: "/kitchen" })}
                className="w-full py-4 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Open Kitchen Portal</span>
                <ArrowRight className="size-4 text-[#d2d0c1] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* WORKSPACE CARD 2: RESTAURANT ADMIN */}
          <div className="group relative rounded-3xl bg-white/80 dark:bg-[#222222]/80 backdrop-blur-xl border border-[#E5E5E5] dark:border-[#404040] p-8 sm:p-10 shadow-xl hover:shadow-2xl hover:border-[#111111] dark:hover:border-[#d2d0c1] transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-full">
                  Admin OS
                </span>
              </div>

              <div>
                <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#111111] dark:text-slate-100">
                  Restaurant Admin
                </h2>
                <p className="text-xs text-[#737373] dark:text-slate-400 font-medium mt-1">
                  Complete management dashboard, analytics, menu &amp; table setup.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#333333] dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Manage restaurant settings, logo &amp; cover images</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Manage food menu &amp; upload Cloudinary dish photos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>Manage tables, seating capacity &amp; availability</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>View all table bookings &amp; scan check-in QR codes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#d2d0c1]" />
                  <span>View real-time revenue &amp; analytics dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => {
                  const isUnlocked = typeof window !== "undefined" && sessionStorage.getItem("stockdine_admin_unlocked") === "true";
                  const restProfile = getRestaurantProfile(currentRestId);
                  const savedSetting = typeof window !== "undefined" ? localStorage.getItem("stockdine_admin_protection_" + currentRestId) : null;
                  const isProtectionDisabled = savedSetting === "false" ||
                    restProfile?.adminPasswordProtection === false ||
                    authSession?.profileData?.adminPasswordProtection === false;
                  
                  if (isUnlocked || isProtectionDisabled) {
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("stockdine_admin_unlocked", "true");
                    }
                    navigate({ to: "/admin" });
                  } else {
                    setAdminPassInput("");
                    setAdminPassError("");
                    setShowAdminPassModal(true);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>
                  {(typeof window !== "undefined" && sessionStorage.getItem("stockdine_admin_unlocked") === "true") ||
                  (typeof window !== "undefined" && localStorage.getItem("stockdine_admin_protection_" + currentRestId) === "false") ||
                  getRestaurantProfile(currentRestId)?.adminPasswordProtection === false ||
                  authSession?.profileData?.adminPasswordProtection === false
                    ? "Open Restaurant Admin"
                    : "Open Restaurant Admin (🔒 Pass Required)"}
                </span>
                <ArrowRight className="size-4 text-[#d2d0c1] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Security Password Unlock Modal */}
      {showAdminPassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#222222] text-foreground rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-[#E5E5E5] dark:border-[#404040] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-[#F5F5F5] dark:bg-[#d2d0c1]/10 text-[#111111] dark:text-[#d2d0c1] flex items-center justify-center border border-[#E5E5E5]">
                  <Lock className="size-5 text-[#111111] dark:text-[#d2d0c1]" />
                </div>
                <div>
                  <h3 className="font-serif italic text-2xl font-bold text-[#111111] dark:text-slate-100 leading-none">
                    Admin Portal Security
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#d2d0c1] font-extrabold block mt-0.5">
                    Authorization Required
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setShowAdminPassModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#383838] cursor-pointer">
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
              Kitchen staff members cannot open the Restaurant Admin portal without authorization. Please enter your Admin Portal Security Password.
            </p>

            {adminPassError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>{adminPassError}</span>
              </div>
            )}

            <form onSubmit={handleOpenAdminPortal} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[#111111] dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
                  Admin Security Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassText ? "text" : "password"}
                    required
                    value={adminPassInput}
                    onChange={(e) => setAdminPassInput(e.target.value)}
                    placeholder="Enter your Admin Security Password"
                    className="w-full p-3 rounded-2xl border border-[#E5E5E5] dark:border-[#404040] bg-white dark:bg-[#383838] text-foreground pr-10 font-mono text-sm focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassText(!showAdminPassText)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showAdminPassText ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPassModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#383838] text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#111111] hover:bg-[#333333] dark:bg-[#d2d0c1] dark:hover:bg-[#D66A38] text-white font-extrabold uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Unlock Admin</span>
                  <ArrowRight className="size-4 text-[#d2d0c1]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full pt-8 pb-4 text-center border-t border-border/40">
        <p className="text-[11px] text-[#737373] dark:text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-4 text-[#d2d0c1]" />
          <span>Logged in as {authSession?.userEmail || "Restaurant Partner"}</span>
        </p>
      </footer>
    </div>
  );
}
