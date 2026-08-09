import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Phone, Mail, ShieldCheck, LogOut, Edit3, Calendar, ChefHat, Sparkles, Check, AlertCircle, Lock, KeyRound, X } from "lucide-react";
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
    mobile: authSession.userEmail.includes("@") ? "" : authSession.userEmail,
    email: authSession.userEmail.includes("@") ? authSession.userEmail : "",
    role: "customer",
  } : {
    name: "Valued Diner",
    mobile: "",
    email: "",
    role: "customer",
  });

  const [profileData, setProfileData] = useState<any>(userProfile);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || "");
  const [editMobile, setEditMobile] = useState(userProfile?.mobile || "");
  const [editAvatar, setEditAvatar] = useState(userProfile?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Change Password Modal State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeMsg, setChangeMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isGuest) {
      fetchProfile();
    }
  }, [isGuest]);

  useEffect(() => {
    if (authSession?.profileData) {
      setProfileData(authSession.profileData);
      setEditName(authSession.profileData.name || "");
      setEditMobile(authSession.profileData.mobile || "");
      setEditAvatar(authSession.profileData.avatar || "");
    }
  }, [authSession?.profileData]);

  const fetchProfile = async () => {
    try {
      const authRes: any = await api.auth.getProfile();
      if (authRes && authRes.success && (authRes.profile || authRes.user)) {
        const prof = authRes.profile || authRes.user;
        setProfileData(prof);
        setEditName(prof.name || "");
        setEditMobile(prof.mobile || "");
        setEditAvatar(prof.avatar || "");
      } else {
        const custRes: any = await api.customers.getProfile();
        if (custRes && custRes.success && custRes.customer) {
          setProfileData(custRes.customer);
          setEditName(custRes.customer.name || "");
          setEditMobile(custRes.customer.mobile || "");
          setEditAvatar(custRes.customer.avatar || "");
        }
      }
    } catch (err: any) {
      console.warn("Notice: Background profile refresh:", err.message || err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editName.trim();
    if (!cleanName || cleanName.length < 2) {
      setMsg({ type: "error", text: "Full Name is required and must be at least 2 characters." });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await updateUserProfile({
        name: cleanName,
        mobile: editMobile.trim(),
        avatar: editAvatar.trim(),
      });

      setSaving(false);
      if (res.success && res.user) {
        setProfileData(res.user);
        setIsEditing(false);
        setMsg({ type: "success", text: "Profile updated successfully" });
      } else {
        setMsg({ type: "error", text: res.message || "Unable to update your profile. Please try again." });
      }
    } catch (err: any) {
      setSaving(false);
      setMsg({ type: "error", text: err.message || "Unable to update your profile. Please try again." });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMsg({ type: "", text: "" });

    if (!currentPassword) {
      setChangeMsg({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setChangeMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setChangeLoading(true);
    try {
      const res = await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword,
      });

      setChangeLoading(false);
      if (res && res.success) {
        setChangeMsg({ type: "success", text: "Password changed successfully!" });
        setTimeout(() => {
          setShowChangePassword(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setChangeMsg({ type: "", text: "" });
        }, 1200);
      } else {
        setChangeMsg({ type: "error", text: res.message || "Failed to change password." });
      }
    } catch (err: any) {
      setChangeLoading(false);
      setChangeMsg({ type: "error", text: err.message || "Failed to change password." });
    }
  };

  const handleSignOut = () => {
    signOut();
    localStorage.removeItem("stockdine_token");
    navigate({ to: "/" });
  };

  const memberSinceFormatted = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
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
                Loading Authenticated Profile...
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
                    {isEditing && (
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
                                  setEditAvatar(ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E77B49]/10 text-[#E77B49] text-[10px] font-extrabold uppercase tracking-widest border border-[#E77B49]/20">
                        <Sparkles className="size-3" />
                        <span>Verified Customer</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                        <span>Role: {profileData?.role || "customer"}</span>
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

              {/* Profile Information Display */}
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: Full Name */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <User className="size-4 text-[#E77B49]" />
                        <span>Full Name</span>
                      </div>
                      <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                        {profileData?.name || "Not Set"}
                      </p>
                    </div>

                    {/* Card 2: Email Address (Read-only) */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                          <Mail className="size-4 text-[#E77B49]" />
                          <span>Email Address</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">Read-Only</span>
                      </div>
                      <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                        {profileData?.email || "No Email Provided"}
                      </p>
                    </div>

                    {/* Card 3: Mobile Number */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <Phone className="size-4 text-[#E77B49]" />
                        <span>Mobile Number</span>
                      </div>
                      <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                        {profileData?.mobile || "Not Set"}
                      </p>
                    </div>

                    {/* Card 4: Account Role */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <ShieldCheck className="size-4 text-[#E77B49]" />
                        <span>Account Role</span>
                      </div>
                      <p className="text-base font-bold text-[#1F2937] dark:text-slate-100 capitalize">
                        {profileData?.role || "customer"}
                      </p>
                    </div>

                    {/* Card 5: Member Since / Creation Date */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                        <Calendar className="size-4 text-[#E77B49]" />
                        <span>Account Creation Date</span>
                      </div>
                      <p className="text-base font-bold text-[#1F2937] dark:text-slate-100">
                        {memberSinceFormatted}
                      </p>
                    </div>

                    {/* Card 6: Password Security Section */}
                    <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                          <Lock className="size-4 text-[#E77B49]" />
                          <span>Password</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(true)}
                          className="text-xs font-extrabold text-[#E77B49] hover:underline cursor-pointer"
                        >
                          Change Password
                        </button>
                      </div>
                      <p className="text-base font-mono font-bold tracking-widest text-[#1F2937] dark:text-slate-100">
                        ••••••••
                      </p>
                    </div>
                  </div>

                  {/* Summary Footer Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Link
                      to="/customer/bookings"
                      className="p-4 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60 flex items-center justify-between hover:border-[#E77B49] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <ChefHat className="size-5 text-[#E77B49]" />
                        <div>
                          <span className="text-xs font-extrabold block text-foreground">My Bookings</span>
                          <span className="text-[10px] text-muted-foreground">View reservations & passes</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#E77B49]">View →</span>
                    </Link>

                    <Link
                      to="/customer/favorites"
                      className="p-4 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60 flex items-center justify-between hover:border-[#E77B49] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="size-5 text-[#E77B49]" />
                        <div>
                          <span className="text-xs font-extrabold block text-foreground">Saved Favorites</span>
                          <span className="text-[10px] text-muted-foreground">View favorite dining spots</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#E77B49]">View →</span>
                    </Link>
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
                      id="edit-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.getElementById("edit-mobile")?.focus();
                        }
                      }}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      id="edit-mobile"
                      type="tel"
                      required
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.getElementById("edit-avatar")?.focus();
                        }
                      }}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                      Profile Photo URL (Optional)
                    </label>
                    <input
                      id="edit-avatar"
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-3 rounded-2xl bg-secondary/10 text-xs font-extrabold text-[#60241E] dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
                    >
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="size-12 rounded-2xl bg-[#E77B49]/15 text-[#E77B49] flex items-center justify-center mx-auto">
              <KeyRound className="size-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif italic font-bold text-2xl text-foreground">
                Change Password
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Update your account password securely.
              </p>
            </div>

            {changeMsg.text && (
              <div
                className={`p-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 ${
                  changeMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-300"
                }`}
              >
                {changeMsg.type === "success" ? <Check className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                <span>{changeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                  New Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-border/60 text-xs font-bold focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="w-1/3 py-3 rounded-2xl bg-secondary/20 text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changeLoading}
                  className="w-2/3 py-3 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {changeLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 pb-2 text-center text-[11px] text-[#6B7280] dark:text-slate-500 font-medium">
        © StockDine Inc. Real MongoDB Customer Session.
      </footer>
    </div>
  );
}