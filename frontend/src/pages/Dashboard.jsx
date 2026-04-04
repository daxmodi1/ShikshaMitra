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
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, teachersData] = await Promise.all([
        api.getCRPAnalytics(),
        api.getCRPTeachers(),
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
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm text-white/68">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const topicData =
    analytics?.top_topics?.map((item) => ({
      name: item.topic,
      value: item.count,
    })) || [];

  const sentimentData = Object.entries(
    analytics?.sentiment_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const languageData = Object.entries(
    analytics?.language_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#8ecae6", "#f6bd60", "#ee6c4d", "#84dcc6", "#cdb4db"];

  const panelClass =
    "rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
            Cluster Overview
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/58">
            Monitor teacher activity, language usage, and classroom support patterns
            in one calm dashboard.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Search teachers, topics..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/34 focus:border-white/16 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Teachers" value={analytics?.total_teachers || 0} />
        <StatCard
          title="Active Teachers Today"
          value={analytics?.active_teachers_today || 0}
        />
        <StatCard title="Queries Today" value={analytics?.total_queries_today || 0} />
        <StatCard
          title="Avg Queries / Teacher"
          value={
            analytics?.total_teachers
              ? Math.round(
                  (teachers.reduce((sum, t) => sum + t.total_queries, 0) /
                    analytics.total_teachers) *
                    10
                ) / 10
              : 0
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Top Query Topics</h2>
          <p className="mt-1 text-sm text-white/45">
            What teachers are asking about most right now.
          </p>
          {topicData.length > 0 ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ left: 0, right: 8, bottom: 18 }}>
                  <XAxis
                    dataKey="name"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "rgba(255,255,255,0.48)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#13141a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="value" fill="#d7f9f1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-24 text-center text-sm text-white/42">No data available</p>
          )}
        </div>

        <div className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Sentiment Mix</h2>
          <p className="mt-1 text-sm text-white/45">
            Distribution across the latest teacher queries.
          </p>
          {sentimentData.length > 0 ? (
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={88}
                    label
                    labelStyle={{ fill: "rgba(255,255,255,0.62)", fontSize: 12 }}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#13141a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-24 text-center text-sm text-white/42">No data available</p>
          )}
        </div>
      </div>

      <div className={panelClass}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Language Distribution</h2>
            <p className="mt-1 text-sm text-white/45">
              Track how support demand is spreading across languages.
            </p>
          </div>
        </div>

        {languageData.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {languageData.map((lang, idx) => (
              <div
                key={idx}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-center"
              >
                <div className="text-3xl font-semibold tracking-[-0.03em] text-white">
                  {lang.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/42">
                  {lang.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-white/42">No data available</p>
        )}
      </div>

      <div className={`${panelClass} overflow-hidden p-0`}>
        <div className="border-b border-white/8 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Your Teachers</h2>
          <p className="mt-1 text-sm text-white/45">
            A quick view of teacher usage and recent activity.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="bg-white/[0.03]">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Grade",
                  "Subject",
                  "Location",
                  "Total Queries",
                  "Last Active",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4 text-sm font-medium text-white">
                    {teacher.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/58">{teacher.email}</td>
                  <td className="px-5 py-4 text-sm text-white/68">{teacher.grade}</td>
                  <td className="px-5 py-4 text-sm text-white/68">{teacher.subject}</td>
                  <td className="px-5 py-4 text-sm text-white/68">{teacher.location}</td>
                  <td className="px-5 py-4 text-sm text-white/68">
                    {teacher.total_queries}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/52">
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
    </div>
  );
}
