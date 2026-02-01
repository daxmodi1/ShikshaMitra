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
    <aside className="w-64 bg-blue-900 text-white flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <img src="/logo.png" alt="Shiksha Mitra" className="w-8 h-8 rounded-lg" />
          <span>Shiksha Mitra</span>
        </div>
        <div className="text-sm font-normal text-blue-200">
          CRP Portal
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive
                  ? "bg-blue-700"
                  : "hover:bg-blue-800"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
