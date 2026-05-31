import { MoonStar, SunMedium } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/80 text-slate-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </button>
  );
}

export default ThemeToggle;
