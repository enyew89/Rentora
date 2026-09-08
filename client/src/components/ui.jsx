// ─── Rentora shared UI primitives ───────────────────────────────────────────

export function GlassCard({ children, className = "", onClick, accent }) {
  const accentBg = {
    blue: "border-blue-500/20 bg-blue-500/[0.04]",
    green: "border-emerald-500/20 bg-emerald-500/[0.04]",
    amber: "border-amber-500/20 bg-amber-500/[0.04]",
    red: "border-red-500/20 bg-red-500/[0.04]",
    purple: "border-purple-500/20 bg-purple-500/[0.04]",
  };
  const accentClass = accent ? (accentBg[accent] || "") : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/20 bg-white/[0.05] backdrop-blur-md shadow-xl ${accentClass} ${onClick ? "cursor-pointer hover:bg-white/[0.08] hover:border-white/30 transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ status }) {
  const styles = {
    Occupied:      "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    occupied:      "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    Vacant:        "bg-blue-900/40 text-blue-300 border border-blue-500/50",
    vacant:        "bg-blue-900/40 text-blue-300 border border-blue-500/50",
    available:     "bg-blue-900/40 text-blue-300 border border-blue-500/50",
    Open:          "bg-amber-900/40 text-amber-300 border border-amber-500/50",
    "In progress": "bg-amber-900/40 text-amber-300 border border-amber-500/50",
    Done:          "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    Paid:          "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    Pending:       "bg-amber-900/40 text-amber-300 border border-amber-500/50",
    active:        "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    terminated:    "bg-red-900/40 text-red-300 border border-red-500/50",
    expired:       "bg-slate-700/40 text-slate-300 border border-slate-500/50",
    pending:       "bg-amber-900/40 text-amber-300 border border-amber-500/50",
    accepted:      "bg-emerald-900/40 text-emerald-300 border border-emerald-500/50",
    declined:      "bg-red-900/40 text-red-300 border border-red-500/50",
    cancelled:     "bg-slate-700/40 text-slate-300 border border-slate-500/50",
  };
  return (
    <span className={`text-sm px-3 py-1.5 rounded-lg font-semibold ${styles[status] ?? "bg-white/20 text-white/90"}`}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <GlassCard className="p-5">
      <p className="text-sm text-white/70 mb-2 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-sm text-white/60 mt-2">{sub}</p>}
    </GlassCard>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-base text-white/70 mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <GlassCard className="p-16 flex flex-col items-center text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-xl text-white font-semibold mb-3">{title}</p>
      <p className="text-base text-white/70 mb-8 max-w-sm">{description}</p>
      {action}
    </GlassCard>
  );
}

export function Avatar({ initials, size = "md", color = "blue" }) {
  const sz = size === "sm" ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  const colors = {
    blue: "bg-blue-600/40 text-blue-200 border border-blue-500/60 shadow-lg",
    green: "bg-emerald-600/40 text-emerald-200 border border-emerald-500/60 shadow-lg",
    amber: "bg-amber-600/40 text-amber-200 border border-amber-500/60 shadow-lg",
    purple: "bg-purple-600/40 text-purple-200 border border-purple-500/60 shadow-lg",
  };
  return (
    <div className={`${sz} rounded-full ${colors[color] || colors.blue} font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-base text-white/80 hover:text-white active:scale-95 transition-all mb-6 font-medium"
    >
      <span>←</span> {label}
    </button>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-white hover:bg-cyan-100 active:scale-95 transition-all text-black text-base font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`border border-white/35 hover:border-white/50 hover:bg-white/[0.1] active:scale-95 transition-all text-white/90 hover:text-white text-base font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, id, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm text-white/90 mb-2.5 font-semibold">{label}</label>}
      <input
        id={id}
        className="w-full bg-white/[0.08] border border-white/40 rounded-lg px-4 py-3 text-base text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/[0.12] focus:shadow-lg transition-all shadow-sm"
        {...props}
      />
    </div>
  );
}

export function Select({ label, id, children, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm text-white/90 mb-2.5 font-semibold">{label}</label>}
      <select
        id={id}
        className="w-full bg-white/[0.08] border border-white/40 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:border-white/60 focus:bg-white/[0.12] focus:shadow-lg transition-all appearance-none shadow-sm"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, id, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm text-white/90 mb-2.5 font-semibold">{label}</label>}
      <textarea
        id={id}
        rows={3}
        className="w-full bg-white/[0.08] border border-white/40 rounded-lg px-4 py-3 text-base text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/[0.12] focus:shadow-lg transition-all resize-none shadow-sm"
        {...props}
      />
    </div>
  );
}
