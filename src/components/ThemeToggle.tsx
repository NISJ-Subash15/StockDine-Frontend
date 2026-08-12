import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function applyTheme(isDark: boolean) {
  if (typeof document === "undefined") return;
  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("stockdine-theme-change", { detail: { isDark } }));
  }
}

export function ThemeToggle({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isDark === "boolean") {
        setIsDark(customEvent.detail.isDark);
      } else {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
      }
    };

    window.addEventListener("stockdine-theme-change", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);

    // Initial sync
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }

    return () => {
      window.removeEventListener("stockdine-theme-change", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    applyTheme(nextDark);
    setIsDark(nextDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2.5 rounded-2xl bg-secondary/10 hover:bg-secondary/20 text-foreground border border-border/60 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 dark:bg-[#383838]/80 dark:hover:bg-slate-700 dark:border-[#404040] dark:text-slate-200 cursor-pointer ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun className="size-4 text-amber-400 fill-amber-400/20 shrink-0" />
          {showLabel && <span className="text-xs font-bold">Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="size-4 text-slate-700 dark:text-slate-300 shrink-0" />
          {showLabel && <span className="text-xs font-bold">Dark Mode</span>}
        </>
      )}
    </button>
  );
}

