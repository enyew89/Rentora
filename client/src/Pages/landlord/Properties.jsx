import { GlassCard, EmptyState, PageHeader, PrimaryButton, Badge } from "../../components/ui";
import { mockProperties } from "../../lib/mockData";

function PropertyCard({ property, onClick }) {
  const occupancyPct = Math.round((property.occupiedUnits / property.totalUnits) * 100);

  return (
    <GlassCard className="p-5 hover:bg-white/8 transition-colors cursor-pointer group" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-medium text-white group-hover:text-blue-300 transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-white/40 mt-0.5">{property.address}</p>
        </div>
        <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          {property.type}
        </span>
      </div>

      {/* Mini occupancy bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/70 rounded-full"
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50">{property.totalUnits} units</span>
          <span className="text-white/20">·</span>
          <span className="text-emerald-400">{property.occupiedUnits} occupied</span>
          <span className="text-white/20">·</span>
          <span className="text-amber-400">{property.vacantUnits} vacant</span>
        </div>
        <span className="text-xs text-blue-400 group-hover:translate-x-0.5 transition-transform">View →</span>
      </div>
    </GlassCard>
  );
}

export default function Properties({ navigate }) {
  return (
    <div className="space-y-5">
      <PageHeader
        title="My Properties"
        subtitle={`${mockProperties.length} properties`}
        action={
          <PrimaryButton onClick={() => navigate("add-property")}>
            + Add property
          </PrimaryButton>
        }
      />

      {mockProperties.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No properties yet"
          description="Add your first property to get started."
          action={
            <PrimaryButton onClick={() => navigate("add-property")}>
              + Add property
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {mockProperties.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              onClick={() => navigate("property-detail", { propertyId: p._id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}