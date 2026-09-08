import { useState } from "react";

const stats = [
  { label: "Properties", value: "3", sub: "All active" },
  { label: "Total units", value: "24", sub: null },
  { label: "Occupied", value: "19", sub: "of 24 units", color: "text-neutral-300" },
  { label: "Vacant", value: "5", sub: "available now", color: "text-neutral-400" },
];

const payments = [
  { initials: "AB", name: "Abebe Bekele", unit: "Unit 4B · Bole Heights", amount: "4,500", date: "Today" },
  { initials: "HG", name: "Hiwot Girma", unit: "Unit 2A · Kazanchis Plaza", amount: "5,200", date: "Yesterday" },
  { initials: "YT", name: "Yonas Tadesse", unit: "Unit 7C · Megenagna Apt.", amount: "6,000", date: "Jul 20" },
];

const maintenance = [
  { icon: "💧", title: "Pipe leak", unit: "Unit 3A · Bole Heights", status: "Open" },
  { icon: "⚡", title: "Electrical issue", unit: "Unit 6B · Kazanchis Plaza", status: "In progress" },
  { icon: "🚪", title: "Door lock repair", unit: "Unit 1D · Megenagna Apt.", status: "Done" },
];

const statusStyle = {
  Open: "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
  "In progress": "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
  Done: "bg-white/10 text-neutral-300 border border-white/20",
};

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandlordDashboard() {
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllMaintenance, setShowAllMaintenance] = useState(false);

  const occupancyPct = Math.round((19 / 24) * 100);

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      {/* Ambient orb */}
      <div className="pointer-events-none fixed top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.04] rounded-full blur-[100px]" />

      <div className="relative max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium text-white">Good morning 👋</h1>
          <p className="text-sm text-white/40 mt-1">Here's what's happening across your properties.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <GlassCard key={s.label} className="p-4">
              <p className="text-xs text-white/40 mb-2">{s.label}</p>
              <p className={`text-2xl font-medium ${s.color ?? "text-white"}`}>{s.value}</p>
              {s.sub && <p className="text-xs text-white/30 mt-1">{s.sub}</p>}
            </GlassCard>
          ))}
        </div>

        {/* Occupancy bar */}
        <GlassCard className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white/80">Occupancy rate</span>
            <span className="text-sm text-white/40">{occupancyPct}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-400 rounded-full transition-all duration-700"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/30">19 occupied</span>
            <span className="text-xs text-white/30">5 vacant</span>
          </div>
        </GlassCard>

        {/* Finance cards */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4 border-white/20">
            <p className="text-xs text-white/40 mb-2">Rent collected</p>
            <p className="text-xl font-medium text-neutral-300">
              85,000 <span className="text-sm font-normal text-white/40">ETB</span>
            </p>
          </GlassCard>
          <GlassCard className="p-4 border-neutral-500/20">
            <p className="text-xs text-white/40 mb-2">Pending rent</p>
            <p className="text-xl font-medium text-neutral-400">
              15,000 <span className="text-sm font-normal text-white/40">ETB</span>
            </p>
          </GlassCard>
        </div>

        {/* Recent Payments */}
        <div>
          <p className="text-sm font-medium text-white/60 mb-2">Recent payments</p>
          <GlassCard className="overflow-hidden divide-y divide-white/5">
            {payments.map((p) => (
              <div key={p.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-500/20 text-neutral-400 text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {p.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-white/40">{p.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-300">+{p.amount} ETB</p>
                  <p className="text-xs text-white/30">{p.date}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowAllPayments(!showAllPayments)}
              className="w-full py-3 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {showAllPayments ? "Show less" : "View all payments →"}
            </button>
          </GlassCard>
        </div>

        {/* Maintenance Requests */}
        <div>
          <p className="text-sm font-medium text-white/60 mb-2">Recent maintenance</p>
          <GlassCard className="overflow-hidden divide-y divide-white/5">
            {maintenance.map((m) => (
              <div key={m.title} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.title}</p>
                    <p className="text-xs text-white/40">{m.unit}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[m.status]}`}>
                  {m.status}
                </span>
              </div>
            ))}
            <button
              onClick={() => setShowAllMaintenance(!showAllMaintenance)}
              className="w-full py-3 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {showAllMaintenance ? "Show less" : "View all requests →"}
            </button>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}