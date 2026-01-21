import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", to: "/app/dashboard" },
  { name: "Teachers", to: "/app/teachers" },
  { name: "Schools", to: "/app/schools" },
  { name: "Alerts & Priorities", to: "/app/alerts" },
  { name: "Insights", to: "/app/insights" },
  { name: "Reports", to: "/app/reports" }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-900 text-white">
      <div className="p-4 text-xl font-semibold border-b border-blue-700">
        Shiksha Mitra
        <div className="text-sm font-normal text-blue-200">
          CRP Portal
        </div>
      </div>

      <nav className="p-4 space-y-2">
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
    </aside>
  );
}
