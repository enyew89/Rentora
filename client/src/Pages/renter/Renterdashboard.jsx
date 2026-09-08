import { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui";

function StatCard({ label, value, sub }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </GlassCard>
  );
}

function greeting(firstName) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${time}, ${firstName} 👋`;
}

const STATUS_COLORS = {
  pending: "text-yellow-400 bg-yellow-400/10",
  "in-progress": "text-neutral-300 bg-neutral-400/10",
  completed: "text-neutral-300 bg-white/10",
  open: "text-yellow-400 bg-yellow-400/10",
};

export default function RenterDashboard({ navigate, user }) {
  const [lease, setLease] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [leaseRes, maintRes] = await Promise.all([
          fetch("/api/leases/mine", { credentials: "include" }),
          fetch("/api/maintenance?limit=3", { credentials: "include" }),
        ]);

        const leaseData = await leaseRes.json();
        const maintData = await maintRes.json();

        if (leaseRes.ok) setLease(leaseData.lease || leaseData);
        if (maintRes.ok) setMaintenance(maintData.requests || maintData || []);
      } catch (err) {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="text-sm text-white/40">Loading...</div>;

  const unit = lease?.unit;
  const property = unit?.property;
  const nextPayment = lease
    ? new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {greeting(user?.firstName ?? "there")}
        </h1>
        <p className="text-sm text-white/40 mt-0.5">Here's what's going on with your rental.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-neutral-400">
          {error}
        </div>
      )}

      {/* My Home card */}
      {lease ? (
        <GlassCard
          className="p-4 cursor-pointer hover:bg-white/6 transition-colors"
          onClick={() => navigate("my-home")}
        >
          <p className="text-xs text-white/40 mb-2">My Home</p>
          <p className="text-base font-medium text-white">
            {property?.name ?? "—"} · Unit {unit?.unitNumber ?? "—"}
          </p>
          <p className="text-sm text-white/40 mt-0.5">{property?.address ?? "—"}</p>
          <p className="text-xs text-neutral-300 mt-3">View details →</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 text-center">
          <p className="text-sm text-white/40">No active lease found.</p>
        </GlassCard>
      )}

      {/* Stats row */}
      {lease && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Monthly Rent"
            value={`${Number(lease.monthlyRent).toLocaleString()} ETB`}
          />
          <StatCard
            label="Next Payment"
            value={nextPayment}
            sub="Due on the 1st"
          />
        </div>
      )}

      {/* Maintenance summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/60">Recent Maintenance</p>
          <button
            onClick={() => navigate("maintenance")}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            View all →
          </button>
        </div>

        {maintenance.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <p className="text-sm text-white/30">No maintenance requests yet.</p>
            <button
              onClick={() => navigate("new-maintenance")}
              className="text-xs text-white/50 hover:text-white mt-2 transition-colors"
            >
              + Submit a request
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {maintenance.map((req) => (
              <GlassCard
                key={req._id}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/6 transition-colors"
                onClick={() => navigate("maintenance-detail", { id: req._id })}
              >
                <div>
                  <p className="text-sm text-white font-medium">{req.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    STATUS_COLORS[req.status] ?? "text-white/40 bg-white/5"
                  }`}
                >
                  {req.status}
                </span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}