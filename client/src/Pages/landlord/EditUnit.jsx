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

export default function EditUnit({ navigate, params }) {
  const unitId = params?.unitId;
  const propertyId = params?.propertyId;

  const [unit, setUnit] = useState(null);
  const [property, setProperty] = useState(null);
  const [loadingUnit, setLoadingUnit] = useState(true);

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

  // Fetch the unit (and its parent property) to pre-fill the form
  useEffect(() => {
    if (!unitId) {
      setError("Unit ID is missing.");
      setLoadingUnit(false);
      return;
    }

    async function fetchUnit() {
      try {
        const response = await fetch(`/api/units/${unitId}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load unit");
        }

        const u = data.unit || data;
        setUnit(u);

        // Pre-fill form with existing values
        setForm({
          unitNumber: u.unitNumber ?? "",
          floor: u.floor != null ? String(u.floor) : "",
          bedrooms: String(u.bedrooms ?? 1),
          bathrooms: String(u.bathrooms ?? 1),
          rentAmount: String(u.rentAmount ?? ""),
          description: u.description ?? "",
          status: u.status ?? "available",
        });

        // Resolve the property — may already be populated on the unit object
        if (u.property && typeof u.property === "object") {
          setProperty(u.property);
        } else {
          const pid = u.property ?? propertyId;
          if (pid) {
            fetchProperty(pid);
          }
        }
      } catch (err) {
        console.error("Failed to load unit:", err);
        setError(err.message);
      } finally {
        setLoadingUnit(false);
      }
    }

    async function fetchProperty(pid) {
      try {
        const response = await fetch(`/api/properties/${pid}`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setProperty(data.property || data);
        }
      } catch (err) {
        console.error("Failed to load property:", err);
      }
    }

    fetchUnit();
  }, [unitId, propertyId]);

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!unitId) {
      setError("Unit ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
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
        throw new Error(data.message || "Failed to update unit");
      }

      console.log("Unit updated successfully:", data);

      // Go back to the property detail page
      navigate("unit-detail", {
        propertyId: unit?.property?._id ?? unit?.property ?? propertyId,
        unitId: unitId,
      });
    } catch (err) {
      console.error("Error updating unit:", err);
      setError(err.message || "Failed to update unit.");
    } finally {
      setSaving(false);
    }
  }

  const isValid =
    form.unitNumber.trim() !== "" &&
    form.rentAmount !== "" &&
    Number(form.rentAmount) > 0;

  if (loadingUnit) {
    return <div className="text-sm text-white/40">Loading unit...</div>;
  }

  return (
    <div className="max-w-lg">
      <BackButton
        onClick={() =>
          navigate("property-detail", {
            propertyId: unit?.property?._id ?? unit?.property ?? propertyId,
          })
        }
        label={property?.name ?? "Property"}
      />

      <PageHeader
        title="Edit unit"
        subtitle={
          unit
            ? `Editing unit ${unit.unitNumber}${property ? ` · ${property.name}` : ""}`
            : "Update unit details"
        }
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
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
            label="Status"
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
                  propertyId: unit?.property?._id ?? unit?.property ?? propertyId,
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
              {saving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}