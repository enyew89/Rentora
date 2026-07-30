import { useState, useEffect } from "react";
import { GlassCard, PageHeader, Badge, Avatar, EmptyState } from "../../components/ui";

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchRenters() {
      try {
        const res = await fetch("/api/renters", { credentials: "include" });
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

  // ── Helper: pull fields whether the API returns flat or nested objects ───
  function renterName(r)     { return r.name ?? r.user?.name ?? "Unknown"; }
  function renterEmail(r)    { return r.email ?? r.user?.email ?? ""; }
  function unitNumber(r)     { return r.unitNumber ?? r.unit?.unitNumber ?? "—"; }
  function propertyName(r)   { return r.propertyName ?? r.unit?.property?.name ?? "Unknown"; }
  function rentAmount(r)     { return r.rentAmount ?? r.unit?.rentAmount ?? 0; }
  function propertyId(r)     { return r.propertyId ?? r.unit?.property?._id ?? ""; }
  function unitId(r)         { return r.unitId ?? r.unit?._id ?? ""; }
  function paymentStatus(r)  { return r.paymentStatus ?? r.lastPayment?.status ?? "Pending"; }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Renters"
        subtitle={loading ? "Loading..." : `${renters.length} active renter${renters.length !== 1 ? "s" : ""}`}
      />

      {error ? (
        <GlassCard className="p-6 text-center border-red-500/20">
          <p className="text-red-400 text-sm">Failed to load renters.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-white/40 hover:text-white mt-2 transition-colors"
          >
            Try again
          </button>
        </GlassCard>
      ) : loading ? (
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
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
              key={r._id ?? r.unitId}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => navigate("unit-detail", { propertyId: propertyId(r), unitId: unitId(r) })}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={initials(renterName(r))} />
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {renterName(r)}
                  </p>
                  <p className="text-xs text-white/40">
                    {propertyName(r)} · Unit {unitNumber(r)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white/70">{rentAmount(r).toLocaleString()} ETB</p>
                  <p className="text-xs text-white/30">per month</p>
                </div>
                <Badge status={paymentStatus(r)} />
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}