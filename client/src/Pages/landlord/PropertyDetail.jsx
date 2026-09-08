import { useEffect, useState } from "react";
import {
  GlassCard,
  Badge,
  BackButton,
  PrimaryButton,
  GhostButton,
  EmptyState,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function apiFetch(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function UnitRow({ unit, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-white/60">
            {unit.unitNumber}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">
            Unit {unit.unitNumber}
          </p>

          <p className="text-sm text-white/50 mt-0.5">
            {unit.bedrooms} bed · {unit.bathrooms} bath
            {unit.floor ? ` · Floor ${unit.floor}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-white/70 hidden sm:block">
          {unit.rentAmount?.toLocaleString()} ETB
          <span className="text-white/50 font-normal">/mo</span>
        </p>

        <Badge status={unit.status} />

        <span className="text-xs text-white/40 group-hover:text-neutral-400 transition-colors">
          →
        </span>
      </div>
    </div>
  );
}

export default function PropertyDetail({ navigate, params }) {
  const propertyId = params?.propertyId;

  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!propertyId) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }

    async function fetchPropertyData() {
      try {
        setLoading(true);
        setError("");

        // Fetch property
        const propertyData = await apiFetch(
          `/properties/${propertyId}`
        );

        // Fetch units belonging to this property
        const unitsData = await apiFetch(
          `/units?property=${propertyId}`
        );

        setProperty(propertyData);
        setUnits(unitsData);
      } catch (err) {
        console.error("Failed to load property:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="text-white/40 text-sm">
        Loading property...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackButton
          onClick={() => navigate("properties")}
          label="Properties"
        />

        <div className="text-neutral-400 text-sm">
          Failed to load property: {error}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <BackButton
          onClick={() => navigate("properties")}
          label="Properties"
        />

        <div className="text-white/40 text-sm">
          Property not found.
        </div>
      </div>
    );
  }

  // Calculate occupancy
  const occupied = units.filter(
    (unit) => unit.status?.toLowerCase() === "occupied"
  ).length;

  const vacant = units.filter(
    (unit) =>
      unit.status?.toLowerCase() === "available" ||
      unit.status?.toLowerCase() === "vacant"
  ).length;

  const occupancyPct =
    units.length > 0
      ? Math.round((occupied / units.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <BackButton
        onClick={() => navigate("properties")}
        label="Properties"
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {property.name}
          </h1>

          <p className="text-base text-white/60 mt-0.5">
            {property.address}
          </p>

          {property.description && (
            <p className="text-base text-white/50 mt-1 max-w-sm">
              {property.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <GhostButton
            onClick={() =>
              navigate("edit-property", {
                propertyId: property._id,
              })
            }
          >
            Edit
          </GhostButton>

          <PrimaryButton
            onClick={() =>
              navigate("add-unit", {
                propertyId: property._id,
              })
            }
          >
            + Add unit
          </PrimaryButton>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-white">
            {units.length}
          </p>

          <p className="text-sm text-white/50 mt-1">
            Total units
          </p>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-neutral-300">
            {occupied}
          </p>

          <p className="text-sm text-white/50 mt-1">
            Occupied
          </p>
        </GlassCard>

        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-medium text-neutral-400">
            {vacant}
          </p>

          <p className="text-sm text-white/50 mt-1">
            Vacant
          </p>
        </GlassCard>
      </div>

      {/* Occupancy */}
      {units.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base text-white/70">
              Occupancy
            </span>

            <span className="text-base text-white/60">
              {occupancyPct}%
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-400 rounded-full transition-all"
              style={{
                width: `${occupancyPct}%`,
              }}
            />
          </div>
        </GlassCard>
      )}

      {/* Units */}
      <div>
        <p className="text-base font-semibold text-white/80 mb-2">
          Units
        </p>

        {units.length === 0 ? (
          <EmptyState
            icon="🚪"
            title="No units yet"
            description="Add the first unit to this property."
            action={
              <PrimaryButton
                onClick={() =>
                  navigate("add-unit", {
                    propertyId: property._id,
                  })
                }
              >
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
                onClick={() =>
                  navigate("unit-detail", {
                    propertyId: property._id,
                    unitId: unit._id,
                  })
                }
              />
            ))}
          </GlassCard>
        )}
      </div>
    </div>
  );
}