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
  const panelClass =
    "rounded-[30px] border border-white/6 bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">
          Cluster Analytics
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          Insights & Trends
        </h1>
        <p className="mt-2 text-sm text-white/52">
          A calmer view of what teachers are asking, feeling, and using.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Top Topics</h2>
          <p className="mt-1 text-sm text-white/45">Most frequent teacher themes.</p>
          {topTopics.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {topTopics.map((item) => (
                <li
                  key={item.topic}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3 text-sm"
                >
                  <span className="text-white/72">{item.topic}</span>
                  <span className="font-semibold text-white">{item.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-sm text-white/42">No data available</p>
          )}
        </div>

        <div className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Sentiment Distribution</h2>
          <p className="mt-1 text-sm text-white/45">How teacher queries are trending emotionally.</p>
          {Object.keys(sentiment).length > 0 ? (
            <ul className="mt-5 space-y-3">
              {Object.entries(sentiment).map(([name, value]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3 text-sm"
                >
                  <span className="text-white/72">{name}</span>
                  <span className="font-semibold text-white">{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-sm text-white/42">No data available</p>
          )}
        </div>

        <div className={`${panelClass} lg:col-span-2`}>
          <h2 className="text-lg font-semibold text-white">Language Usage</h2>
          <p className="mt-1 text-sm text-white/45">Track demand across languages and regions.</p>
          {Object.keys(language).length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.entries(language).map(([name, value]) => (
                <div
                  key={name}
                  className="rounded-[24px] border border-white/5 bg-white/[0.025] p-4 text-center"
                >
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/42">
                    {name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-white/42">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
