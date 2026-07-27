
import { GlassCard, PageHeader, Badge, Avatar, EmptyState } from "../../components/ui";
import { mockUnits, mockProperties } from "../../lib/mockData";

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Flatten all occupied units into a renters list
function getAllRenters() {
  const renters = [];
  for (const [propertyId, units] of Object.entries(mockUnits)) {
    const property = mockProperties.find((p) => p._id === propertyId);
    for (const unit of units) {
      if (unit.renter) {
        renters.push({
          ...unit.renter,
          unitNumber: unit.unitNumber,
          rentAmount: unit.rentAmount,
          propertyName: property?.name ?? "Unknown",
          unitId: unit._id,
          propertyId,
          paymentStatus: Math.random() > 0.3 ? "Paid" : "Pending", // replace with real data
        });
      }
    }
  }
  return renters;
}

export default function Renters({ navigate }) {
  const renters = getAllRenters();

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Renters"
        subtitle={`${renters.length} active renter${renters.length !== 1 ? "s" : ""}`}
      />

      {renters.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No renters yet"
          description="Renters appear here once they accept a unit invitation."
        />
      ) : (
        <GlassCard className="divide-y divide-white/5 overflow-hidden">
          {renters.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => navigate("unit-detail", { propertyId: r.propertyId, unitId: r.unitId })}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={initials(r.name)} />
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                    {r.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {r.propertyName} · Unit {r.unitNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white/70">{r.rentAmount.toLocaleString()} ETB</p>
                  <p className="text-xs text-white/30">per month</p>
                </div>
                <Badge status={r.paymentStatus} />
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}