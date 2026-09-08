import { useState, useEffect } from "react";
import { GlassCard, Badge, Avatar } from "../../components/ui";

const now = new Date();

function initials(p) {
  const first = p.renter?.firstName?.[0] ?? "";
  const last = p.renter?.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function renterName(p) {
  if (p.renter?.firstName) {
    return `${p.renter.firstName} ${p.renter.lastName ?? ""}`.trim();
  }
  return "Unknown";
}

function renterUnit(p) {
  const unit = p.lease?.unit;
  if (unit?.unitNumber) {
    return `Unit ${unit.unitNumber} · ${unit.property?.name ?? ""}`;
  }
  return "";
}

function paymentLabel(p) {
  // Use dueDate to label which month this payment belongs to
  const raw = p.dueDate ?? p.paymentDate ?? p.createdAt;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div>
          <div className="h-3.5 bg-white/5 rounded w-28 mb-1.5" />
          <div className="h-3 bg-white/5 rounded w-40" />
        </div>
      </div>
      <div className="h-3.5 bg-white/5 rounded w-20" />
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payments", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  // Only show payments due this month or earlier — no future records
  const visiblePayments = payments
    .filter((p) => new Date(p.dueDate) <= now)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  // Collected this month only
  const totalCollected = visiblePayments
    .filter((p) => {
      if (p.status !== "paid") return false;
      const d = new Date(p.paymentDate ?? p.dueDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + p.amount, 0);

  // Pending = due this month or earlier and still unpaid
  const totalPending = visiblePayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-white">Payments</h1>
        <p className="text-sm text-white/40 mt-1">All rent transactions across your properties.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 border-white/20">
          <p className="text-xs text-white/40 mb-2">Collected this month</p>
          {loading ? (
            <div className="h-6 bg-white/5 rounded w-24 animate-pulse" />
          ) : (
            <p className="text-xl font-medium text-neutral-300">
              {totalCollected.toLocaleString()}{" "}
              <span className="text-sm font-normal text-white/30">ETB</span>
            </p>
          )}
        </GlassCard>
        <GlassCard className="p-4 border-neutral-500/20">
          <p className="text-xs text-white/40 mb-2">Pending</p>
          {loading ? (
            <div className="h-6 bg-white/5 rounded w-24 animate-pulse" />
          ) : (
            <p className="text-xl font-medium text-neutral-400">
              {totalPending.toLocaleString()}{" "}
              <span className="text-sm font-normal text-white/30">ETB</span>
            </p>
          )}
        </GlassCard>
      </div>

      {/* Transactions list */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Transactions</p>

        {error ? (
          <GlassCard className="p-6 text-center border-neutral-500/20">
            <p className="text-neutral-400 text-sm">Failed to load payments.</p>
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
        ) : visiblePayments.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p className="text-2xl mb-3">💳</p>
            <p className="text-sm font-medium text-white">No transactions yet</p>
            <p className="text-xs text-white/40 mt-1">Rent payments will appear here.</p>
          </GlassCard>
        ) : (
          <GlassCard className="divide-y divide-white/5 overflow-hidden">
            {visiblePayments.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar initials={initials(p)} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{renterName(p)}</p>
                    <p className="text-xs text-white/40">{renterUnit(p)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${p.status === "paid" ? "text-neutral-300" : "text-neutral-400"}`}>
                      {p.status === "paid" ? "+" : ""}{p.amount.toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-white/30">{paymentLabel(p)}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </GlassCard>
        )}
      </div>
    </div>
  );
}