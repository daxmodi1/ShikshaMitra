export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mt-2">
        {value}
      </div>
    </div>
  );
}
