import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Jobs", to: "/jobs" },
  { label: "Applications", to: "/applications" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Resume Lab", to: "/resume" },
];

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/55 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
      <div className="container-shell flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-slate-900 text-white shadow-glow">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-bold">CareerConnect</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {isAuthenticated
            ? navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))
            : null}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
              >
                <UserRound size={16} />
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] dark:bg-brand-500"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80 dark:text-slate-100 dark:hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] dark:bg-brand-500"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/30 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 lg:hidden"
          >
            <div className="container-shell flex flex-col gap-2 py-4">
              {isAuthenticated
                ? navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 dark:text-slate-100 dark:hover:bg-white/10"
                    >
                      {item.label}
                    </NavLink>
                  ))
                : null}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    <LayoutDashboard size={16} />
                    {user?.role === "employer" ? "Recruiter Profile" : "My Profile"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white dark:bg-brand-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-brand-500"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
