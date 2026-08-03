import { useState } from "react";
import RenterDashboard from "./RenterDashboard";
import MyHome from "./MyHome";
import RenterPayments from "./RenterPayments";
import RenterMaintenance from "./RenterMaintenance";
import NewMaintenanceRequest from "./NewMaintenanceRequest";
import MaintenanceDetail from "./MaintenanceDetail";
import RenterProfile from "./RenterProfile";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "my-home", label: "My Home", icon: "🏡" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const ACTIVE_TAB = {
  dashboard: "dashboard",
  "my-home": "my-home",
  payments: "payments",
  maintenance: "maintenance",
  "new-maintenance": "maintenance",
  "maintenance-detail": "maintenance",
  profile: "profile",
};

function renderPage(route, navigate, user) {
  switch (route.name) {
    case "dashboard":
      return <RenterDashboard navigate={navigate} user={user} />;
    case "my-home":
      return <MyHome navigate={navigate} />;
    case "payments":
      return <RenterPayments navigate={navigate} />;
    case "maintenance":
      return <RenterMaintenance navigate={navigate} />;
    case "new-maintenance":
      return <NewMaintenanceRequest navigate={navigate} />;
    case "maintenance-detail":
      return <MaintenanceDetail navigate={navigate} params={route.params} />;
    case "profile":
      return <RenterProfile navigate={navigate} user={user} />;
    default:
      return <RenterDashboard navigate={navigate} user={user} />;
  }
}

export default function RenterLayout({ user }) {
  const [route, setRoute] = useState({ name: "dashboard", params: {} });
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(name, params = {}) {
    setRoute({ name, params });
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }

  const activeTab = ACTIVE_TAB[route.name] ?? "dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Ambient orb */}
      <div className="pointer-events-none fixed top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-700/8 rounded-full blur-[120px]" />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/5 bg-white/2 backdrop-blur-sm fixed left-0 top-0 h-full z-20 p-4">
        <div className="mb-8 px-2 pt-2">
          <span className="text-lg font-semibold tracking-tight text-white">Rentora</span>
          <span className="text-emerald-400 text-lg">.</span>
        </div>

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

        <button
          onClick={() => {
            fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => {
              window.location.href = "/login";
            });
          }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <span className="text-base">🚪</span> Logout
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <span className="text-base font-semibold text-white">
          Rentora<span className="text-emerald-400">.</span>
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white p-1">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col pt-16 px-4">
          <nav className="space-y-1 mt-4">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.id ? "bg-white/8 text-white font-medium" : "text-white/40"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8 pt-20 md:pt-8">
          {renderPage(route, navigate, user)}
        </div>
      </main>

      {/* Mobile bottom nav */}
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