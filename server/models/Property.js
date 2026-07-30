const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:        { type: String, required: true, trim: true },
    address:     { type: String, required: true, trim: true },
    city:        { type: String, default: "Addis Ababa", trim: true },
    description: { type: String, trim: true },
    images:      [{ type: String }],
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);