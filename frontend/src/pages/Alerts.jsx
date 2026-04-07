import alerts from "../data/alerts.json";
import teachers from "../data/teachers.json";
import schools from "../data/schools.json";

export default function Alerts() {
  const getTeacher = id =>
    teachers.find(t => t.teacherId === id)?.name || "-";

  const getSchool = id =>
    schools.find(s => s.schoolId === id)?.name || "-";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
          Priority Feed
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          Alerts & Priorities
        </h1>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.alertId}
            className={`rounded-[26px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
              alert.severity === "High"
                ? "border-[#9aa8b7]/10 bg-[#9aa8b7]/[0.045]"
                : "border-white/6 bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ${
                  alert.severity === "High"
                    ? "bg-[#9aa8b7]/15 text-[#b7c6d6]"
                    : "bg-white/[0.06] text-white/54"
                }`}
              >
                {alert.severity}
              </span>
              <div className="font-semibold text-white">
                {alert.type} Alert
              </div>
            </div>

            <div className="mt-2 text-white/72">
              {alert.message}
            </div>

            <div className="mt-3 text-sm text-white/42">
              Teacher: {getTeacher(alert.teacherId)} | School:{" "}
              {getSchool(alert.schoolId)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
