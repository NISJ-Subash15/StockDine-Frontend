import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Phone, ShieldCheck, LogOut, Edit3, Calendar, ChefHat, Sparkles, Check, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore } from "@/lib/stockdine-store";
import { api } from "@/lib/api";
import { GuestAuthModal } from "@/components/GuestAuthModal";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({
    meta: [
      { title: "Customer Profile — StockDine" },
      { name: "description", content: "View and manage your StockDine diner account details." },
    ],
  }),
  component: CustomerProfilePage,
});

function CustomerProfilePage() {
  const navigate = useNavigate();
  const { authSession, updateUserProfile, signOut } = useStockDineStore();

  const isGuest = !authSession || !authSession.isLoggedIn;
  const userProfile = authSession?.profileData || (authSession?.userEmail ? {
    name: authSession.userEmail.includes("@") ? authSession.userEmail.split("@")[0] : `Diner (${authSession.userEmail.slice(-4)})`,
    mobile: authSession.userEmail,
    email: authSession.userEmail.includes("@") ? authSession.userEmail : "",
    role: "customer",
  } : {
    name: "Valued Diner",
    mobile: "+91 XXXXX XXXXX",
    email: "",
    role: "customer",
  });

  const [profileData, setProfileData] = useState<any>(userProfile);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || "Valued Diner");
  const [editMobile, setEditMobile] = useState(userProfile?.mobile || userProfile?.email || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isGuest) {
      fetchProfile();
    }
  }, [isGuest]);

  useEffect(() => {
    if (authSession?.profileData) {
      setProfileData(authSession.profileData);
      setEditName(authSession.profileData.name || "");
      setEditMobile(authSession.profileData.mobile || authSession.profileData.email || "");
    }
  }, [authSession?.profileData]);

  const fetchProfile = async () => {
    try {
      const authRes: any = await api.auth.getProfile();
      if (authRes && authRes.success && (authRes.profile || authRes.user)) {
        const prof = authRes.profile || authRes.user;
        setProfileData(prof);
        setEditName(prof.name || "");
        setEditMobile(prof.mobile || prof.email || "");
      } else {
        const custRes: any = await api.customers.getProfile();
        if (custRes && custRes.success && custRes.customer) {
          setProfileData(custRes.customer);
          setEditName(custRes.customer.name || "");
          setEditMobile(custRes.customer.mobile || "");
        }
      }
    } catch (err: any) {
      console.warn("Notice: Background profile refresh:", err.message || err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editName.trim();
    if (!cleanName) {
      setMsg({ type: "error", text: "Name is required and cannot be empty." });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await updateUserProfile({
        name: cleanName,
        mobile: editMobile.trim(),
      });

      setSaving(false);
      if (res.success && res.user) {
        setProfileData(res.user);
        setIsEditing(false);
        setMsg({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMsg({ type: "error", text: res.message || "Unable to update your profile. Please try again." });
      }
    } catch (err: any) {
      setSaving(false);
      setMsg({ type: "error", text: err.message || "Unable to update your profile. Please try again." });
    }
  };

  const handleSignOut = () => {
    signOut();
    localStorage.removeItem("stockdine_token");
    navigate({ to: "/" });
  };

  const memberSinceFormatted = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently Joined";

  if (isGuest) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 flex items-center justify-center p-4">
        <GuestAuthModal isOpen={true} onClose={() => navigate({ to: "/customer" })} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#E77B49] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(231,123,73,0.1),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full pt-2 pb-6">
        <Link to="/customer" className="group flex items-center gap-3">
          <div>
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#60241E] dark:text-[#E77B49] block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#E77B49] dark:text-slate-400 font-extrabold block mt-1">
              Customer Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/customer" });
              }
            }}
            className="text-xs font-extrabold text-[#60241E] dark:text-slate-200 hover:text-[#E77B49] transition-colors px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60 cursor-pointer"
          >
            ← Back to Restaurants
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 max-w-3xl mx-auto w-full">
        <div className="w-full">
          {loading ? (
            <div className="text-center py-20 space-y-3">
              <div className="size-10 border-4 border-[#E77B49] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-extrabold text-[#60241E] dark:text-slate-300 uppercase tracking-widest">
                Fetching Real MongoDB Profile...
              </p>
            </div>
          ) : loadError ? (
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 p-8 text-center space-y-4 shadow-xl">
              <div className="size-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="size-8" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                  {loadError}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Please verify your internet connection and backend server status.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchProfile}
                className="px-6 py-2.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 dark:border-slate-800 p-8 sm:p-10 shadow-2xl space-y-8">
              {/* Top Banner & Avatar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border/60 pb-8">
                <div className="flex items-center gap-5 text-center sm:text-left">
                  <div className="relative group">
                    <div className="size-20 rounded-3xl bg-[#60241E] dark:bg-[#E77B49] text-white flex items-center justify-center shadow-xl text-3xl font-bold font-serif italic border-2 border-white/20 overflow-hidden">
                      {profileData?.avatar ? (
                        <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : profileData?.name ? (
                        profileData.name.charAt(0).toUpperCase()
                      ) : (
                        "C"
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 size-7 rounded-xl bg-[#E77B49] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
                      <Edit3 className="size-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setProfileData({ ...profileData, avatar: ev.target.result as string });
                                setMsg({ type: "success", text: "Profile photo updated!" });
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E77B49]/10 text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest border border-[#E77B49]/20">
                        <Sparkles className="size-3" />
                        <span>StockDine Verified Diner</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase border border-amber-500/20">
                        <span>🏆 Gold VIP Member</span>
                      </span>
                    </div>

                    <h1 className="font-serif italic text-3xl font-bold text-[#60241E] dark:text-slate-100">
                      {profileData?.name || "Customer Account"}
                    </h1>
                    <p className="text-xs font-mono text-[#E77B49] font-extrabold">
                      ID: {profileData?.customerId || profileData?.id || "CUST-LIVE"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-slate-800 border border-border/60 text-[#60241E] dark:text-slate-200 hover:text-[#E77B49] text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Edit3 className="size-4 text-[#E77B49]" />
                    <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {msg.text && (
                <div
                  className={`p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2.5 ${
                    msg.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {msg.type === "success" ? <Check className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {/* Profile Information Cards Grid */}
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Name */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                      <User className="size-4 text-[#E77B49]" />
                      <span>Full Name</span>
                    </div>
                    <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                      {profileData?.name || "Not Set"}
                    </p>
                  </div>

                  {/* Card 2: Mobile */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                      <Phone className="size-4 text-[#E77B49]" />
                      <span>Mobile Number</span>
                    </div>
                    <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                      {profileData?.mobile || "Mobile Verified"}
                    </p>
                  </div>

                  {/* Card 4: Member Since */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                      <Calendar className="size-4 text-[#E77B49]" />
                      <span>Member Since</span>
                    </div>
                    <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                      {memberSinceFormatted}
                    </p>
                  </div>

                  {/* Card 5: Booking History */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <ChefHat className="size-4 text-[#E77B49]" />
                        <span>Booking History</span>
                      </div>
                      <Link to="/customer/bookings" className="text-[10px] font-extrabold text-[#E77B49] hover:underline">
                        View All →
                      </Link>
                    </div>
                    <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                      {Array.isArray(profileData?.bookingHistory) ? `${profileData.bookingHistory.length} Reservations` : "0 Reservations"}
                    </p>
                  </div>

                  {/* Card 6: Favourite Restaurants */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <Sparkles className="size-4 text-[#E77B49]" />
                        <span>Favourite Restaurants</span>
                      </div>
                      <Link to="/customer/favorites" className="text-[10px] font-extrabold text-[#E77B49] hover:underline">
                        View Saved →
                      </Link>
                    </div>
                    <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                      {Array.isArray(profileData?.favouriteRestaurants) ? `${profileData.favouriteRestaurants.length} Restaurants` : "0 Saved"}
                    </p>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-3 rounded-2xl bg-secondary/10 text-xs font-extrabold text-[#60241E] dark:text-slate-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 pb-2 text-center text-[11px] text-[#6B7280] dark:text-slate-500 font-medium">
        © StockDine Inc. Real MongoDB Customer Session.
      </footer>
    </div>
  );
}