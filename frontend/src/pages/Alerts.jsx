import alerts from "../data/alerts.json";
import teachers from "../data/teachers.json";
import schools from "../data/schools.json";

export default function Alerts() {
  const getTeacher = id =>
    teachers.find(t => t.teacherId === id)?.name || "-";

  const getSchool = id =>
    schools.find(s => s.schoolId === id)?.name || "-";

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">
        Alerts & Priorities
      </h1>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.alertId}
            className={`p-4 rounded shadow border-l-4 ${
              alert.severity === "High"
                ? "border-red-600 bg-red-50"
                : "border-yellow-500 bg-yellow-50"
            }`}
          >
            <div className="font-semibold text-gray-800">
              {alert.type} Alert — {alert.severity} Priority
            </div>

            <div className="text-gray-700 mt-1">
              {alert.message}
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Teacher: {getTeacher(alert.teacherId)} | School:{" "}
              {getSchool(alert.schoolId)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
