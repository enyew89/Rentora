import { useEffect, useState } from "react";

export default function RenterInvitations({ navigate }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      setLoading(true);
      const res = await fetch("/api/invitations/mine", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load invitations.");
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    try {
      setActionId(id);
      const res = await fetch(`/api/invitations/${id}/accept`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept.");
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDecline(id) {
    try {
      setActionId(id);
      const res = await fetch(`/api/invitations/${id}/decline`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to decline.");
      setInvitations((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <p className="text-base text-white/60">Loading invitations...</p>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">Rental Invitations</h1>

      {error && (
        <div className="p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-white/40 text-sm">No pending invitations</p>
          <p className="text-white/50 text-xs">
            When a landlord invites you to a unit, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const unit = inv.unit;
            const property = unit?.property;
            const landlord = inv.landlord;

            return (
              <div
                key={inv._id}
                className="border border-blue-500/20 rounded-xl p-4 space-y-3 bg-blue-500/[0.04]"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {property?.name || "Property"}
                  </p>
                  <p className="text-sm text-white/50">
                    Unit {unit?.unitNumber || "?"}
                    {property?.address ? ` · ${property.address}` : ""}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-white/50">
                  <p>
                    Monthly rent:{" "}
                    <span className="text-white font-medium">
                      {Number(unit?.rentAmount || 0).toLocaleString()} ETB
                    </span>
                  </p>
                  {landlord && (
                    <p>
                      Landlord:{" "}
                      <span className="text-white">
                        {landlord.firstName} {landlord.lastName}
                      </span>
                    </p>
                  )}
                  <p>
                    Invited:{" "}
                    {new Date(inv.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleDecline(inv._id)}
                    disabled={actionId === inv._id}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    {actionId === inv._id ? "..." : "Decline"}
                  </button>
                  <button
                    onClick={() => handleAccept(inv._id)}
                    disabled={actionId === inv._id}
                    className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all disabled:opacity-50 shadow-md shadow-white/10"
                  >
                    {actionId === inv._id ? "..." : "Accept"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
