import schools from "../data/schools.json";
import teachers from "../data/teachers.json";

export default function Schools() {
  const getTeachersBySchool = schoolId =>
    teachers.filter(t => t.schoolId === schoolId);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Schools</h1>

      <div className="space-y-4">
        {schools.map(school => {
          const schoolTeachers = getTeachersBySchool(school.schoolId);
          const highRisk = schoolTeachers.filter(
            t => t.riskLevel === "High"
          ).length;

          return (
            <div
              key={school.schoolId}
              className="bg-white p-4 rounded shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {school.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {school.type} School
                  </p>
                </div>

                <div className="text-sm text-gray-700">
                  Teachers: {schoolTeachers.length}
                </div>
              </div>

              <div className="mt-3 text-sm">
                High Risk Teachers:{" "}
                <span className="font-semibold text-red-600">
                  {highRisk}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
