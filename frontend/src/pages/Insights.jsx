import { useEffect, useState } from "react";
import api from "../services/api";

export default function Insights() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await api.getCRPAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to load insights:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading insights...</div>;
  }

  const topTopics = analytics?.top_topics || [];
  const sentiment = analytics?.sentiment_distribution || {};
  const language = analytics?.language_distribution || {};

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Insights & Trends</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Top Topics</h2>
          {topTopics.length > 0 ? (
            <ul className="space-y-2">
              {topTopics.map(item => (
                <li key={item.topic} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.topic}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Sentiment Distribution</h2>
          {Object.keys(sentiment).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(sentiment).map(([name, value]) => (
                <li key={name} className="flex justify-between text-sm">
                  <span className="text-gray-700">{name}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        {/* Language Usage */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-3">Language Usage</h2>
          {Object.keys(language).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(language).map(([name, value]) => (
                <div key={name} className="rounded-lg border border-gray-100 p-4 text-center">
                  <div className="text-xl font-semibold text-blue-600">{value}</div>
                  <div className="text-xs text-gray-600 mt-1">{name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>
    </>
  );
}
