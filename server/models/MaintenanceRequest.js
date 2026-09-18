const mongoose = require("mongoose");
const maintenanceSchema = new mongoose.Schema(
  {
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images:      [{ type: String }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "rejected"],
      default: "pending",
    },
    resolvedAt: { type: Date },
    notes:      { type: String },
  },
  { timestamps: true }
);

// Traverse: maintenance.unit → unit.property → property.landlord

maintenanceSchema.index({ unit: 1 });
maintenanceSchema.index({ renter: 1 });
maintenanceSchema.index({ status: 1 });

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);