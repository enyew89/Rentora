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
  const [error, setError] = useState("");

  function set(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create property"
        );
      }

      console.log("Property created:", data);

      // Navigate to the property detail page
      navigate("property-detail", {
        propertyId: data._id,
      });
    } catch (err) {
      console.error("Create property error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const isValid =
    form.name.trim() &&
    form.address.trim();

  return (
    <div className="max-w-lg">
      {/* Back button */}
      <BackButton
        onClick={() => navigate("properties")}
        label="Properties"
      />

      {/* Page header */}
      <PageHeader
        title="Add property"
        subtitle="Create a new property to start adding units."
      />

      <GlassCard className="p-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Property name */}
          <Input
            label="Property name"
            id="name"
            placeholder="e.g. Apartment 23"
            value={form.name}
            onChange={set("name")}
            required
          />

          {/* Address */}
          <Input
            label="Address"
            id="address"
            placeholder="e.g. Bole, Addis Ababa"
            value={form.address}
            onChange={set("address")}
            required
          />

          {/* Property type */}
          <Select
            label="Property type"
            id="type"
            value={form.type}
            onChange={set("type")}
          >
            {PROPERTY_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </Select>

          {/* Description */}
          <Textarea
            label="Description (optional)"
            id="description"
            placeholder="Describe the property..."
            value={form.description}
            onChange={set("description")}
          />

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-neutral-500/10 border border-neutral-500/20">
              <p className="text-sm text-neutral-400">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <GhostButton
              type="button"
              onClick={() => navigate("properties")}
              disabled={saving}
            >
              Cancel
            </GhostButton>

            <PrimaryButton
              type="submit"
              className="flex-1"
              disabled={!isValid || saving}
            >
              {saving
                ? "Creating..."
                : "Create property"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}