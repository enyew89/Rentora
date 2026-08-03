import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Rentals from "./Pages/Rentals";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

import LandlordLayout from "./Pages/landlord/LandlordLayout";
import CompleteProfile from "./Pages/Completeprofile";
import AcceptInvite from "./Pages/AcceptInvites";
import RenterLayout from "./Pages/renter/RenterLayout";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");

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
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/rentals" element={<Rentals />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/accept-invite/:token" element={<AcceptInvite />} />

        {/* =========================
            COMPLETE PROFILE
        ========================= */}

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute
              user={user}
              authStatus={authStatus}
              redirectIfComplete
            >
              <CompleteProfile onProfileComplete={setUser} />
            </ProtectedRoute>
          }
        />

        {/* =========================
            LANDLORD DASHBOARD
        ========================= */}

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute
              user={user}
              authStatus={authStatus}
              requireCompleteProfile
              allowedRoles={["landlord"]}
            >
              <LandlordLayout />
            </ProtectedRoute>
          }
        />

        {/* =========================
            RENTER DASHBOARD
        ========================= */}

        {/* You can build this later */}


// in your Routes:
<Route
  path="/renter/*"
  element={
    <ProtectedRoute
      user={user}
      authStatus={authStatus}
      requireCompleteProfile
      allowedRoles={["renter"]}
    >
      <RenterLayout user={user} />
    </ProtectedRoute>
  }
/>

        {/* =========================
            FALLBACK
        ========================= */}

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;