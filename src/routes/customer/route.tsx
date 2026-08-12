import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Utensils, Map, Calendar, User } from "lucide-react";
import type { ReactNode } from "react";
import { useStockDineStore } from "@/lib/stockdine-store";
import { GuestAuthModal } from "@/components/GuestAuthModal";

export const Route = createFileRoute("/customer")({
  component: CustomerLayout,
});

type Tab = {
  to: string;
  label: string;
  icon: ReactNode;
  protected?: boolean;
};

const tabs: Tab[] = [
  {
    to: "/customer",
    label: "Venues",
    icon: <Building2 className="size-5 stroke-[2.2]" />,
  },
  {
    to: "/customer/dishes",
    label: "Explore Dishes",
    icon: <Utensils className="size-5 stroke-[2.2]" />,
  },
  {
    to: "/customer/map",
    label: "Map",
    icon: <Map className="size-5 stroke-[2.2]" />,
  },
  {
    to: "/customer/bookings",
    label: "Bookings",
    icon: <Calendar className="size-5 stroke-[2.2]" />,
    protected: true,
  },
  {
    to: "/customer/profile",
    label: "Profile",
    icon: <User className="size-5 stroke-[2.2]" />,
    protected: true,
  },
];

function CustomerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { authSession } = useStockDineStore();
  const isGuest = !authSession || !authSession.isLoggedIn;
  const [showGuestModal, setShowGuestModal] = useState(false);
  const visibleTabs = tabs;

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#2b2b2b] text-[#111111] dark:text-slate-100 font-sans selection:bg-[#d2d0c1] selection:text-white relative transition-colors duration-300">
      <main className="pb-28">
        <Outlet />
      </main>

      {/* Floating Glassmorphic Bottom Navigation Bar */}
      <nav className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-0 z-40 max-w-lg mx-auto">
        <div className="glass-nav-premium rounded-3xl px-3 py-2 flex justify-around items-center shadow-lg border border-[#E5E5E5] dark:border-[#404040] backdrop-blur-2xl bg-[#FFFFFF]/95 dark:bg-[#222222]/95 transition-colors duration-300">
          {visibleTabs.map((t) => {
            const active =
              t.to === "/customer" ? pathname === "/customer" : pathname.startsWith(t.to);
            return (
              <button
                key={t.to}
                type="button"
                onClick={() => {
                  if (isGuest && t.protected) {
                    setShowGuestModal(true);
                  } else {
                    navigate({ to: t.to as any });
                  }
                }}
                className={
                  "flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative group cursor-pointer " +
                  (active
                    ? "text-[#d2d0c1] font-extrabold scale-105"
                    : "text-[#737373] dark:text-slate-400 hover:text-[#111111] dark:hover:text-slate-100 opacity-80 hover:opacity-100")
                }
              >
                <div className="relative">
                  {t.icon}
                  {active && (
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#d2d0c1] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-tight">
                  {t.label}
                </span>
                {active && (
                  <span className="absolute -bottom-1 w-5 h-1 rounded-full bg-[#d2d0c1] shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Guest Authentication Intercept Modal */}
      <GuestAuthModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
}