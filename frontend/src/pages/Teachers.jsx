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
    return <div className="py-10 text-center text-white/52">Loading teachers...</div>;
  }

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
            Teacher Directory
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            Teachers
          </h1>
          <p className="mt-2 text-sm text-white/52">
            All teachers connected to your CRP, in one calmer workspace.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers..."
            className="w-full rounded-full border border-white/6 bg-white/[0.035] px-4 py-3 text-sm text-white placeholder:text-white/34 focus:border-white/10 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/6 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-white/[0.025]">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Grade",
                  "Subject",
                  "Location",
                  "Total Queries",
                  "Last Active",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="p-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="transition hover:bg-white/[0.03]">
                  <td className="p-4 text-sm font-medium text-white">{t.name}</td>
                  <td className="p-4 text-sm text-white/58">{t.email}</td>
                  <td className="p-4 text-sm text-white/64">{t.grade}</td>
                  <td className="p-4 text-sm text-white/64">{t.subject}</td>
                  <td className="p-4 text-sm text-white/64">{t.location}</td>
                  <td className="p-4 text-sm font-semibold text-white">{t.total_queries}</td>
                  <td className="p-4 text-sm text-white/52">
                    {t.last_active ? new Date(t.last_active).toLocaleDateString() : "Never"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/app/teachers/${t.id}`)}
                      className="rounded-full border border-white/7 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/78 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                    >
                      View Chats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeachers.length === 0 && (
          <div className="py-12 text-center text-white/42">No teachers found</div>
        )}
      </div>
    </div>
  );
}
