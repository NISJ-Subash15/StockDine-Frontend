import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, ShieldCheck, ArrowRight } from "lucide-react";

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="size-16 rounded-2xl bg-[#E77B49]/15 text-[#E77B49] flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="size-8 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif italic font-bold text-2xl text-foreground">
            Sign in to continue
          </h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Please sign in or create an account to reserve tables, manage bookings, and access personalized features.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/login" });
            }}
            className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/signup" });
            }}
            className="w-full py-3 rounded-2xl bg-secondary/30 text-[#60241E] dark:text-slate-200 hover:bg-secondary/50 font-extrabold text-xs transition-all cursor-pointer"
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-foreground transition-colors cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
