import { useEffect, useState } from "react";
import api from "../services/api";
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
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, teachersData] = await Promise.all([
        api.getCRPAnalytics(),
        api.getCRPTeachers()
      ]);
      setAnalytics(analyticsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // Prepare chart data
  const topicData = analytics?.top_topics?.map(item => ({
    name: item.topic,
    value: item.count
  })) || [];

  const sentimentData = Object.entries(analytics?.sentiment_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const languageData = Object.entries(analytics?.language_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#1d4ed8", "#f59e0b", "#dc2626", "#16a34a", "#8b5cf6"];

  return (
    <>
      {/* CRP Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-600">
          Cluster Resource Person Dashboard
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Teachers" value={analytics?.total_teachers || 0} />
        <StatCard title="Active Teachers Today" value={analytics?.active_teachers_today || 0} />
        <StatCard title="Queries Today" value={analytics?.total_queries_today || 0} />
        <StatCard 
          title="Avg Queries/Teacher" 
          value={analytics?.total_teachers ? 
            Math.round((teachers.reduce((sum, t) => sum + t.total_queries, 0) / analytics.total_teachers) * 10) / 10 : 0
          } 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top Topics Bar Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Top Query Topics
          </h2>
          {topicData.length > 0 ? (
            <BarChart width={400} height={250} data={topicData}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1d4ed8" />
            </BarChart>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Query Sentiment Distribution
          </h2>
          {sentimentData.length > 0 ? (
            <PieChart width={400} height={250}>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {sentimentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">Language Distribution</h2>
        {languageData.length > 0 ? (
          <div className="flex gap-4 justify-center">
            {languageData.map((lang, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{lang.value}</div>
                <div className="text-sm text-gray-600">{lang.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No data available</p>
        )}
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Your Teachers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Queries</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{teacher.name}</td>
                  <td className="px-4 py-3 text-sm">{teacher.email}</td>
                  <td className="px-4 py-3 text-sm">{teacher.grade}</td>
                  <td className="px-4 py-3 text-sm">{teacher.subject}</td>
                  <td className="px-4 py-3 text-sm">{teacher.location}</td>
                  <td className="px-4 py-3 text-sm">{teacher.total_queries}</td>
                  <td className="px-4 py-3 text-sm">
                    {teacher.last_active 
                      ? new Date(teacher.last_active).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
