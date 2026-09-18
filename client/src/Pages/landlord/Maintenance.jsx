import { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "text-amber-400 bg-amber-400/15" },
  { value: "in-progress", label: "In progress", color: "text-blue-400 bg-blue-400/15" },
  { value: "completed", label: "Completed", color: "text-emerald-400 bg-emerald-400/15" },
  { value: "rejected", label: "Rejected", color: "text-red-400 bg-red-400/15" },
];

const PRIORITY_STYLES = {
  low: "text-white/50",
  medium: "text-amber-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

function getStatusStyle(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color ?? "text-white/40 bg-white/5";
}

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchMaintenance(); }, []);

  async function fetchMaintenance() {
    try {
      setLoading(true);
      const res = await fetch("/api/maintenance", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch maintenance requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    "in-progress": requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-white">Maintenance</h1>
          <p className="text-base text-white/60 mt-1">Track and manage repair requests.</p>
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

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-white">Maintenance</h1>
          <p className="text-base text-white/60 mt-1">Track and manage repair requests.</p>
        </div>
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchMaintenance} className="text-sm text-blue-400 hover:text-blue-300 mt-2 transition-colors">
            Try again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Maintenance</h1>
        <p className="text-base text-white/60 mt-1">Track and manage repair requests.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center" accent="amber">
          <p className="text-2xl font-medium text-amber-400">{counts.pending}</p>
          <p className="text-sm text-white/50 mt-1">Pending</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" accent="blue">
          <p className="text-2xl font-medium text-blue-400">{counts["in-progress"]}</p>
          <p className="text-sm text-white/50 mt-1">In progress</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" accent="green">
          <p className="text-2xl font-medium text-emerald-400">{counts.completed}</p>
          <p className="text-sm text-white/50 mt-1">Completed</p>
        </GlassCard>
      </div>

      <div>
        <p className="text-base font-semibold text-white/80 mb-2">All requests</p>
        {requests.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p className="text-2xl mb-3">"🔧"</p>
            <p className="text-base font-medium text-white">No requests yet</p>
            <p className="text-sm text-white/50 mt-1">
              Maintenance requests from your renters will appear here.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {requests.map((m) => {
              const isExpanded = expandedId === m._id;
              const renterName = m.renter
                ? [m.renter.firstName, m.renter.lastName].filter(Boolean).join(" ") || "Renter"
                : "Renter";

              return (
                <GlassCard key={m._id} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : m._id)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base shrink-0">
                        {m.title?.toLowerCase().includes("leak") ? "💧" : m.title?.toLowerCase().includes("electr") ? "⚡" : "🔧"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-white truncate">{m.title}</p>
                        <p className="text-sm text-white/50">
                          {renterName}
                          {m.unit?.unitNumber && " · Unit " + m.unit.unitNumber}
                          {m.unit?.property?.name && " · " + m.unit.property.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-sm text-white/40 hidden sm:block">
                        {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(m.status)}`}>
                        {getStatusLabel(m.status)}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                      <div>
                        <p className="text-sm text-white/40 mb-1">Description</p>
                        <p className="text-base text-white/80">{m.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-white/40">Priority: </span>
                          <span className={`font-medium capitalize ${PRIORITY_STYLES[m.priority] ?? ""}`}>
                            {m.priority}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40">Submitted: </span>
                          <span className="text-white/70">
                            {new Date(m.createdAt).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })}
                          </span>
                        </div>
                        {m.renter?.phoneNumber && (
                          <div>
                            <span className="text-white/40">Phone: </span>
                            <span className="text-white/70">{m.renter.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      {m.renter?.username && (
                        <div className="flex gap-2">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.renter.username)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                          >
                            "✉" Email renter
                          </a>
                          {m.renter.phoneNumber && (
                            <a
                              href={`https://wa.me/${m.renter.phoneNumber.replace(/[^0-9]/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 rounded-lg border border-white/8 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                            >
                            "💬" WhatsApp
                            </a>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white/40 mb-2">Update status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              disabled={m.status === opt.value || updatingId === m._id}
                              onClick={() => updateStatus(m._id, opt.value)}
                              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                                m.status === opt.value
                                  ? `${opt.color} ring-1 ring-white/20`
                                  : "text-white/40 bg-white/5 hover:bg-white/10 hover:text-white/70"
                              } disabled:opacity-50`}
                            >
                              {updatingId === m._id ? "..." : opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}