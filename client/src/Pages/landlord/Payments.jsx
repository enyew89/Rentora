import { GlassCard, PageHeader, Badge, Avatar } from "../../components/ui";
import { mockPayments } from "../../lib/mockData";

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const totalCollected = mockPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
const totalPending   = mockPayments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

export default function Payments() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-white">Payments</h1>
        <p className="text-sm text-white/40 mt-1">All rent transactions across your properties.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 border-emerald-500/20">
          <p className="text-xs text-white/40 mb-2">Collected this month</p>
          <p className="text-xl font-medium text-emerald-400">
            {totalCollected.toLocaleString()} <span className="text-sm font-normal text-white/30">ETB</span>
          </p>
        </GlassCard>
        <GlassCard className="p-4 border-amber-500/20">
          <p className="text-xs text-white/40 mb-2">Pending</p>
          <p className="text-xl font-medium text-amber-400">
            {totalPending.toLocaleString()} <span className="text-sm font-normal text-white/30">ETB</span>
          </p>
        </GlassCard>
      </div>

      {/* Transactions */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Transactions</p>
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {mockPayments.map((p) => (
            <div key={p._id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar initials={initials(p.renter)} size="sm" />
                <div>
                  <p className="text-sm font-medium text-white">{p.renter}</p>
                  <p className="text-xs text-white/40">{p.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-medium ${p.status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>
                    {p.status === "Paid" ? "+" : ""}{p.amount.toLocaleString()} ETB
                  </p>
                  <p className="text-xs text-white/30">{p.date}</p>
                </div>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}