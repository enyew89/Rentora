const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    lease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount:        { type: Number, required: true },
    dueDate:       { type: Date, required: true },
    paymentDate:   { type: Date },
    status: {
      type: String,
      enum: ["pending", "paid", "late", "waived"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "telebirr", "cbe_birr", "other"],
    },
    transactionId: { type: String },
    notes:         { type: String },
  },
  { timestamps: true }
);

// Traverse: payment.lease → lease.unit → unit.property → property.landlord

module.exports = mongoose.model("Payment", paymentSchema);