import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-load heavy dashboard bundles — only loaded when the user navigates there
const Workspace = lazy(() => import("./Pages/Workspace"));
const LandlordLayout = lazy(() => import("./Pages/landlord/LandlordLayout"));
const CompleteProfile = lazy(() => import("./Pages/Completeprofile"));
const RenterLayout = lazy(() => import("./Pages/renter/Renterlayout"));
const PaymentSuccess = lazy(() => import("./Pages/renter/PaymentSuccess"));

function DashboardSpinner() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <p className="text-sm text-white/50">Loading...</p>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");

  function handleAuthenticated(nextUser) {
    setUser(nextUser);
    setAuthStatus("authenticated");
  }

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setAuthStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setAuthStatus("unauthenticated");
      });
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<DashboardSpinner />}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login onAuthenticated={handleAuthenticated} />} />
        <Route path="/register" element={<Register onAuthenticated={handleAuthenticated} />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Profile completion */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute user={user} authStatus={authStatus} redirectIfComplete>
              <CompleteProfile onProfileComplete={handleAuthenticated} />
            </ProtectedRoute>
          }
        />

        {/* Workspace — dashboard switcher */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} authStatus={authStatus} requireCompleteProfile>
              <Workspace />
            </ProtectedRoute>
          }
        />

        {/* Landlord dashboard — accessible to any authenticated user */}
        <Route
          path="/landlord/dashboard/*"
          element={
            <ProtectedRoute user={user} authStatus={authStatus} requireCompleteProfile>
              <LandlordLayout />
            </ProtectedRoute>
          }
        />

        {/* Renter dashboard — accessible to any authenticated user */}
        <Route
          path="/renter/dashboard/*"
          element={
            <ProtectedRoute user={user} authStatus={authStatus} requireCompleteProfile>
              <RenterLayout user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="*" element={<Home />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
