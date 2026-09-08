// ─── Rentora shared UI primitives ───────────────────────────────────────────
// GlassCard, Badge, StatCard, PageHeader, EmptyState, Avatar, BackButton

export function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${onClick ? "cursor-pointer hover:bg-white/8 transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ status }) {
  const styles = {
    Occupied:      "bg-white/10 text-neutral-300 border border-white/20",
    occupied:      "bg-white/10 text-neutral-300 border border-white/20",
    Vacant:        "bg-neutral-500/10  text-neutral-400  border border-neutral-500/20",
    vacant:        "bg-neutral-500/10  text-neutral-400  border border-neutral-500/20",
    Open:          "bg-neutral-500/10    text-neutral-400    border border-neutral-500/20",
    "In progress": "bg-neutral-500/10   text-neutral-400   border border-neutral-500/20",
    Done:          "bg-white/10 text-neutral-300 border border-white/20",
    Paid:          "bg-white/10 text-neutral-300 border border-white/20",
    Pending:       "bg-neutral-500/10  text-neutral-400  border border-neutral-500/20",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] ?? "bg-white/10 text-white/50"}`}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className={`text-2xl font-medium ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </GlassCard>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-medium text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <GlassCard className="p-12 flex flex-col items-center text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-sm text-white/40 mb-6">{description}</p>
      {action}
    </GlassCard>
  );
}

export function Avatar({ initials, size = "md" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full bg-neutral-500/20 text-neutral-400 font-medium flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-5"
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
      className={`bg-white hover:bg-neutral-200 active:scale-95 transition-all text-black text-sm font-medium px-4 py-2.5 rounded-xl ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-white/70 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, id, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-xs text-white/50 mb-1.5">{label}</label>}
      <input
        id={id}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-colors"
        {...props}
      />
    </div>
  );
}

export function Select({ label, id, children, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-xs text-white/50 mb-1.5">{label}</label>}
      <select
        id={id}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors appearance-none"
        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
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
      {label && <label htmlFor={id} className="block text-xs text-white/50 mb-1.5">{label}</label>}
      <textarea
        id={id}
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
        {...props}
      />
    </div>
  );
}