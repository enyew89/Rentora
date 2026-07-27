import { StatCard, GlassCard, Badge, Avatar, PageHeader } from "../../components/ui";
import { mockPayments, mockMaintenance } from "../../lib/mockData";

// ─── Summary stats ─────────────────────────────────────────────────────────
const stats = [
  { label: "Properties",  value: "3",  sub: null },
  { label: "Total units", value: "24", sub: null },
  { label: "Occupied",    value: "19", sub: "of 24 units", color: "text-emerald-400" },
  { label: "Vacant",      value: "5",  sub: "available now", color: "text-amber-400" },
];

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Dashboard({ navigate }) {
  const occupancyPct = Math.round((19 / 24) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-white">Good morning, Enyew 👋</h1>
        <p className="text-sm text-white/40 mt-1">Here's an overview of your properties.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Occupancy bar */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-white/80">Occupancy rate</span>
          <span className="text-sm text-white/40">{occupancyPct}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${occupancyPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/30">19 occupied</span>
          <span className="text-xs text-white/30">5 vacant</span>
        </div>
      </GlassCard>

      {/* Finance cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 border-emerald-500/20">
          <p className="text-xs text-white/40 mb-2">Rent collected</p>
          <p className="text-xl font-medium text-emerald-400">
            85,000 <span className="text-sm font-normal text-white/30">ETB</span>
          </p>
        </GlassCard>
        <GlassCard className="p-4 border-amber-500/20">
          <p className="text-xs text-white/40 mb-2">Pending rent</p>
          <p className="text-xl font-medium text-amber-400">
            15,000 <span className="text-sm font-normal text-white/30">ETB</span>
          </p>
        </GlassCard>
      </div>

      {/* Recent Payments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/60">Recent payments</p>
          <button onClick={() => navigate("payments")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>
        <GlassCard className="divide-y divide-white/5">
          {mockPayments.slice(0, 3).map((p) => (
            <div key={p._id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar initials={initials(p.renter)} size="sm" />
                <div>
                  <p className="text-sm font-medium text-white">{p.renter}</p>
                  <p className="text-xs text-white/40">{p.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-400">+{p.amount.toLocaleString()} ETB</p>
                <p className="text-xs text-white/30">{p.date}</p>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Recent Maintenance */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/60">Recent maintenance</p>
          <button onClick={() => navigate("maintenance")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>
        <GlassCard className="divide-y divide-white/5">
          {mockMaintenance.map((m) => (
            <div key={m._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{m.title}</p>
                <p className="text-xs text-white/40">{m.unit}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30">{m.date}</span>
                <Badge status={m.status} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}