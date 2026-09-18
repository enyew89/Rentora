import { useEffect, useState } from "react";
import { GlassCard, PageHeader } from "../../components/ui";

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-base text-white/60">{label}</span>
      <span className="text-base text-white font-medium">{value}</span>
    </div>
  );
}

export default function MyHome() {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function copyPhone(number) {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    async function fetchLease() {
      try {
        const res = await fetch("/api/leases/mine", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load lease.");
        setLease(data.lease || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLease();
  }, []);

  if (loading) return <div className="text-base text-white/60">Loading...</div>;

  if (error || !lease) {
    return (
      <div className="space-y-4">
        <PageHeader title="My Home" subtitle="Your rental details" />
        {error ? (
          <div className="text-base text-red-400">{error}</div>
        ) : (
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 text-2xl">
              🏠
            </div>
            <p className="text-lg font-semibold text-white mb-2">No rental yet</p>
            <p className="text-base text-white/50 max-w-sm leading-relaxed">
              You don’t have an active lease. Once a landlord invites you to a unit and you accept, your rental details will appear here.
            </p>
            <p className="text-sm text-white/40 mt-4">
              Check your <span className="text-blue-400 font-medium">Invitations</span> tab to see if you have any pending offers.
            </p>
          </GlassCard>
        )}
      </div>
    );
  }

  const unit = lease.unit;
  const property = unit?.property;
  const landlord = property?.landlord;

  const leaseStart = lease.startDate
    ? new Date(lease.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-5 max-w-lg">
      <PageHeader
        title="My Home"
        subtitle={property ? `${property.name} · ${property.address}` : "Your rental"}
      />

      {/* Property & unit details */}
      <GlassCard className="p-4">
        <Row label="Property" value={property?.name ?? "—"} />
        <Row label="Unit" value={unit?.unitNumber ?? "—"} />
        <Row label="Address" value={property?.address ?? "—"} />
        <Row
          label="Bedrooms"
          value={unit?.bedrooms != null ? `${unit.bedrooms} bedroom${unit.bedrooms !== 1 ? "s" : ""}` : "—"}
        />
        <Row
          label="Bathrooms"
          value={unit?.bathrooms != null ? `${unit.bathrooms} bathroom${unit.bathrooms !== 1 ? "s" : ""}` : "—"}
        />
        {unit?.floor != null && <Row label="Floor" value={`Floor ${unit.floor}`} />}
      </GlassCard>

      {/* Lease details */}
      <div>
        <p className="text-base font-semibold text-white/80 mb-2">Lease</p>
        <GlassCard className="p-4">
          <Row label="Monthly Rent" value={`${Number(lease.monthlyRent).toLocaleString()} ETB`} />
          <Row label="Lease Start" value={leaseStart} />
          <Row
            label="Status"
            value={
              <span className="text-neutral-300 font-medium capitalize">
                {lease.status ?? "Active"}
              </span>
            }
          />
        </GlassCard>
      </div>

      {/* Landlord contact */}
      {landlord && (
        <div>
          <p className="text-base font-semibold text-white/80 mb-2">Your Landlord</p>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-sm font-semibold text-white">
                {(landlord.firstName?.[0] ?? "") + (landlord.lastName?.[0] ?? "")}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {[landlord.firstName, landlord.lastName].filter(Boolean).join(" ") || "Landlord"}
                </p>
                <p className="text-sm text-white/50">
                  {landlord.username || landlord.email || ""}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {(landlord.username || landlord.email) && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(landlord.username || landlord.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm py-2 px-3 rounded-xl border border-white/8 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  ✉ Email
                </a>
              )}
              {landlord.phoneNumber && (
                <a
                  href={`https://wa.me/${landlord.phoneNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm py-2 px-3 rounded-xl border border-white/8 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  💬 WhatsApp
                </a>
              )}
              {landlord.phoneNumber && (
                <button
                  onClick={() => copyPhone(landlord.phoneNumber)}
                  className="flex-1 text-center text-sm py-2 px-3 rounded-xl border border-white/8 transition-all "
                  style={{ color: copied ? "#4ade80" : undefined }}
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}