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

export default function AddUnit({ navigate, params }) {
  const propertyId = params?.propertyId;

  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  const [form, setForm] = useState({
    unitNumber: "",
    floor: "",
    bedrooms: "1",
    bathrooms: "1",
    rentAmount: "",
    description: "",
    status: "available",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Get the property so we can display its name
  useEffect(() => {
    if (!propertyId) {
      setLoadingProperty(false);
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

        setProperty(data.property || data);
      } catch (error) {
        console.error("Failed to load property:", error);
        setError(error.message);
      } finally {
        setLoadingProperty(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

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

    if (!propertyId) {
      setError("Property ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          property: propertyId,
          unitNumber: form.unitNumber.trim(),
          floor: form.floor ? Number(form.floor) : undefined,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          rentAmount: Number(form.rentAmount),
          description: form.description.trim(),
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create unit");
      }

      console.log("Unit created successfully:", data);

      // Go back to the property detail page
      navigate("property-detail", {
        propertyId: propertyId,
      });
    } catch (error) {
      console.error("Error creating unit:", error);
      setError(error.message || "Failed to create unit.");
    } finally {
      setSaving(false);
    }
  }

  const isValid =
    form.unitNumber.trim() !== "" &&
    form.rentAmount !== "" &&
    Number(form.rentAmount) > 0;

  if (loadingProperty) {
    return (
      <div className="text-sm text-white/40">
        Loading property...
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <BackButton
        onClick={() =>
          navigate("property-detail", {
            propertyId: propertyId,
          })
        }
        label={property?.name ?? "Property"}
      />

      <PageHeader
        title="Add unit"
        subtitle={
          property
            ? `Adding a new unit to ${property.name}`
            : "Create a new unit"
        }
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-neutral-500/20 bg-neutral-500/10 text-sm text-neutral-400">
          {error}
        </div>
      )}

      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit number and floor */}
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

          {/* Bedrooms and bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Bedrooms"
              id="bedrooms"
              value={form.bedrooms}
              onChange={set("bedrooms")}
            >
              <option value="0">Studio</option>

              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} bedroom{n > 1 ? "s" : ""}
                </option>
              ))}
            </Select>

            <Select
              label="Bathrooms"
              id="bathrooms"
              value={form.bathrooms}
              onChange={set("bathrooms")}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} bathroom{n > 1 ? "s" : ""}
                </option>
              ))}
            </Select>
          </div>

          {/* Monthly rent */}
          <Input
            label="Monthly rent (ETB)"
            id="rentAmount"
            type="number"
            min="0"
            placeholder="e.g. 5000"
            value={form.rentAmount}
            onChange={set("rentAmount")}
            required
          />

          {/* Unit status */}
          <Select
            label="Initial status"
            id="status"
            value={form.status}
            onChange={set("status")}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </Select>

          {/* Description */}
          <Textarea
            label="Description (optional)"
            id="description"
            placeholder="Any notes about this unit..."
            value={form.description}
            onChange={set("description")}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <GhostButton
              type="button"
              onClick={() =>
                navigate("property-detail", {
                  propertyId: propertyId,
                })
              }
            >
              Cancel
            </GhostButton>

            <PrimaryButton
              type="submit"
              className="flex-1"
              disabled={!isValid || saving}
            >
              {saving ? "Creating..." : "Create unit"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}