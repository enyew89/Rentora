import { useEffect, useState } from "react";
import {
  GlassCard,
  Badge,
  BackButton,
  Avatar,
  PrimaryButton,
  GhostButton,
  Input,
} from "../../components/ui";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UnitDetail({ navigate, params }) {
  const propertyId = params?.propertyId;
  const unitId = params?.unitId;

  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invitation state
  const [renterEmail, setRenterEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Fetch property and unit
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [propertyResponse, unitResponse] = await Promise.all([
          fetch(`/api/properties/${propertyId}`, {
            credentials: "include",
          }),

          fetch(`/api/units/${unitId}`, {
            credentials: "include",
          }),
        ]);

        const propertyData = await propertyResponse.json();
        const unitData = await unitResponse.json();

        if (!propertyResponse.ok) {
          throw new Error(
            propertyData.message || "Failed to load property"
          );
        }

        if (!unitResponse.ok) {
          throw new Error(
            unitData.message || "Failed to load unit"
          );
        }

        setProperty(propertyData.property || propertyData);
        setUnit(unitData.unit || unitData);
      } catch (error) {
        console.error("Failed to load unit details:", error);
        setError(error.message || "Failed to load unit");
      } finally {
        setLoading(false);
      }
    }

    if (propertyId && unitId) {
      fetchData();
    } else {
      setLoading(false);
      setError("Property ID or Unit ID is missing.");
    }
  }, [propertyId, unitId]);

  async function handleSendInvitation() {
    // Clear old messages
    setInviteMessage("");
    setInviteError("");

    // Validate email
    if (!renterEmail.trim()) {
      setInviteError("Please enter the renter's email address.");
      return;
    }

    if (!renterEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    try {
      setSendingInvite(true);

      /*
        This assumes your backend has:

        POST /api/invitations

        and expects:

        {
          unitId: unitId,
          email: renterEmail
        }

        Change this endpoint/body if your invitation controller
        uses a different structure.
      */

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          unitId: unitId,
          email: renterEmail.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send invitation."
        );
      }

      console.log("Invitation created:", data);

      setInviteMessage("Invitation sent successfully.");
      setRenterEmail("");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      setInviteError(error.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-sm text-white/40">
        Loading unit details...
      </div>
    );
  }

  // Error state
  if (error && !unit) {
    return (
      <div className="space-y-4">
        <BackButton
          onClick={() =>
            navigate("property-detail", {
              propertyId,
            })
          }
          label="Property"
        />

        <div className="text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // Unit not found
  if (!unit) {
    return (
      <div className="text-white/40 text-sm">
        Unit not found.
      </div>
    );
  }

  // Format renter data
  const renterName = unit.renter
    ? `${unit.renter.firstName || ""} ${
        unit.renter.lastName || ""
      }`.trim()
    : "";

  return (
    <div className="space-y-5 max-w-lg">
      {/* Back button */}
      <BackButton
        onClick={() =>
          navigate("property-detail", {
            propertyId,
          })
        }
        label={property?.name ?? "Property"}
      />

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Unit header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-medium text-white">
              Unit {unit.unitNumber}
            </h1>

            <Badge status={unit.status} />
          </div>

          <p className="text-sm text-white/40">
            {property?.name} · {property?.address}
          </p>
        </div>

        <GhostButton
          onClick={() =>
            navigate("edit-unit", {
              propertyId,
              unitId: unit._id,
            })
          }
        >
          Edit
        </GhostButton>
      </div>

      {/* Unit details */}
      <GlassCard className="p-4">
        <DetailRow
          label="Bedrooms"
          value={`${unit.bedrooms} bedroom${
            unit.bedrooms !== 1 ? "s" : ""
          }`}
        />

        <DetailRow
          label="Bathrooms"
          value={`${unit.bathrooms} bathroom${
            unit.bathrooms !== 1 ? "s" : ""
          }`}
        />

        {unit.floor !== undefined &&
          unit.floor !== null && (
            <DetailRow
              label="Floor"
              value={`Floor ${unit.floor}`}
            />
          )}

        <DetailRow
          label="Monthly rent"
          value={`${Number(
            unit.rentAmount
          ).toLocaleString()} ETB`}
        />

        <DetailRow
          label="Status"
          value={unit.status}
        />

        {unit.description && (
          <DetailRow
            label="Description"
            value={unit.description}
          />
        )}
      </GlassCard>

      {/* Renter section */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">
          Renter
        </p>

        {unit.renter ? (
          <GlassCard className="p-4">
            {/* Renter information */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                initials={initials(renterName)}
              />

              <div>
                <p className="text-sm font-medium text-white">
                  {renterName || "Renter"}
                </p>

                <p className="text-xs text-white/40">
                  {unit.renter.username ||
                    unit.renter.email ||
                    "No email"}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 space-y-1">
              {unit.renter.leaseStart && (
                <DetailRow
                  label="Lease start"
                  value={new Date(
                    unit.renter.leaseStart
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
              )}

              <DetailRow
                label="Monthly rent"
                value={`${Number(
                  unit.rentAmount
                ).toLocaleString()} ETB`}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <GhostButton className="flex-1">
                Message renter
              </GhostButton>

              <GhostButton className="flex-1 text-red-400 border-red-500/20 hover:bg-red-500/5">
                Remove renter
              </GhostButton>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-xl">
                🔗
              </div>

              <p className="text-sm font-medium text-white mb-1">
                No renter assigned
              </p>

              <p className="text-xs text-white/40 mb-4">
                Enter the renter's email address to send
                them an invitation to this unit.
              </p>
            </div>

            {/* Email input */}
            <div className="mb-3">
              <Input
                label="Renter email"
                type="email"
                placeholder="renter@example.com"
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
              />
            </div>

            {/* Error message */}
            {inviteError && (
              <p className="text-xs text-red-400 mb-3">
                {inviteError}
              </p>
            )}

            {/* Success message */}
            {inviteMessage && (
              <p className="text-xs text-emerald-400 mb-3">
                {inviteMessage}
              </p>
            )}

            {/* Send invitation button */}
            <PrimaryButton
              onClick={handleSendInvitation}
              className="w-full"
              disabled={sendingInvite}
            >
              {sendingInvite
                ? "Sending invitation..."
                : "Send invitation"}
            </PrimaryButton>
          </GlassCard>
        )}
      </div>
    </div>
  );
}