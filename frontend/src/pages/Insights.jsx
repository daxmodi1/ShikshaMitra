import insights from "../data/insights.json";

export default function Insights() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">
        Insights & Trends
      </h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Issues */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Top Issues</h2>
          <ul className="space-y-2">
            {insights.topIssues.map(issue => (
              <li
                key={issue.issue}
                className="flex justify-between"
              >
                <span>{issue.issue}</span>
                <span className="font-semibold">
                  {issue.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Queries by Grade */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">
            Queries by Grade
          </h2>
          <ul className="space-y-2">
            {insights.queriesByGrade.map(g => (
              <li
                key={g.grade}
                className="flex justify-between"
              >
                <span>Grade {g.grade}</span>
                <span className="font-semibold">
                  {g.queries}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Language Usage */}
        <div className="bg-white p-4 rounded shadow col-span-2">
          <h2 className="font-semibold mb-3">
            Language Usage
          </h2>
          <div className="flex gap-6">
            <div>
              Hindi Queries:{" "}
              <span className="font-semibold">
                {insights.languageUsage.Hindi}%
              </span>
            </div>
            <div>
              English Queries:{" "}
              <span className="font-semibold">
                {insights.languageUsage.English}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
