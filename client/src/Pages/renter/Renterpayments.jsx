import { useEffect, useState } from "react";
import { GlassCard, PageHeader, PrimaryButton } from "../../components/ui";

const STATUS_STYLES = {
  paid: "text-neutral-300 bg-white/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  overdue: "text-neutral-300 bg-neutral-400/10",
};

export default function RenterPayments() {
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [leaseRes, paymentsRes] = await Promise.all([
          fetch("/api/leases/mine", { credentials: "include" }),
          fetch("/api/payments/mine", { credentials: "include" }),
        ]);

        const leaseData = await leaseRes.json();
        const paymentsData = await paymentsRes.json();

        if (leaseRes.ok) setLease(leaseData.lease || leaseData);
        if (paymentsRes.ok) setPayments(paymentsData.payments || paymentsData || []);
      } catch (err) {
        setError("Failed to load payment data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const now = new Date();

  // Next payment = earliest pending/overdue payment due this month or earlier
  const nextPayment = payments
    .filter((p) => (p.status === "pending" || p.status === "overdue") && new Date(p.dueDate) <= now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const nextDueDateLabel = nextPayment?.dueDate
    ? new Date(nextPayment.dueDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // History = only payments whose dueDate is this month or earlier (not future months)
  const visiblePayments = payments
    .filter((p) => new Date(p.dueDate) <= now)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)); // newest first

  async function handlePayRent() {
    if (!nextPayment) return;
    setPaying(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId: nextPayment._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not start payment.");

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  }

  if (loading) return <div className="text-base text-white/60">Loading...</div>;

  return (
    <div className="space-y-5 max-w-lg">
      <PageHeader title="Payments" subtitle="Manage your rent payments" />

      {error && (
        <div className="p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-neutral-400">
          {error}
        </div>
      )}

      {/* Current rent due */}
      {lease ? (
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Monthly Rent</p>
              <p className="text-2xl font-semibold text-white">
                {Number(nextPayment?.amount ?? lease.monthlyRent).toLocaleString()} ETB
              </p>
              {nextDueDateLabel ? (
                <p className="text-sm text-white/50 mt-1">Due {nextDueDateLabel}</p>
              ) : (
                <p className="text-sm text-neutral-200/70 mt-1">No payment due</p>
              )}
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                nextPayment
                  ? STATUS_STYLES[nextPayment.status] ?? "text-white/40 bg-white/5"
                  : "text-neutral-300 bg-white/10"
              }`}
            >
              {nextPayment?.status ?? "Up to date"}
            </span>
          </div>

          <PrimaryButton
            onClick={handlePayRent}
            className="w-full"
            disabled={paying || !nextPayment}
          >
            {paying
              ? "Redirecting to Chapa…"
              : nextPayment
              ? `Pay ${Number(nextPayment.amount).toLocaleString()} ETB`
              : "No Payment Due"}
          </PrimaryButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 text-center">
          <p className="text-base text-white/60">No active lease found.</p>
        </GlassCard>
      )}

      {/* Payment history — only shows current month and earlier */}
      <div>
        <p className="text-base font-semibold text-white/80 mb-3">Payment History</p>

        {visiblePayments.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <p className="text-base text-white/50">No payments recorded yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {visiblePayments.map((p) => {
              // Use dueDate as the label — it represents which month this payment is for
              const label = new Date(p.dueDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });

              return (
                <GlassCard key={p._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-base text-white font-medium">{label}</p>
                    <p className="text-sm text-white/50 mt-0.5">
                      {Number(p.amount ?? lease?.monthlyRent).toLocaleString()} ETB
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      STATUS_STYLES[p.status] ?? "text-white/40 bg-white/5"
                    }`}
                  >
                    {p.status}
                  </span>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}