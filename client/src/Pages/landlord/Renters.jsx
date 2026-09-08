import { useState, useEffect } from "react";
import {
  GlassCard,
  PageHeader,
  Badge,
  Avatar,
  EmptyState,
} from "../../components/ui";

function initials(r) {
  const first = r.renter?.firstName?.[0] ?? "";
  const last = r.renter?.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function renterName(r) {
  const { firstName, lastName } = r.renter ?? {};
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5" />
        <div>
          <div className="h-3.5 bg-white/5 rounded w-32 mb-1.5" />
          <div className="h-3 bg-white/5 rounded w-44" />
        </div>
      </div>
      <div className="h-5 bg-white/5 rounded-full w-14" />
    </div>
  );
}

export default function Renters({ navigate }) {
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    async function fetchRenters() {
      try {
        const res = await fetch(`${BASE_URL}/renters`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch renters");
        const data = await res.json();
        setRenters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRenters();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Renters"
        subtitle={
          loading
            ? "Loading..."
            : `${renters.length} active renter${renters.length !== 1 ? "s" : ""}`
        }
      />

      {error ? (
        <GlassCard className="p-6 text-center border-neutral-500/20">
          <p className="text-neutral-400 text-sm">Failed to load renters.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-white/40 hover:text-white mt-2 transition-colors"
          >
            Try again
          </button>
        </GlassCard>
      ) : loading ? (
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </GlassCard>
      ) : renters.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No renters yet"
          description="Renters appear here once they accept a unit invitation."
        />
      ) : (
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {renters.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() =>
                navigate("unit-detail", {
                  propertyId: r.unit?.property?._id,
                  unitId: r.unit?._id,
                })
              }
            >
              <div className="flex items-center gap-3">
                <Avatar initials={initials(r)} />
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">
                    {renterName(r)}
                  </p>
                  <p className="text-xs text-white/40">
                    {r.unit?.property?.name ?? "—"} · Unit{" "}
                    {r.unit?.unitNumber ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white/70">
                    {(
                      r.unit?.rentAmount ??
                      r.lease?.monthlyRent ??
                      0
                    ).toLocaleString()}{" "}
                    ETB
                  </p>
                  <p className="text-xs text-white/30">per month</p>
                </div>
                <Badge status={r.lastPayment?.status ?? "pending"} />
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
