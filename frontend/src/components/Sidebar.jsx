import { NavLink } from "react-router-dom";
import {
  Bell,
  BarChart3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
} from "lucide-react";
import api from "../services/api";

const links = [
  { name: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
  { name: "Teachers", to: "/app/teachers", icon: GraduationCap },
  { name: "Schools", to: "/app/schools", icon: School },
  { name: "Alerts & Priorities", to: "/app/alerts", icon: Bell },
  { name: "Insights", to: "/app/insights", icon: BarChart3 },
  { name: "Reports", to: "/app/reports", icon: FileText },
];

export default function Sidebar() {
  const handleLogout = () => {
    api.logout();
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-white/8 bg-[#0b0b10]/92 backdrop-blur-xl">
      <div className="border-b border-white/8 px-6 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo_with_bg.svg"
            alt="Shiksha Mitra"
            className="h-11 w-11 rounded-2xl"
          />
          <div>
            <div className="text-base font-semibold text-white">Shiksha Mitra</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/42">
              CRP Workspace
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-white/12 bg-white/[0.07] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                    : "border border-transparent text-white/62 hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/78 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
