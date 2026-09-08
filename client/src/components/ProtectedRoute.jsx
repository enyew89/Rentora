import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
  user,
  authStatus,
  requireCompleteProfile = false,
  redirectIfComplete = false,
}) {
  const location = useLocation();

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  if (requireCompleteProfile && !user?.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (redirectIfComplete && user?.profileComplete) {
    // Both landlord and renter dashboards are accessible — send to landlord by default
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
