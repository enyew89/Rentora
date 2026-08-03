import { useEffect, useState } from "react";
import {
  GlassCard,
  PageHeader,
  BackButton,
  PrimaryButton,
  GhostButton,
  Badge,
  Input,
} from "../../components/ui";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

export default function InviteRenter({ navigate, params }) {
  const unitId = params?.unitId;
  const propertyId = params?.propertyId;

  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Renter email
  const [email, setEmail] = useState("");

  // Invitation state
  const [inviteLink, setInviteLink] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (!unitId || !propertyId) {
      setError("Unit or property ID is missing.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [propRes, unitRes] = await Promise.all([
          fetch(`/api/properties/${propertyId}`, {
            credentials: "include",
          }),
          fetch(`/api/units/${unitId}`, {
            credentials: "include",
          }),
        ]);

        const propData = await propRes.json();
        const unitData = await unitRes.json();

        if (!propRes.ok) {
          throw new Error(
            propData.message || "Failed to load property"
          );
        }

        if (!unitRes.ok) {
          throw new Error(
            unitData.message || "Failed to load unit"
          );
        }

        setProperty(propData.property || propData);

        const u = unitData.unit || unitData;
        setUnit(u);

        // If an active invitation already exists
        if (u.activeInviteLink) {
          setInviteLink(u.activeInviteLink);
        }

        if (u.activeInviteExpiry) {
          setInviteExpiry(
            new Date(u.activeInviteExpiry)
          );
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [unitId, propertyId]);

  async function handleGenerate() {
    // Validate email
    if (!email.trim()) {
      setError("Please enter the renter's email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          unitId,
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate invitation"
        );
      }

      const link =
        data.inviteLink ||
        data.invitationLink ||
        data.url;

      const expiry = data.expiresAt
        ? new Date(data.expiresAt)
        : data.invitation?.expiresAt
          ? new Date(data.invitation.expiresAt)
          : null;

      if (!link) {
        throw new Error(
          "Invitation was created, but no invitation link was returned."
        );
      }

      setInviteLink(link);
      setInviteExpiry(expiry);

    } catch (err) {
      console.error(
        "Failed to generate invitation:",
        err
      );

      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setError(
        "Could not copy the invitation link to clipboard."
      );
    }
  }

  async function handleRevoke() {
    setRevoking(true);
    setError("");

    try {
      const response = await fetch(
        `/api/invitations/${unitId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to revoke invitation"
        );
      }

      setInviteLink("");
      setInviteExpiry(null);
      setEmail("");

    } catch (err) {
      console.error(
        "Failed to revoke invitation:",
        err
      );

      setError(err.message);
    } finally {
      setRevoking(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-white/40">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg">

      {/* Back button */}
      <BackButton
        onClick={() =>
          navigate("unit-detail", {
            unitId,
            propertyId,
          })
        }
        label={
          unit
            ? `Unit ${unit.unitNumber}`
            : "Unit"
        }
      />

      {/* Page header */}
      <PageHeader
        title="Invite renter"
        subtitle={
          property && unit
            ? `Unit ${unit.unitNumber} · ${property.name}`
            : "Invite a renter to this unit."
        }
      />

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Unit summary */}
      {unit && (
        <GlassCard className="p-4">
          <InfoRow
            label="Unit"
            value={`Unit ${unit.unitNumber}${
              unit.floor != null
                ? ` · Floor ${unit.floor}`
                : ""
            }`}
          />

          <InfoRow
            label="Bedrooms"
            value={`${unit.bedrooms} bedroom${
              unit.bedrooms !== 1 ? "s" : ""
            }`}
          />

          <InfoRow
            label="Monthly rent"
            value={`${Number(
              unit.rentAmount
            ).toLocaleString()} ETB`}
          />

          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-white/40">
              Status
            </span>

            <Badge status={unit.status} />
          </div>
        </GlassCard>
      )}

      {/* Invitation section */}
      <GlassCard className="p-5">

        {!inviteLink ? (

          /* No active invitation */
          <div className="space-y-5">

            <div className="flex flex-col items-center text-center py-2">

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-2xl">
                🔗
              </div>

              <p className="text-sm font-medium text-white mb-1">
                Invite a renter
              </p>

              <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                Enter the renter's email address.
                We'll create an invitation link that
                you can share with them.
              </p>

            </div>

            {/* Renter email */}
            <Input
              label="Renter's email address"
              type="email"
              placeholder="renter@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            {/* Generate button */}
            <PrimaryButton
              onClick={handleGenerate}
              className="w-full"
              disabled={
                generating ||
                !email.trim()
              }
            >
              {generating
                ? "Generating..."
                : "Generate invitation link"}
            </PrimaryButton>

          </div>

        ) : (

          /* Active invitation */
          <div className="space-y-4">

            <div className="flex items-center gap-2 mb-1">

              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              <p className="text-sm font-medium text-white">
                Invitation active
              </p>

            </div>

            {/* Invited email */}
            {email && (
              <div>
                <p className="text-xs text-white/40">
                  Invitation sent to
                </p>

                <p className="text-sm text-white mt-1">
                  {email}
                </p>
              </div>
            )}

            {/* Expiration */}
            {inviteExpiry && (
              <p className="text-xs text-white/40">
                Expires{" "}
                {inviteExpiry.toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            )}

            {/* Link */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/8">

              <p className="text-xs text-white/50 flex-1 truncate font-mono">
                {inviteLink}
              </p>

            </div>

            {/* Actions */}
            <div className="flex gap-2">

              <PrimaryButton
                onClick={handleCopy}
                className="flex-1"
              >
                {copied
                  ? "✓ Copied!"
                  : "Copy link"}
              </PrimaryButton>

              <GhostButton
                onClick={handleRevoke}
                disabled={revoking}
                className="text-red-400 border-red-500/20 hover:bg-red-500/5"
              >
                {revoking
                  ? "Revoking..."
                  : "Revoke"}
              </GhostButton>

            </div>

            <p className="text-xs text-white/30 text-center leading-relaxed">
              This link is single-use. Once the
              renter accepts, it becomes inactive.
              Revoking it will invalidate it
              immediately.
            </p>

          </div>
        )}

      </GlassCard>

    </div>
  );
}
