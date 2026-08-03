import { useEffect, useState } from "react";
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

const PROPERTY_TYPES = [
  "Apartment Building",
  "Villa",
  "Condominium",
  "Commercial",
  "Mixed Use",
];

export default function EditProperty({ navigate, params }) {
  const propertyId = params?.propertyId;

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    type: "Apartment Building",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!propertyId) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }

    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load property");
        }

        const p = data.property || data;

        setForm({
          name: p.name ?? "",
          address: p.address ?? "",
          description: p.description ?? "",
          type: p.type ?? "Apartment Building",
        });
      } catch (err) {
        console.error("Failed to load property:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!propertyId) {
      setError("Property ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
          type: form.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update property");
      }

      navigate("property-detail", { propertyId });
    } catch (err) {
      console.error("Update property error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.name.trim() && form.address.trim();

  if (loading) {
    return <div className="text-sm text-white/40">Loading property...</div>;
  }

  return (
    <div className="max-w-lg">
      <BackButton
        onClick={() => navigate("property-detail", { propertyId })}
        label="Property"
      />

      <PageHeader
        title="Edit property"
        subtitle="Update the details for this property."
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

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
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
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
            <GhostButton
              type="button"
              onClick={() => navigate("property-detail", { propertyId })}
              disabled={saving}
            >
              Cancel
            </GhostButton>

            <PrimaryButton
              type="submit"
              className="flex-1"
              disabled={!isValid || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}