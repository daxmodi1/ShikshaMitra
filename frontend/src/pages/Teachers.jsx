import { useNavigate } from "react-router-dom";
import teachers from "../data/teachers.json";
import schools from "../data/schools.json";

export default function Teachers() {
  const navigate = useNavigate();

  const getSchool = id =>
    schools.find(s => s.schoolId === id)?.name;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Teachers</h1>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3">School</th>
            <th className="p-3">Subject</th>
            <th className="p-3">Queries</th>
            <th className="p-3">Risk</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr
              key={t.teacherId}
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                navigate(`/app/teachers/${t.teacherId}`)
              }
            >
              <td className="p-3">{t.name}</td>
              <td className="p-3">{getSchool(t.schoolId)}</td>
              <td className="p-3">{t.subject}</td>
              <td className="p-3">{t.monthlyQueries}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    t.riskLevel === "High"
                      ? "bg-red-600"
                      : t.riskLevel === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-600"
                  }`}
                >
                  {t.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
