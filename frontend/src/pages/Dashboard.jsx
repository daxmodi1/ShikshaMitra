import crp from "../data/crp.json";
import schools from "../data/schools.json";
import teachers from "../data/teachers.json";
import alerts from "../data/alerts.json";
import StatCard from "../components/Statcard";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  // Derived metrics (NO hardcoding)
  const activeTeachers = teachers.filter(
    t => t.monthlyQueries > 0
  ).length;

  const riskData = [
    {
      name: "High",
      value: teachers.filter(t => t.riskLevel === "High").length
    },
    {
      name: "Medium",
      value: teachers.filter(t => t.riskLevel === "Medium").length
    },
    {
      name: "Low",
      value: teachers.filter(t => t.riskLevel === "Low").length
    }
  ];

  const issueCount = {};
  teachers.forEach(t => {
    t.commonIssues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
  });

  const issueData = Object.keys(issueCount).map(key => ({
    name: key,
    value: issueCount[key]
  }));

  const COLORS = ["#1d4ed8", "#f59e0b", "#dc2626", "#16a34a"];

  return (
    <>
      {/* CRP Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome, {crp.name}
        </h1>
        <p className="text-gray-600">
          Cluster Resource Person | {crp.block}, {crp.district},{" "}
          {crp.state}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Schools Under CRP" value={schools.length} />
        <StatCard title="Total Teachers" value={teachers.length} />
        <StatCard title="Active Teachers (Monthly)" value={activeTeachers} />
        <StatCard title="High Priority Alerts" value={alerts.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Risk Level Bar Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Teachers by Risk Level
          </h2>
          <BarChart width={400} height={250} data={riskData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1d4ed8" />
          </BarChart>
        </div>

        {/* Issue Distribution Pie Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Common Classroom Issues
          </h2>
          <PieChart width={400} height={250}>
            <Pie
              data={issueData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {issueData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </>
  );
}
