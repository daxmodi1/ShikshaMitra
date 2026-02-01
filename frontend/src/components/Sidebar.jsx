import { NavLink } from "react-router-dom";
import api from "../services/api";

const links = [
  { name: "Dashboard", to: "/app/dashboard" },
  { name: "Teachers", to: "/app/teachers" },
  { name: "Schools", to: "/app/schools" },
  { name: "Alerts & Priorities", to: "/app/alerts" },
  { name: "Insights", to: "/app/insights" },
  { name: "Reports", to: "/app/reports" }
];

export default function Sidebar() {
  const handleLogout = () => {
    api.logout();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 text-gray-700 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <img src="/logo.png" alt="Shiksha Mitra" className="w-8 h-8 rounded-lg" />
          <span>Shiksha Mitra</span>
        </div>
        <div className="text-xs font-medium text-gray-500 mt-1">CRP Portal</div>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg text-white text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
