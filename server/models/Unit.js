const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitNumber:  { type: String, required: true, trim: true },
    bedrooms:    { type: Number, default: 1 },
    bathrooms:   { type: Number, default: 1 },
    rentAmount:  { type: Number, required: true },
    floor:       { type: Number },
    size:        { type: Number },
    images:      [{ type: String }],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

unitSchema.index({ property: 1, unitNumber: 1 }, { unique: true });

module.exports = mongoose.model("Unit", unitSchema);