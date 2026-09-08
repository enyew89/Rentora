import { useState } from "react";
import Dashboard from "./Dashboard";
import Properties from "./Properties";
import AddProperty from "./AddProperty";
import PropertyDetail from "./PropertyDetail";
import AddUnit from "./AddUnit";
import UnitDetail from "./UnitDetail";
import Renters from "./Renters";
import Payments from "./Payments";
import Maintenance from "./Maintenance";
import Settings from "./Settings";
import EditUnit from "./EditUnit";
import EditProperty from "./EditProperty";
import InviteRenter from "./InviteRenter";  

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "properties", label: "Properties", icon: "🏢" },
  { id: "renters", label: "Renters", icon: "👥" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
];

// ─── Internal router ──────────────────────────────────────────────────────────
function renderPage(route, navigate) {
  switch (route.name) {
    case "dashboard":
      return <Dashboard navigate={navigate} />;
    case "properties":
      return <Properties navigate={navigate} />;
    case "add-property":
      return <AddProperty navigate={navigate} params={route.params} />;
    case "property-detail":
      return <PropertyDetail navigate={navigate} params={route.params} />;
    case "add-unit":
      return <AddUnit navigate={navigate} params={route.params} />;
    case "unit-detail":
      return <UnitDetail navigate={navigate} params={route.params} />;
    case "edit-unit":
      return <EditUnit navigate={navigate} params={route.params} />;
    case "invite-renter":
      return <InviteRenter navigate={navigate} params={route.params} />;
    case "renters":
      return <Renters navigate={navigate} />;
    case "payments":
      return <Payments />;
    case "maintenance":
      return <Maintenance />;
    case "settings":
      return <Settings />;
    case "edit-property":
      return <EditProperty navigate={navigate} params={route.params} />;
    default:
      return <Dashboard navigate={navigate} />;
  }
}

// Map sub-routes back to the nav tab that should appear "active"
const ACTIVE_TAB = {
  dashboard: "dashboard",
  properties: "properties",
  "add-property": "properties",
  "property-detail": "properties",
  "edit-property": "properties",
   "invite-renter": "properties",
  "add-unit": "properties",
  "unit-detail": "properties",
  "edit-unit": "properties",
  renters: "renters",
  payments: "payments",
  maintenance: "maintenance",
};

export default function LandlordLayout() {
  const [route, setRoute] = useState({ name: "dashboard", params: {} });
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(name, params = {}) {
    setRoute({ name, params });
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }

  const activeTab = ACTIVE_TAB[route.name] ?? "dashboard";

  return (
    <div className="min-h-screen bg-transparent text-white flex">
      {/* ── Ambient orb ── */}
      <div className="pointer-events-none fixed top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/5 bg-white/2 backdrop-blur-sm fixed left-0 top-0 h-full z-20 p-4">
        {/* Logo */}
        <div className="mb-8 px-2 pt-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            Rentora
          </span>
          <span className="text-neutral-400 text-lg">.</span>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.id
                  ? "bg-white/8 text-white font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings footer */}
        <button
          onClick={() => navigate("settings")}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <span className="text-base">⚙</span> Settings
        </button>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <span className="text-base font-semibold text-white">
          Rentora<span className="text-neutral-400">.</span>
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/60 hover:text-white transition-colors p-1"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col pt-16 px-4">
          <nav className="space-y-1 mt-4">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-white/8 text-white font-medium"
                    : "text-white/40"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8 pt-20 md:pt-8">
          {renderPage(route, navigate)}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-all ${
              activeTab === item.id ? "text-white" : "text-white/30"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
