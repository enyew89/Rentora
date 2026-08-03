import { useState } from "react";
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
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request.");

      navigate("maintenance");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.title.trim() !== "" && form.description.trim() !== "";

  return (
    <div className="max-w-lg">
      <BackButton onClick={() => navigate("maintenance")} label="Maintenance" />

      <PageHeader
        title="New Request"
        subtitle="Describe the issue and your landlord will be notified."
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <PrimaryButton type="submit" className="flex-1" disabled={!isValid || saving}>
              {saving ? "Submitting..." : "Submit Request"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}