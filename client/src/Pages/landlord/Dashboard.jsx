import { useState, useEffect } from "react";
import { StatCard, GlassCard, Badge, Avatar } from "../../components/ui";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function apiFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
      </div>
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
      <div className="h-40 bg-white/5 rounded-xl" />
      <div className="h-40 bg-white/5 rounded-xl" />
    </div>
  );
}

export default function Dashboard({ navigate }) {
  const [properties,  setProperties]  = useState([]);
  const [units,       setUnits]       = useState([]);
  const [payments,    setPayments]    = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [props, allUnits, pays, maint] = await Promise.all([
          apiFetch("/properties"),
          apiFetch("/units/all"),
          apiFetch("/payments"),
          apiFetch("/maintenance"),
        ]);
        setProperties(props);
        setUnits(allUnits);
        setPayments(pays);
        setMaintenance(maint);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="text-center py-20 text-red-400 text-sm">
      Failed to load dashboard: {error}
    </div>
  );

  // ── derived numbers ──────────────────────────────────────────────
  const totalUnits   = units.length;
  const occupied     = units.filter((u) => u.status === "occupied").length;
  const vacant       = units.filter((u) => u.status === "available").length;
  const occupancyPct = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;

  const collected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pending = payments
    .filter((p) => p.status === "pending" || p.status === "late")
    .reduce((sum, p) => sum + p.amount, 0);

  const recentPayments    = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).slice(0, 3);
  const recentMaintenance = [...maintenance].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Properties",  value: String(properties.length) },
    { label: "Total units", value: String(totalUnits) },
    { label: "Occupied",    value: String(occupied), sub: `of ${totalUnits} units`, color: "text-emerald-400" },
    { label: "Vacant",      value: String(vacant),   sub: "available now",          color: "text-amber-400"  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-white">{greeting}, Enyew 👋</h1>
        <p className="text-sm text-white/40 mt-1">Here's an overview of your properties.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Occupancy bar */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-white/80">Occupancy rate</span>
          <span className="text-sm text-white/40">{occupancyPct}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/30">{occupied} occupied</span>
          <span className="text-xs text-white/30">{vacant} vacant</span>
        </div>
      </GlassCard>

      {/* Finance cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 border-emerald-500/20">
          <p className="text-xs text-white/40 mb-2">Rent collected</p>
          <p className="text-xl font-medium text-emerald-400">
            {collected.toLocaleString()} <span className="text-sm font-normal text-white/30">ETB</span>
          </p>
        </GlassCard>
        <GlassCard className="p-4 border-amber-500/20">
          <p className="text-xs text-white/40 mb-2">Pending rent</p>
          <p className="text-xl font-medium text-amber-400">
            {pending.toLocaleString()} <span className="text-sm font-normal text-white/30">ETB</span>
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

        {recentPayments.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-white/30">No payments recorded yet.</GlassCard>
        ) : (
          <GlassCard className="divide-y divide-white/5">
            {recentPayments.map((p) => {
              const renterName = `${p.renter?.firstName ?? ""} ${p.renter?.lastName ?? ""}`.trim() || p.renter?.email || "—";
              const unitLabel  = p.lease?.unit?.unitNumber ? `Unit ${p.lease.unit.unitNumber}` : "—";
              return (
                <div key={p._id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={initials(renterName)} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{renterName}</p>
                      <p className="text-xs text-white/40">{unitLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">+{p.amount.toLocaleString()} ETB</p>
                    <p className="text-xs text-white/30">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        )}
      </div>

      {/* Recent Maintenance */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/60">Recent maintenance</p>
          <button onClick={() => navigate("maintenance")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </button>
        </div>

        {recentMaintenance.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-white/30">No maintenance requests yet.</GlassCard>
        ) : (
          <GlassCard className="divide-y divide-white/5">
            {recentMaintenance.map((m) => (
              <div key={m._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{m.title}</p>
                  <p className="text-xs text-white/40">{m.unit?.unitNumber ? `Unit ${m.unit.unitNumber}` : "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/30">{new Date(m.createdAt).toLocaleDateString()}</span>
                  <Badge status={m.status} />
                </div>
              </div>
            ))}
          </GlassCard>
        )}
      </div>
    </div>
  );
}