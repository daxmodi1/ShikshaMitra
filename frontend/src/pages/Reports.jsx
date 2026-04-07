import schools from "../data/schools.json";
import teachers from "../data/teachers.json";

export default function Reports() {
  const highRiskTeachers = teachers.filter(
    t => t.riskLevel === "High"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
          Monthly Summary
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          Monthly CRP Report
        </h1>
      </div>

      <div className="rounded-[30px] border border-white/6 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/5 bg-white/[0.025] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              Schools Covered
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{schools.length}</div>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/[0.025] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              Teachers Monitored
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{teachers.length}</div>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/[0.025] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              High Priority
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#a9bfc0]">{highRiskTeachers}</div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/5 bg-white/[0.025] p-5">
          <div className="text-sm font-medium text-white">Common Challenges</div>
          <p className="mt-2 text-sm leading-7 text-white/58">
            Classroom discipline, student engagement, and conceptual gaps in mathematics.
          </p>
        </div>

        <button
          className="mt-5 rounded-full bg-[#f7eff4] px-5 py-3 text-sm font-semibold text-[#17131b] transition hover:scale-[1.02]"
          onClick={() => alert("PDF download simulated")}
        >
          Download Report (PDF)
        </button>
      </div>
    </div>
  );
}
