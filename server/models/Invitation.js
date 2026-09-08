const mongoose = require("mongoose");
const crypto = require("crypto");

const invitationSchema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// Traverse: invitation.unit → unit.property → property.landlord

module.exports = mongoose.model("Invitation", invitationSchema);
