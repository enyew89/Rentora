const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
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
    invitation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invitation",
    },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date },   // null = month-to-month
    monthlyRent:   { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired", "terminated"],
      default: "active",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Traverse: lease.unit → unit.property → property.landlord

module.exports = mongoose.model("Lease", leaseSchema);