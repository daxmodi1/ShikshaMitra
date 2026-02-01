import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await api.getCRPTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading teachers...</div>;
  }

  const filteredTeachers = teachers.filter(t => {
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-600">All teachers connected to your CRP</p>
        </div>
        <div className="w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Queries</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Active</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(t => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 text-sm text-gray-900">{t.name}</td>
                <td className="p-3 text-sm text-gray-600">{t.email}</td>
                <td className="p-3 text-sm text-gray-700">{t.grade}</td>
                <td className="p-3 text-sm text-gray-700">{t.subject}</td>
                <td className="p-3 text-sm text-gray-700">{t.location}</td>
                <td className="p-3">
                  <span className="font-semibold text-gray-900">{t.total_queries}</span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {t.last_active 
                    ? new Date(t.last_active).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/app/teachers/${t.id}`)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    View Chats
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTeachers.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No teachers found
          </div>
        )}
      </div>
    </>
  );
}