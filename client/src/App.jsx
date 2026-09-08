import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Rentals from "./Pages/Rentals";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import LandlordLayout from "./Pages/landlord/LandlordLayout";
import CompleteProfile from "./Pages/Completeprofile";
import AcceptInvite from "./Pages/AcceptInvites";
import RenterLayout from "./Pages/renter/Renterlayout";
import Unauthorized from "./Pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./Pages/renter/PaymentSuccess";

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route
          path="/login"
          element={<Login onAuthenticated={handleAuthenticated} />}
        />
        <Route
          path="/register"
          element={<Register onAuthenticated={handleAuthenticated} />}
        />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute
              user={user}
              authStatus={authStatus}
              redirectIfComplete
            >
              <CompleteProfile onProfileComplete={handleAuthenticated} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/landlord/dashboard/*"
          element={
            <ProtectedRoute
              user={user}
              authStatus={authStatus}
              requireCompleteProfile
              allowedRoles={["landlord", "admin"]}
            >
              <LandlordLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={<Navigate to="/landlord/dashboard" replace />}
        />

        <Route
          path="/renter/dashboard/*"
          element={
            <ProtectedRoute
              user={user}
              authStatus={authStatus}
              requireCompleteProfile
              allowedRoles={["renter", "admin"]}
            >
              <RenterLayout user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/renter/*"
          element={<Navigate to="/renter/dashboard" replace />}
        />

        <Route path="*" element={<Home />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
