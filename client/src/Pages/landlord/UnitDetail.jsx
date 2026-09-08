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

function initials(r) {
  const first = r?.firstName?.[0] ?? "";
  const last = r?.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export default function UnitDetail({ navigate, params }) {
  const propertyId = params?.propertyId;
  const unitId = params?.unitId;

  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [renterEmail, setRenterEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [propertyRes, unitRes] = await Promise.all([
          fetch(`/api/properties/${propertyId}`, { credentials: "include" }),
          fetch(`/api/units/${unitId}`, { credentials: "include" }),
        ]);

        const propertyData = await propertyRes.json();
        const unitData = await unitRes.json();

        if (!propertyRes.ok) throw new Error(propertyData.message || "Failed to load property");
        if (!unitRes.ok) throw new Error(unitData.message || "Failed to load unit");

        const unitObj = unitData.unit || unitData;
        setProperty(propertyData.property || propertyData);
        setUnit(unitObj);

        if (unitObj.status === "occupied" && unitObj.renter) {
          const leasesRes = await fetch("/api/leases", { credentials: "include" });
          if (leasesRes.ok) {
            const leasesData = await leasesRes.json();
            const active = leasesData.find(
              (l) =>
                l.unit?._id === unitObj._id ||
                l.unit?._id?.toString() === unitObj._id?.toString()
            );
            setLease(active ?? null);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load unit");
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
    setInviteMessage("");
    setInviteError("");

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
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ unitId, email: renterEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send invitation.");
      setInviteMessage("Invitation sent successfully.");
      setRenterEmail("");
    } catch (err) {
      setInviteError(err.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleRemoveRenter() {
    if (!lease?._id) {
      setRemoveError("Could not find the active lease. Try refreshing.");
      return;
    }

    try {
      setRemoving(true);
      setRemoveError("");

      const res = await fetch(`/api/leases/${lease._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "terminated" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove renter.");

      setUnit((prev) => ({ ...prev, status: "available", renter: null }));
      setLease(null);
      setConfirmRemove(false);
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setRemoving(false);
    }
  }

  if (loading) return <div className="text-sm text-white/40">Loading unit details...</div>;

  if (error && !unit) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => navigate("property-detail", { propertyId })} label="Property" />
        <div className="text-sm text-red-400">{error}</div>
      </div>
    );
  }

  if (!unit) return <div className="text-white/40 text-sm">Unit not found.</div>;

  const renter = unit.renter;
  const renterName = renter
    ? `${renter.firstName ?? ""} ${renter.lastName ?? ""}`.trim()
    : "";

  const leaseStart = lease?.startDate
    ? new Date(lease.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-5 max-w-lg">
      <BackButton
        onClick={() => navigate("property-detail", { propertyId })}
        label={property?.name ?? "Property"}
      />

      {error && (
        <div className="p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-neutral-400">
          {error}
        </div>
      )}

      {/* Unit header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-medium text-white">Unit {unit.unitNumber}</h1>
            <Badge status={unit.status} />
          </div>
          <p className="text-sm text-white/40">
            {property?.name} · {property?.address}
          </p>
        </div>
        <GhostButton onClick={() => navigate("edit-unit", { propertyId, unitId: unit._id })}>
          Edit
        </GhostButton>
      </div>

      {/* Unit details */}
      <GlassCard className="p-4">
        <DetailRow
          label="Bedrooms"
          value={`${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}`}
        />
        <DetailRow
          label="Bathrooms"
          value={`${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}`}
        />
        {unit.floor != null && <DetailRow label="Floor" value={`Floor ${unit.floor}`} />}
        <DetailRow label="Monthly rent" value={`${Number(unit.rentAmount).toLocaleString()} ETB`} />
        <DetailRow label="Status" value={unit.status} />
        {unit.description && <DetailRow label="Description" value={unit.description} />}
      </GlassCard>

      {/* Renter section */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Renter</p>

        {renter ? (
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={initials(renter)} />
              <div>
                <p className="text-sm font-medium text-white">{renterName || "Renter"}</p>
                <p className="text-xs text-white/40">
                  {renter?.username || renter?.email || ""}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 space-y-1">
              {leaseStart && <DetailRow label="Lease start" value={leaseStart} />}
              <DetailRow
                label="Monthly rent"
                value={`${Number(unit.rentAmount).toLocaleString()} ETB`}
              />
            </div>

            {removeError && (
              <p className="text-xs text-red-400 mt-3">{removeError}</p>
            )}

            {confirmRemove ? (
              <div className="mt-4 p-3 rounded-xl border border-neutral-500/20 bg-white/[0.04] space-y-3">
                <p className="text-sm text-white/70">
                  This will terminate the lease and mark the unit as available. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRemoveRenter}
                    disabled={removing}
                    className="flex-1 py-2 rounded-xl bg-neutral-400 hover:bg-neutral-400 disabled:opacity-50 text-sm font-semibold text-white transition-all"
                  >
                    {removing ? "Removing…" : "Yes, remove renter"}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <GhostButton
                  className="w-full text-neutral-400 border-neutral-500/20 hover:bg-white/[0.04]"
                  onClick={() => setConfirmRemove(true)}
                >
                  Remove renter
                </GhostButton>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-xl">
                🔗
              </div>
              <p className="text-sm font-medium text-white mb-1">No renter assigned</p>
              <p className="text-xs text-white/40 mb-4">
                Enter the renter's email address to send them an invitation to this unit.
              </p>
            </div>

            <div className="mb-3">
              <Input
                label="Renter email"
                type="email"
                placeholder="renter@example.com"
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
              />
            </div>

            {inviteError && <p className="text-xs text-red-400 mb-3">{inviteError}</p>}
            {inviteMessage && <p className="text-xs text-neutral-300 mb-3">{inviteMessage}</p>}

            <PrimaryButton onClick={handleSendInvitation} className="w-full" disabled={sendingInvite}>
              {sendingInvite ? "Sending invitation..." : "Send invitation"}
            </PrimaryButton>
          </GlassCard>
        )}
      </div>
    </div>
  );
}