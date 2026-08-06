import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/auth/select-role")({
  head: () => ({
    meta: [
      { title: "Choose Your Account — StockDine" },
      { name: "description", content: "Select whether to log in or register as a Customer or Restaurant Partner on StockDine." },
    ],
  }),
  component: SelectRolePage,
});

function SelectRolePage() {
  const navigate = useNavigate();
  const searchParams: { mode?: "login" | "signup" } = useSearch({ strict: false });
  const isLogin = searchParams?.mode === "login";

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative selection:bg-[#E77B49] selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(231,123,73,0.1),transparent_70%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pt-2 pb-6">
        <Link to="/" className="group flex items-center">
          <div>
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#60241E] dark:text-[#E77B49] block leading-none">
              StockDine
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#E77B49] dark:text-slate-400 font-extrabold block mt-1">
              Role Selection
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/auth/select-role",
                search: { mode: isLogin ? "signup" : "login" },
              })
            }
            className="text-xs font-extrabold text-[#60241E] dark:text-slate-200 hover:text-[#E77B49] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border border-border/60 cursor-pointer"
          >
            <span>{isLogin ? "Need an Account? Get Started" : "Already Registered? Sign In"}</span>
            <ArrowRight className="size-3.5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 max-w-5xl mx-auto w-full">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E77B49]/10 dark:bg-slate-800 border border-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] text-[11px] font-extrabold uppercase tracking-widest">
            <span>{isLogin ? "Authentication Portal" : "Get Started"}</span>
          </div>

          <h1 className="font-serif italic text-4xl sm:text-5xl font-bold tracking-tight text-[#60241E] dark:text-[#E77B49]">
            {isLogin ? "Sign In to Your Portal" : "Choose Your Account"}
          </h1>

          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-400 font-medium leading-relaxed">
            {isLogin
              ? "Select your role below to log in and access your live dine-in, kitchen terminal, or admin controls."
              : "Select the option that best fits your role to experience live food tracking, order management, or instant reservations."}
          </p>
        </div>

        {/* Two Premium Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
          {/* CARD 1: CUSTOMER */}
          <div className="group relative rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 dark:border-slate-800 p-8 sm:p-10 shadow-xl hover:shadow-2xl hover:border-[#E77B49]/50 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full">
                  Diner / Customer
                </span>
              </div>

              <div>
                <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] dark:text-slate-100">
                  Customer
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-1">
                  Everything you need to discover live food & reserve tables.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#1F2937]/90 dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Discover nearby premier restaurants</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>View live real-time food availability & portions left</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Reserve dining tables with advance payment guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Book signature dishes in advance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Navigate seamlessly with live interactive maps</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Save your favorite restaurants & get rewards</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: isLogin ? "/auth/customer/login" : "/auth/customer/signup",
                  })
                }
                className="w-full py-4 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Continue as Customer</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* CARD 2: RESTAURANT */}
          <div className="group relative rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/60 dark:border-slate-800 p-8 sm:p-10 shadow-xl hover:shadow-2xl hover:border-[#E77B49]/50 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full">
                  Partner / Owner
                </span>
              </div>

              <div>
                <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] dark:text-slate-100">
                  Restaurant
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-1">
                  Complete OS for live stock control, kitchen pass, & bookings.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#1F2937]/90 dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Register your restaurant profile & logo</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Manage menu dishes & upload Cloudinary images</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Configure table layouts & toggle live availability</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Real-time Kitchen Portal order execution</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Full Restaurant Admin Dashboard analytics & revenue</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-[#E77B49]" />
                  <span>Scan customer QR codes for instant check-in</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: isLogin ? "/auth/restaurant/login" : "/auth/restaurant/signup",
                  })
                }
                className="w-full py-4 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] dark:bg-[#E77B49] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Continue as Restaurant</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full pt-8 pb-4 text-center border-t border-border/40">
        <p className="text-[11px] text-[#6B7280] dark:text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-4 text-[#E77B49]" />
          <span>Protected by StockDine End-to-End Enterprise Encryption</span>
        </p>
      </footer>
    </div>
  );
}
