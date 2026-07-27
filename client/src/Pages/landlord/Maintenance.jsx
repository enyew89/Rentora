import { GlassCard, PageHeader, Badge } from "../../components/ui";
import { mockMaintenance } from "../../lib/mockData";

const icons = { "Pipe leak": "💧", "Electrical issue": "⚡", "Door lock repair": "🚪" };

const counts = {
  Open:        mockMaintenance.filter((m) => m.status === "Open").length,
  "In progress": mockMaintenance.filter((m) => m.status === "In progress").length,
  Done:        mockMaintenance.filter((m) => m.status === "Done").length,
};

export default function Maintenance() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-white">Maintenance</h1>
        <p className="text-sm text-white/40 mt-1">Track and manage repair requests.</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center border-red-500/20">
          <p className="text-2xl font-medium text-red-400">{counts["Open"]}</p>
          <p className="text-xs text-white/40 mt-1">Open</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-blue-500/20">
          <p className="text-2xl font-medium text-blue-400">{counts["In progress"]}</p>
          <p className="text-xs text-white/40 mt-1">In progress</p>
        </GlassCard>
        <GlassCard className="p-4 text-center border-emerald-500/20">
          <p className="text-2xl font-medium text-emerald-400">{counts["Done"]}</p>
          <p className="text-xs text-white/40 mt-1">Done</p>
        </GlassCard>
      </div>

      {/* Requests list */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">All requests</p>
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {mockMaintenance.map((m) => (
            <div key={m._id} className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                  {icons[m.title] ?? "🔧"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.title}</p>
                  <p className="text-xs text-white/40">{m.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 hidden sm:block">{m.date}</span>
                <Badge status={m.status} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}