import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Teachers</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Grade</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Total Queries</th>
              <th className="p-3 text-left">Last Active</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{t.name}</td>
                <td className="p-3 text-sm text-gray-600">{t.email}</td>
                <td className="p-3">{t.grade}</td>
                <td className="p-3">{t.subject}</td>
                <td className="p-3 text-sm">{t.location}</td>
                <td className="p-3">
                  <span className="font-semibold">{t.total_queries}</span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {t.last_active 
                    ? new Date(t.last_active).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/app/teachers/${t.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    View Chats
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {teachers.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No teachers found
          </div>
        )}
      </div>
    </>
  );
}