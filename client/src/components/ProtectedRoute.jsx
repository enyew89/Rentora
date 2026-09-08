import { Navigate, useLocation } from "react-router-dom";

function dashboardPathFor(user) {
  if (user?.role === "renter") return "/renter/dashboard";
  return "/landlord/dashboard";
}

export default function ProtectedRoute({
  children,
  user,
  authStatus,
  requireCompleteProfile = false,
  redirectIfComplete = false,
  allowedRoles = [],
}) {
  const location = useLocation();

  // -----------------------------------
  // 1. CHECKING AUTHENTICATION
  // -----------------------------------

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  // -----------------------------------
  // 2. USER IS NOT LOGGED IN
  // -----------------------------------

  if (authStatus === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // -----------------------------------
  // 3. PROFILE MUST BE COMPLETED
  // -----------------------------------

  if (
    requireCompleteProfile &&
    !user?.profileComplete
  ) {
    return (
      <Navigate
        to="/complete-profile"
        replace
      />
    );
  }

  // -----------------------------------
  // 4. REDIRECT IF PROFILE IS COMPLETE
  // -----------------------------------

  if (
    redirectIfComplete &&
    user?.profileComplete
  ) {
    return (
      <Navigate
        to={dashboardPathFor(user)}
        replace
      />
    );
  }

  // -----------------------------------
  // 5. CHECK USER ROLE
  // -----------------------------------

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // -----------------------------------
  // 6. EVERYTHING IS OK
  // -----------------------------------

  return children;
}
