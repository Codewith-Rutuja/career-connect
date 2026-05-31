import { BriefcaseBusiness, FileStack, LayoutDashboard, UserRoundCog } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: BriefcaseBusiness },
  { to: "/saved-jobs", label: "Saved Jobs", icon: BriefcaseBusiness },
  { to: "/resume", label: "Resume Lab", icon: FileStack },
  { to: "/profile", label: "Profile", icon: UserRoundCog },
];

function Sidebar() {
  return (
    <aside className="glass-panel w-full max-w-[260px] p-4">
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center justify-start gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-brand-500"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
