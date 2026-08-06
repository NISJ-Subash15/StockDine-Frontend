import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Building2, Utensils, Map, Heart, Calendar, User } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/customer")({
  component: CustomerLayout,
});

type Tab = {
  to: string;
  label: string;
  icon: ReactNode;
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
  },
  {
    to: "/customer/profile",
    label: "Profile",
    icon: <User className="size-5 stroke-[2.2]" />,
  },
];

function CustomerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] font-sans selection:bg-[#E77B49] selection:text-white relative">
      <main className="pb-28">
        <Outlet />
      </main>

      {/* Floating Glassmorphic Bottom Navigation Bar */}
      <nav className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-0 z-40 max-w-lg mx-auto">
        <div className="glass-nav-premium rounded-3xl px-3 py-2 flex justify-around items-center shadow-lg border border-[#E5E7EB] backdrop-blur-2xl bg-[#FFFFFF]/95">
          {tabs.map((t) => {
            const active =
              t.to === "/customer" ? pathname === "/customer" : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={
                  "flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all relative group " +
                  (active
                    ? "text-[#E77B49] font-extrabold scale-105"
                    : "text-[#6B7280] hover:text-[#1F2937] opacity-80 hover:opacity-100")
                }
              >
                <div className="relative">
                  {t.icon}
                  {active && (
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#E77B49] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-tight">
                  {t.label}
                </span>
                {active && (
                  <span className="absolute -bottom-1 w-5 h-1 rounded-full bg-[#E77B49] shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}