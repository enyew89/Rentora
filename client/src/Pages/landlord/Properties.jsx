import { useEffect, useState } from "react";
import {
  GlassCard,
  EmptyState,
  PageHeader,
  PrimaryButton,
  Badge,
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
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// A unit's `property` field might be a raw ID or a populated object,
// depending on the endpoint - handle both.
function getPropertyId(unit) {
  return unit.property?._id || unit.property;
}

function PropertyCard({ property, totalUnits, occupiedUnits, onClick }) {
  const vacantUnits = totalUnits - occupiedUnits;

  const occupancyPct =
    totalUnits > 0
      ? Math.round((occupiedUnits / totalUnits) * 100)
      : 0;

  return (
    <GlassCard
      className="p-5 hover:bg-white/8 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-medium text-white group-hover:text-neutral-300 transition-colors">
            {property.name}
          </h3>

          <p className="text-base text-white/60 mt-0.5">
            {property.address || "No address provided"}
          </p>
        </div>

        <span className="text-sm text-white/50 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          {property.type || "Property"}
        </span>
      </div>

      {/* Occupancy bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-400/70 rounded-full transition-all"
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50">
            {totalUnits} units
          </span>

          <span className="text-white/40">·</span>

          <span className="text-neutral-300">
            {occupiedUnits} occupied
          </span>

          <span className="text-white/40">·</span>

          <span className="text-neutral-400">
            {vacantUnits} vacant
          </span>
        </div>

        <span className="text-sm text-neutral-300 group-hover:translate-x-0.5 transition-transform">
          View →
        </span>
      </div>
    </GlassCard>
  );
}

export default function Properties({ navigate }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [propsData, unitsData] = await Promise.all([
          apiFetch("/properties"),
          apiFetch("/units/all"),
        ]);

        setProperties(propsData);
        setUnits(unitsData);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Properties"
        subtitle={`${properties.length} properties`}
        action={
          <PrimaryButton onClick={() => navigate("add-property")}>
            + Add property
          </PrimaryButton>
        }
      />

      {/* Loading */}
      {loading && (
        <GlassCard className="p-8 text-center">
          <p className="text-base text-white/60">
            Loading your properties...
          </p>
        </GlassCard>
      )}

      {/* Error */}
      {!loading && error && (
        <GlassCard className="p-8 text-center">
          <p className="text-sm text-neutral-400">
            Failed to load properties: {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-neutral-400 hover:text-neutral-300"
          >
            Try again
          </button>
        </GlassCard>
      )}

      {/* Empty state */}
      {!loading && !error && properties.length === 0 && (
        <EmptyState
          icon="🏢"
          title="No properties yet"
          description="Add your first property to get started."
          action={
            <PrimaryButton
              onClick={() => navigate("add-property")}
            >
              + Add property
            </PrimaryButton>
          }
        />
      )}

      {/* Properties */}
      {!loading && !error && properties.length > 0 && (
        <div className="space-y-3">
          {properties.map((property) => {
            const propertyUnits = units.filter(
              (u) => getPropertyId(u) === property._id
            );
            const totalUnits = propertyUnits.length;
            const occupiedUnits = propertyUnits.filter(
              (u) => u.status === "occupied"
            ).length;

            return (
              <PropertyCard
                key={property._id}
                property={property}
                totalUnits={totalUnits}
                occupiedUnits={occupiedUnits}
                onClick={() =>
                  navigate("property-detail", {
                    propertyId: property._id,
                  })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}