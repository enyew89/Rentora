import { useEffect, useState } from "react";
import { GlassCard, BackButton } from "../../components/ui";

const STEPS = ["open", "in-progress", "completed"];

const STEP_LABELS = {
  open: "Request submitted",
  "in-progress": "In progress",
  completed: "Completed",
};

const STATUS_STYLES = {
  open: "text-yellow-400 bg-yellow-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  "in-progress": "text-neutral-300 bg-neutral-400/10",
  completed: "text-neutral-300 bg-white/10",
};

const PRIORITY_STYLES = {
  low: "text-white/40",
  medium: "text-yellow-400",
  high: "text-neutral-400",
  urgent: "text-neutral-400",
};

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

export default function MaintenanceDetail({ navigate, params }) {
  const id = params?.id;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Request ID missing.");
      setLoading(false);
      return;
    }

    async function fetchRequest() {
      try {
        const res = await fetch(`/api/maintenance/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load request.");
        setRequest(data.request || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRequest();
  }, [id]);

  if (loading) return <div className="text-sm text-white/40">Loading...</div>;

  if (error || !request) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => navigate("maintenance")} label="Maintenance" />
        <div className="text-sm text-red-400">{error || "Request not found."}</div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(request.status);

  return (
    <div className="space-y-5 max-w-lg">
      <BackButton onClick={() => navigate("maintenance")} label="Maintenance" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">{request.title}</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Submitted{" "}
            {new Date(request.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            STATUS_STYLES[request.status] ?? "text-white/40 bg-white/5"
          }`}
        >
          {request.status}
        </span>
      </div>

      {/* Details */}
      <GlassCard className="p-4">
        {request.priority && (
          <Row
            label="Priority"
            value={
              <span className={PRIORITY_STYLES[request.priority] ?? ""}>
                {request.priority}
              </span>
            }
          />
        )}
        <Row label="Unit" value={`Unit ${request.unit?.unitNumber ?? "—"}`} />
        <Row label="Property" value={request.unit?.property?.name ?? "—"} />
      </GlassCard>

      {/* Description */}
      {request.description && (
        <div>
          <p className="text-sm font-medium text-white/60 mb-2">Description</p>
          <GlassCard className="p-4">
            <p className="text-sm text-white/70 leading-relaxed">{request.description}</p>
          </GlassCard>
        </div>
      )}

      {/* Status timeline */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-3">Progress</p>
        <GlassCard className="p-4">
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      done
                        ? active
                          ? "bg-neutral-400 text-white"
                          : "bg-white text-black"
                        : "bg-white/8 text-white/20"
                    }`}
                  >
                    {done && !active ? "✓" : i + 1}
                  </div>
                  <p className={`text-sm ${done ? "text-white" : "text-white/30"}`}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Landlord notes */}
      {request.landlordNotes && (
        <div>
          <p className="text-sm font-medium text-white/60 mb-2">Landlord Notes</p>
          <GlassCard className="p-4">
            <p className="text-sm text-white/70 leading-relaxed">{request.landlordNotes}</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}