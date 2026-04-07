export default function StatCard({ title, value }) {
  return (
    <div className="rounded-[28px] border border-white/6 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">
        {title}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
        {value}
      </div>
    </div>
  );
}
