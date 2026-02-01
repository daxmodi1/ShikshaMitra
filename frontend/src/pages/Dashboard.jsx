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
  Cell,
  ResponsiveContainer
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
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-600">Cluster Resource Person Dashboard</p>
          </div>
          <div className="w-full max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teachers, topics..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Topics Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Top Query Topics</h2>
          {topicData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ left: 8, right: 8, bottom: 24 }}>
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Query Sentiment Distribution</h2>
          {sentimentData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
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
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Language Distribution</h2>
        {languageData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {languageData.map((lang, idx) => (
              <div key={idx} className="rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-2xl font-semibold text-blue-600">{lang.value}</div>
                <div className="text-xs text-gray-600 mt-1">{lang.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No data available</p>
        )}
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Your Teachers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Queries</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{teacher.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{teacher.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teacher.grade}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teacher.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teacher.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teacher.total_queries}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
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
