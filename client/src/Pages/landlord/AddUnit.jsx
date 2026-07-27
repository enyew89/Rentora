import { useState } from "react";
import { GlassCard, PageHeader, BackButton, Input, Select, Textarea, PrimaryButton, GhostButton } from "../../components/ui";
import { mockProperties } from "../../lib/mockData";

export default function AddUnit({ navigate, params }) {
  const property = mockProperties.find((p) => p._id === params?.propertyId);

  const [form, setForm] = useState({
    unitNumber: "",
    floor: "",
    bedrooms: "1",
    bathrooms: "1",
    rentAmount: "",
    description: "",
    status: "Vacant",
  });
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    // ── Replace with real API call ─────────────────────────────────────────
    // const res = await fetch(`/api/properties/${params.propertyId}/units`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify({
    //     ...form,
    //     floor: Number(form.floor),
    //     bedrooms: Number(form.bedrooms),
    //     bathrooms: Number(form.bathrooms),
    //     rentAmount: Number(form.rentAmount),
    //   }),
    // });
    // ──────────────────────────────────────────────────────────────────────

    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    navigate("property-detail", { propertyId: params?.propertyId });
  }

  const isValid = form.unitNumber.trim() && form.rentAmount;

  return (
    <div className="max-w-lg">
      <BackButton
        onClick={() => navigate("property-detail", { propertyId: params?.propertyId })}
        label={property?.name ?? "Property"}
      />

      <PageHeader
        title="Add unit"
        subtitle={property ? `Adding to ${property.name}` : "New unit"}
      />

      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit number"
              id="unitNumber"
              placeholder="e.g. 102"
              value={form.unitNumber}
              onChange={set("unitNumber")}
              required
            />
            <Input
              label="Floor"
              id="floor"
              type="number"
              placeholder="e.g. 1"
              value={form.floor}
              onChange={set("floor")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Bedrooms" id="bedrooms" value={form.bedrooms} onChange={set("bedrooms")}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} bedroom{n > 1 ? "s" : ""}</option>
              ))}
              <option value="0">Studio</option>
            </Select>
            <Select label="Bathrooms" id="bathrooms" value={form.bathrooms} onChange={set("bathrooms")}>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>{n} bathroom{n > 1 ? "s" : ""}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Monthly rent (ETB)"
            id="rentAmount"
            type="number"
            placeholder="e.g. 5000"
            value={form.rentAmount}
            onChange={set("rentAmount")}
            required
          />

          <Select label="Initial status" id="status" value={form.status} onChange={set("status")}>
            <option value="Vacant">Vacant</option>
            <option value="Occupied">Occupied</option>
          </Select>

          <Textarea
            label="Description (optional)"
            id="description"
            placeholder="Any notes about this unit..."
            value={form.description}
            onChange={set("description")}
          />

          <div className="flex gap-3 pt-2">
            <GhostButton onClick={() => navigate("property-detail", { propertyId: params?.propertyId })}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" className="flex-1" disabled={!isValid || saving}>
              {saving ? "Creating..." : "Create unit"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}