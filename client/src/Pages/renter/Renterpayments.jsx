import { useEffect, useState } from "react";
import { GlassCard, PageHeader, PrimaryButton } from "../../components/ui";

const STATUS_STYLES = {
  paid: "text-emerald-400 bg-emerald-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  overdue: "text-red-400 bg-red-400/10",
};

export default function RenterPayments() {
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  async function handlePayRent() {
    setPaying(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaseId: lease._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed.");

      setSuccessMsg("Payment recorded successfully.");
      setPayments((prev) => [data.payment || data, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="text-sm text-white/40">Loading...</div>;

  const nextPayment = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  ).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-5 max-w-lg">
      <PageHeader title="Payments" subtitle="Manage your rent payments" />

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Current rent due */}
      {lease ? (
        <GlassCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Monthly Rent</p>
              <p className="text-2xl font-semibold text-white">
                {Number(lease.monthlyRent).toLocaleString()} ETB
              </p>
              <p className="text-xs text-white/30 mt-1">Next payment due {nextPayment}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 font-medium">
              Pending
            </span>
          </div>

          <PrimaryButton onClick={handlePayRent} className="w-full" disabled={paying}>
            {paying ? "Processing..." : "Pay Rent"}
          </PrimaryButton>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 text-center">
          <p className="text-sm text-white/40">No active lease found.</p>
        </GlassCard>
      )}

      {/* Payment history */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-3">Payment History</p>

        {payments.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <p className="text-sm text-white/30">No payments recorded yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => {
              const date = p.paymentDate || p.createdAt;
              const label = date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—";

              return (
                <GlassCard key={p._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {Number(p.amount ?? lease?.monthlyRent).toLocaleString()} ETB
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      STATUS_STYLES[p.status] ?? "text-white/40 bg-white/5"
                    }`}
                  >
                    {p.status ?? "paid"}
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