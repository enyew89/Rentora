import { useEffect, useState } from "react";
import { GlassCard, PageHeader, PrimaryButton } from "../../components/ui";

const STATUS_STYLES = {
  open: "text-yellow-400 bg-yellow-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  "in-progress": "text-neutral-300 bg-neutral-400/10",
  completed: "text-neutral-300 bg-white/10",
  closed: "text-white/30 bg-white/5",
};

const PRIORITY_STYLES = {
  low: "text-white/30",
  medium: "text-yellow-400",
  high: "text-neutral-400",
  urgent: "text-neutral-400",
};

export default function RenterMaintenance({ navigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/maintenance/mine", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load requests.");
        setRequests(data.requests || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) return <div className="text-sm text-white/40">Loading...</div>;

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Maintenance"
          subtitle="Track and submit maintenance requests."
        />
        <PrimaryButton onClick={() => navigate("new-maintenance")} className="shrink-0">
          + New
        </PrimaryButton>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-neutral-400">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <GlassCard className="p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-xl">
            🔧
          </div>
          <p className="text-sm font-medium text-white mb-1">No requests yet</p>
          <p className="text-xs text-white/40 mb-4">
            Submit a request and your landlord will be notified.
          </p>
          <PrimaryButton onClick={() => navigate("new-maintenance")}>
            Submit a request
          </PrimaryButton>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <GlassCard
              key={req._id}
              className="p-4 cursor-pointer hover:bg-white/6 transition-colors"
              onClick={() => navigate("maintenance-detail", { id: req._id })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{req.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    Submitted{" "}
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {req.priority && (
                      <span className={`ml-2 font-medium ${PRIORITY_STYLES[req.priority] ?? ""}`}>
                        · {req.priority}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                    STATUS_STYLES[req.status] ?? "text-white/40 bg-white/5"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}