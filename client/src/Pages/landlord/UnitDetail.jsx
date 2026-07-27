import { useState } from "react";
import { GlassCard, Badge, BackButton, Avatar, PrimaryButton, GhostButton } from "../../components/ui";
import { mockProperties, mockUnits } from "../../lib/mockData";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UnitDetail({ navigate, params }) {
  const property = mockProperties.find((p) => p._id === params?.propertyId);
  const unit = (mockUnits[params?.propertyId] ?? []).find((u) => u._id === params?.unitId);
  const [inviteCopied, setInviteCopied] = useState(false);

  if (!unit) return <div className="text-white/40 text-sm">Unit not found.</div>;

  function handleGenerateInvite() {
    // ── Replace with real API call ──────────────────────────────────────────
    // const res = await fetch(`/api/units/${unit._id}/invite`, { method: "POST", credentials: "include" });
    // const { inviteLink } = await res.json();
    // navigator.clipboard.writeText(inviteLink);
    // ────────────────────────────────────────────────────────────────────────

    const fakeLink = `https://rentora.app/invite/${unit._id}-abc123`;
    navigator.clipboard.writeText(fakeLink).catch(() => {});
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  }

  return (
    <div className="space-y-5 max-w-lg">
      <BackButton
        onClick={() => navigate("property-detail", { propertyId: params?.propertyId })}
        label={property?.name ?? "Property"}
      />

      {/* Unit header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-medium text-white">Unit {unit.unitNumber}</h1>
            <Badge status={unit.status} />
          </div>
          <p className="text-sm text-white/40">{property?.name} · {property?.address}</p>
        </div>
        <GhostButton onClick={() => navigate("edit-unit", { propertyId: params?.propertyId, unitId: unit._id })}>
          Edit
        </GhostButton>
      </div>

      {/* Unit details */}
      <GlassCard className="p-4">
        <DetailRow label="Bedrooms"    value={`${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}`} />
        <DetailRow label="Bathrooms"   value={`${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}`} />
        {unit.floor && <DetailRow label="Floor" value={`Floor ${unit.floor}`} />}
        <DetailRow label="Monthly rent" value={`${unit.rentAmount.toLocaleString()} ETB`} />
        <DetailRow label="Status"      value={unit.status} />
      </GlassCard>

      {/* Renter section */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Renter</p>

        {unit.renter ? (
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={initials(unit.renter.name)} />
              <div>
                <p className="text-sm font-medium text-white">{unit.renter.name}</p>
                <p className="text-xs text-white/40">{unit.renter.email}</p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 space-y-1">
              <DetailRow
                label="Lease start"
                value={new Date(unit.renter.leaseStart).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              />
              <DetailRow label="Monthly rent" value={`${unit.rentAmount.toLocaleString()} ETB`} />
            </div>
            <div className="flex gap-2 mt-4">
              <GhostButton className="flex-1">Message renter</GhostButton>
              <GhostButton className="flex-1 text-red-400 border-red-500/20 hover:bg-red-500/5">
                Remove renter
              </GhostButton>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-xl">
              🔗
            </div>
            <p className="text-sm font-medium text-white mb-1">No renter assigned</p>
            <p className="text-xs text-white/40 mb-4">
              Generate an invitation link and share it with your renter. They'll create an account and be linked to this unit.
            </p>
            <PrimaryButton onClick={handleGenerateInvite} className="w-full">
              {inviteCopied ? "✓ Link copied to clipboard" : "Generate invitation link"}
            </PrimaryButton>
          </GlassCard>
        )}
      </div>
    </div>
  );
}