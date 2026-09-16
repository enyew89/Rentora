import { useState, useEffect } from "react";
import {
  GlassCard,
  PageHeader,
  BackButton,
  Input,
  Select,
  Textarea,
  PrimaryButton,
  GhostButton,
} from "../../components/ui";

export default function NewMaintenanceRequest({ navigate }) {
  const [leases, setLeases] = useState([]);
  const [loadingLeases, setLoadingLeases] = useState(true);

  const [form, setForm] = useState({
    unitId: "",
    title: "",
    description: "",
    priority: "medium",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/leases/mine/active", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const list = data.leases || [];
        setLeases(list);
        if (list.length === 1) {
          setForm((prev) => ({ ...prev, unitId: list[0].unit?._id || "" }));
        }
      })
      .catch(() => setLeases([]))
      .finally(() => setLoadingLeases(false));
  }, []);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          unitId: form.unitId,
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request.");

      setSuccess(true);
      setTimeout(() => navigate("maintenance"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.unitId && form.title.trim() !== "" && form.description.trim() !== "";

  return (
    <div className="max-w-lg">
      <BackButton onClick={() => navigate("maintenance")} label="Maintenance" />

      <PageHeader
        title="New Request"
        subtitle="Describe the issue and your landlord will be notified."
      />

      {success && (
        <div className="mb-4 p-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-base text-emerald-400 flex items-center gap-2">
          <span className="text-lg">✓</span>
          Request submitted successfully. Your landlord has been notified.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/25 bg-red-500/10 text-base text-red-400">
          {error}
        </div>
      )}

      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {leases.length > 1 && (
            <Select
              label="Which unit?"
              id="unitId"
              value={form.unitId}
              onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
            >
              <option value="">Select a unit</option>
              {leases.map((l) => (
                <option key={l._id} value={l.unit?._id}>
                  {l.unit?.property?.name ? `${l.unit.property.name} — ` : ""}Unit {l.unit?.unitNumber ?? "?"}
                </option>
              ))}
            </Select>
          )}
          {leases.length === 1 && leases[0] && (
            <div>
              <p className="text-sm text-white/50 mb-1.5">Unit</p>
              <p className="text-base text-white/70">
                {leases[0].unit?.property?.name ? `${leases[0].unit.property.name} — ` : ""}Unit {leases[0].unit?.unitNumber ?? "?"}
              </p>
            </div>
          )}
          {loadingLeases && (
            <p className="text-sm text-white/40">Loading your rentals...</p>
          )}
          <Input
            label="Title"
            id="title"
            placeholder="e.g. Leaking faucet in kitchen"
            value={form.title}
            onChange={set("title")}
            required
          />

          <Textarea
            label="Description"
            id="description"
            placeholder="Describe the issue in detail..."
            value={form.description}
            onChange={set("description")}
            required
          />

          <Select
            label="Priority"
            id="priority"
            value={form.priority}
            onChange={set("priority")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <div className="flex gap-3 pt-2">
            <GhostButton type="button" onClick={() => navigate("maintenance")}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" className="flex-1" disabled={!isValid || saving || success}>
              {saving ? "Submitting..." : success ? "Submitted" : "Submit Request"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}