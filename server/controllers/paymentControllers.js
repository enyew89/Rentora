
const Payment = require("../models/Payment.js");
const Lease = require("../models/Lease.js");
const Unit = require("../models/Unit.js");
const Property = require("../models/Property.js");  

// GET /payments — landlord sees all payments
exports.getPayments = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id");
    const unitIds = units.map((u) => u._id);

    const leases = await Lease.find({ unit: { $in: unitIds } }).select("_id");
    const leaseIds = leases.map((l) => l._id);

    const payments = await Payment.find({ lease: { $in: leaseIds } })
      .populate("renter", "firstName lastName email")
      .populate({ path: "lease", populate: { path: "unit", populate: { path: "property" } } });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /payments — landlord records a payment manually
exports.createPayment = async (req, res) => {
  try {
    const { leaseId, amount, dueDate, paymentDate, method, notes } = req.body;

    const lease = await Lease.findById(leaseId).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!lease) return res.status(404).json({ message: "Lease not found." });

    if (lease.unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const payment = await Payment.create({
      lease: leaseId,
      renter: lease.renter,
      amount,
      dueDate,
      paymentDate,
      status: paymentDate ? "paid" : "pending",
      method,
      notes,
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /payments/:id — mark as paid, waived, etc.
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "lease",
      populate: { path: "unit", populate: { path: "property" } },
    });

    if (!payment) return res.status(404).json({ message: "Payment not found." });

    if (payment.lease.unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    Object.assign(payment, req.body);
    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};