import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Home } from "lucide-react";

export default function Workspace({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Brief loading state so the page doesn't flash
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-base text-white/60">Loading...</p>
      </div>
    );
  }

  const hasProperties = user?.hasProperties;
  const hasLeases = user?.hasLeases;

  // If user has only one type, go directly there
  if (hasProperties && !hasLeases) {
    navigate("/landlord/dashboard", { replace: true });
    return null;
  }
  if (!hasProperties && hasLeases) {
    navigate("/renter/dashboard", { replace: true });
    return null;
  }

  // If user has both or neither, show the workspace
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <span className="text-sm uppercase tracking-widest text-white/50">
            Rentora
          </span>
          <h1 className="text-2xl font-medium text-white mt-2">
            Your workspace
          </h1>
          <p className="text-base text-white/60 mt-1">
            {hasProperties && hasLeases
              ? "You have both landlord and renter access. Choose where to go."
              : hasProperties
                ? "You own properties. Start managing them."
                : hasLeases
                  ? "You have an active rental. View your home."
                  : "Welcome to Rentora. Add a property or accept an invitation to get started."}
          </p>
        </div>

        <div className="space-y-3">
          {hasProperties && (
            <button
              onClick={() => navigate("/landlord/dashboard")}
              className="w-full text-left p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Building2 size={20} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Landlord Dashboard
                  </p>
                  <p className="text-sm text-white/50 mt-0.5">
                    Manage your properties, units, and renters
                  </p>
                </div>
                <span className="text-white/40 group-hover:text-white/50 transition-colors">
                  →
                </span>
              </div>
            </button>
          )}

          {hasLeases && (
            <button
              onClick={() => navigate("/renter/dashboard")}
              className="w-full text-left p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Home size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Renter Dashboard
                  </p>
                  <p className="text-sm text-white/50 mt-0.5">
                    View your rental, payments, and maintenance
                  </p>
                </div>
                <span className="text-white/40 group-hover:text-white/50 transition-colors">
                  →
                </span>
              </div>
            </button>
          )}

          {!hasProperties && !hasLeases && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/landlord/dashboard")}
                className="w-full text-left p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Building2 size={20} className="text-white/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Add a property
                    </p>
                    <p className="text-sm text-white/50 mt-0.5">
                      Start as a landlord — list your first property
                    </p>
                  </div>
                  <span className="text-white/40 group-hover:text-white/50 transition-colors">
                    →
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/renter/dashboard")}
                className="w-full text-left p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Home size={20} className="text-white/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      View your rentals
                    </p>
                    <p className="text-sm text-white/50 mt-0.5">
                      Check for invitations from landlords
                    </p>
                  </div>
                  <span className="text-white/40 group-hover:text-white/50 transition-colors">
                    →
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
