import schools from "../data/schools.json";
import teachers from "../data/teachers.json";

export default function Schools() {
  const getTeachersBySchool = (schoolId) =>
    teachers.filter((t) => t.schoolId === schoolId);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
          School Coverage
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          Schools
        </h1>
        <p className="mt-2 text-sm text-white/52">
          Cluster-wide school coverage and teacher risk distribution.
        </p>
      </div>

      <div className="space-y-4">
        {schools.map((school) => {
          const schoolTeachers = getTeachersBySchool(school.schoolId);
          const highRisk = schoolTeachers.filter(
            (t) => t.riskLevel === "High"
          ).length;

          return (
            <div
              key={school.schoolId}
              className="rounded-[28px] border border-white/6 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{school.name}</h2>
                  <p className="mt-1 text-sm text-white/45">{school.type} School</p>
                </div>

                <div className="rounded-full border border-white/6 bg-white/[0.03] px-4 py-2 text-sm text-white/72">
                  Teachers: {schoolTeachers.length}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/5 bg-white/[0.025] px-4 py-2 text-sm text-white/58">
                  School ID: {school.schoolId}
                </div>
                <div className="rounded-full border border-white/5 bg-white/[0.025] px-4 py-2 text-sm text-white/58">
                  High Risk Teachers: <span className="font-semibold text-white">{highRisk}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
