import schools from "../data/schools.json";
import teachers from "../data/teachers.json";

export default function Reports() {
  const highRiskTeachers = teachers.filter(
    t => t.riskLevel === "High"
  ).length;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">
        Monthly CRP Report
      </h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <p>
          <b>Total Schools Covered:</b> {schools.length}
        </p>

        <p>
          <b>Total Teachers Monitored:</b> {teachers.length}
        </p>

        <p>
          <b>High Priority Teachers:</b>{" "}
          <span className="text-red-600 font-semibold">
            {highRiskTeachers}
          </span>
        </p>

        <p>
          <b>Common Challenges:</b> Classroom discipline,
          student engagement, conceptual gaps in mathematics
        </p>

        <button
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={() => alert("PDF download simulated")}
        >
          Download Report (PDF)
        </button>
      </div>
    </>
  );
}
