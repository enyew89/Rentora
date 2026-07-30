import { useState, useEffect } from "react";
import { GlassCard, Badge } from "../../components/ui";

const icons = {
  "Pipe leak": "💧",
  "Electrical issue": "⚡",
  "Door lock repair": "🚪",
};

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const res = await fetch("/api/maintenance", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch maintenance requests");

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMaintenance();
  }, []);

  const counts = {
    Open: requests.filter((m) => m.status === "Open").length,
    "In progress": requests.filter((m) => m.status === "In progress").length,
    Done: requests.filter((m) => m.status === "Done").length,
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-medium text-white">Maintenance</h1>
          <p className="text-sm text-white/40 mt-1">Track and manage repair requests.</p>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-medium text-white">Maintenance</h1>
          <p className="text-sm text-white/40 mt-1">Track and manage repair requests.</p>
        </div>
        <GlassCard className="p-6 text-center border-red-500/20">
          <p className="text-red-400 text-sm">Failed to load maintenance requests.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-white/40 hover:text-white mt-2 transition-colors"
          >
            Try again
          </button>
        </GlassCard>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
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

        {requests.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p className="text-2xl mb-3">🔧</p>
            <p className="text-sm font-medium text-white">No requests yet</p>
            <p className="text-xs text-white/40 mt-1">Maintenance requests from your renters will appear here.</p>
          </GlassCard>
        ) : (
          <GlassCard className="divide-y divide-white/5 overflow-hidden">
            {requests.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                    {icons[m.title] ?? "🔧"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.title}</p>
                    {/* Supports either a nested unit object or a plain string */}
                    <p className="text-xs text-white/40">
                      {m.unit?.unitNumber
                        ? `Unit ${m.unit.unitNumber} · ${m.unit.property?.name ?? ""}`
                        : m.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/30 hidden sm:block">
                    {new Date(m.createdAt ?? m.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
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