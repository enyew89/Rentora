import { GlassCard, Badge, BackButton, PageHeader, PrimaryButton, GhostButton, EmptyState } from "../../components/ui";
import { mockProperties, mockUnits } from "../../lib/mockData";

function UnitRow({ unit, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-white/60">{unit.unitNumber}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
            Unit {unit.unitNumber}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {unit.bedrooms} bed · {unit.bathrooms} bath
            {unit.floor ? ` · Floor ${unit.floor}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-white/70 hidden sm:block">
          {unit.rentAmount.toLocaleString()} ETB
          <span className="text-white/30 font-normal">/mo</span>
        </p>
        <Badge status={unit.status} />
        <span className="text-xs text-white/20 group-hover:text-blue-400 transition-colors">→</span>
      </div>
    </div>
  );
}

export default function PropertyDetail({ navigate, params }) {
  const property = mockProperties.find((p) => p._id === params?.propertyId);
  const units = mockUnits[params?.propertyId] ?? [];

  if (!property) {
    return (
      <div className="text-white/40 text-sm">Property not found.</div>
    );
  }

  const occupied = units.filter((u) => u.status === "Occupied").length;
  const vacant = units.filter((u) => u.status === "Vacant").length;
  const occupancyPct = units.length ? Math.round((occupied / units.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate("properties")} label="Properties" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">{property.name}</h1>
          <p className="text-sm text-white/40 mt-0.5">{property.address}</p>
          {property.description && (
            <p className="text-sm text-white/30 mt-1 max-w-sm">{property.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={() => navigate("edit-property", { propertyId: property._id })}>
            Edit
          </GhostButton>
          <PrimaryButton onClick={() => navigate("add-unit", { propertyId: property._id })}>
            + Add unit
          </PrimaryButton>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-white">{units.length}</p>
          <p className="text-xs text-white/40 mt-1">Total units</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-emerald-400">{occupied}</p>
          <p className="text-xs text-white/40 mt-1">Occupied</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-amber-400">{vacant}</p>
          <p className="text-xs text-white/40 mt-1">Vacant</p>
        </GlassCard>
      </div>

      {/* Occupancy bar */}
      {units.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Occupancy</span>
            <span className="text-sm text-white/40">{occupancyPct}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${occupancyPct}%` }} />
          </div>
        </GlassCard>
      )}

      {/* Units list */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Units</p>
        {units.length === 0 ? (
          <EmptyState
            icon="🚪"
            title="No units yet"
            description="Add the first unit to this property."
            action={
              <PrimaryButton onClick={() => navigate("add-unit", { propertyId: property._id })}>
                + Add unit
              </PrimaryButton>
            }
          />
        ) : (
          <GlassCard className="divide-y divide-white/5 overflow-hidden">
            {units.map((unit) => (
              <UnitRow
                key={unit._id}
                unit={unit}
                onClick={() => navigate("unit-detail", { propertyId: property._id, unitId: unit._id })}
              />
            ))}
          </GlassCard>
        )}
      </div>
    </div>
  );
}