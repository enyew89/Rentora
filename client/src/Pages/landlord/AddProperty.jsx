import { useState } from "react";
import {
  GlassCard, PageHeader, BackButton,
  Input, Select, Textarea, PrimaryButton, GhostButton,
} from "../../components/ui";

const PROPERTY_TYPES = [
  "Apartment Building",
  "Villa",
  "Condominium",
  "Commercial",
  "Mixed Use",
];

export default function AddProperty({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    type: "Apartment Building",
  });
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    // ── Replace with real API call ──────────────────────────────────────────
    // const res = await fetch("/api/properties", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify(form),
    // });
    // const data = await res.json();
    // navigate("property-detail", { propertyId: data._id });
    // ───────────────────────────────────────────────────────────────────────

    // Simulated delay
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    navigate("properties");
  }

  const isValid = form.name.trim() && form.address.trim();

  return (
    <div className="max-w-lg">
      <BackButton onClick={() => navigate("properties")} label="Properties" />

      <PageHeader title="Add property" subtitle="Create a new property to start adding units." />

      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Property name"
            id="name"
            placeholder="e.g. Apartment 23"
            value={form.name}
            onChange={set("name")}
            required
          />

          <Input
            label="Address"
            id="address"
            placeholder="e.g. Bole, Addis Ababa"
            value={form.address}
            onChange={set("address")}
            required
          />

          <Select
            label="Property type"
            id="type"
            value={form.type}
            onChange={set("type")}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>

          <Textarea
            label="Description (optional)"
            id="description"
            placeholder="Describe the property..."
            value={form.description}
            onChange={set("description")}
          />

          <div className="flex gap-3 pt-2">
            <GhostButton onClick={() => navigate("properties")}>Cancel</GhostButton>
            <PrimaryButton type="submit" className="flex-1" disabled={!isValid || saving}>
              {saving ? "Creating..." : "Create property"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}