const Payment = require("../models/Payment.js");
const Lease = require("../models/Lease.js");
const Unit = require("../models/Unit.js");
const Property = require("../models/Property.js");
const User = require("../models/User.js");

// ─────────────────────────────────────────────
// GET /api/payments  — landlord sees all payments
// ─────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).select(
      "_id",
    );
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } }).select(
      "_id",
    );
    const unitIds = units.map((u) => u._id);

    const leases = await Lease.find({ unit: { $in: unitIds } }).select("_id");
    const leaseIds = leases.map((l) => l._id);

    const payments = await Payment.find({ lease: { $in: leaseIds } })
      .populate("renter", "firstName lastName username")
      .populate({
        path: "lease",
        populate: { path: "unit", populate: { path: "property" } },
      });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/payments/mine  — renter sees their own payments
// ─────────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const leases = await Lease.find({ renter: req.user._id }).select("_id");
    const leaseIds = leases.map((lease) => lease._id);

    const payments = await Payment.find({ lease: { $in: leaseIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: "lease",
        populate: { path: "unit", populate: { path: "property" } },
      });

    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/payments  — landlord manually records a payment (cash, cheque, etc.)
// ─────────────────────────────────────────────
exports.createPayment = async (req, res) => {
  try {
    const { leaseId, amount, dueDate, paymentDate, method, notes } = req.body;

    const lease = await Lease.findById(leaseId).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!lease) return res.status(404).json({ message: "Lease not found." });

    // Only landlords can use this manual endpoint
    if (req.user.role !== "landlord") {
      return res
        .status(403)
        .json({ message: "Renters must use the online payment flow." });
    }

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
      method: method ?? "cash",
      notes,
      paymentGateway: "manual",
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/payments/initialize  — renter starts a Chapa payment
// ─────────────────────────────────────────────
exports.initializePayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "paymentId is required." });
    }

    // 1. Find the pending payment record
    const payment = await Payment.findById(paymentId).populate({
      path: "lease",
      populate: { path: "unit", populate: { path: "property" } },
    });

    if (!payment)
      return res.status(404).json({ message: "Payment not found." });

    // 2. Make sure this renter owns this payment
    if (payment.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (payment.status === "paid") {
      return res
        .status(400)
        .json({ message: "This payment has already been paid." });
    }

    // 3. Load renter details for Chapa
    const renter = await User.findById(req.user._id);

    // 4. Generate a unique tx_ref and save it to the payment
    const tx_ref = `rent-${payment._id}-${Date.now()}`;
    payment.tx_ref = tx_ref;
    payment.paymentGateway = "chapa";
    await payment.save();

    // 5. Call Chapa's initialize endpoint
    console.log("return_url:", `${process.env.CLIENT_URL}/payment-success`);
    const chapaRes = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: payment.amount.toString(),
          currency: "ETB",
          email: renter.username, // your email field
          first_name: renter.firstName,
          last_name: renter.lastName,
          phone_number: renter.phoneNumber ?? "",
          tx_ref,
          callback_url: `${process.env.BASE_URL}/api/payments/webhook`,
          return_url: `${process.env.CLIENT_URL}/payment-success?tx_ref=${tx_ref}`,
          "customization[title]": "Rentora Rent Payment",
          "customization[description]": `Rent payment for ${payment.lease?.unit?.property?.name ?? "your unit"}`,
        }),
      },
    );

    const chapaData = await chapaRes.json();
    console.log("Chapa response:", JSON.stringify(chapaData, null, 2));
    if (chapaData.status !== "success") {
      return res.status(502).json({
        message: "Chapa initialization failed.",
        detail: chapaData.message,
      });
    }

    // 6. Optionally cache the checkout URL on the payment document
    payment.checkoutUrl = chapaData.data.checkout_url;
    await payment.save();

    // 7. Return the checkout URL to the frontend
    res.json({ checkoutUrl: chapaData.data.checkout_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/payments/webhook  — Chapa calls this after payment
// This route must be PUBLIC (no auth middleware)
// ─────────────────────────────────────────────
exports.webhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ message: "tx_ref missing." });
    }

    // 1. Find the payment by tx_ref
    const payment = await Payment.findOne({ tx_ref });
    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found for this tx_ref." });
    }

    // 2. Verify with Chapa before trusting the webhook body
    const verifyRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    const verifyData = await verifyRes.json();

    if (verifyData.status !== "success") {
      return res.status(400).json({ message: "Chapa verification failed." });
    }

    // 3. Mark payment as paid
    payment.status = "paid";
    payment.paymentDate = new Date();
    payment.chapaTransactionId = verifyData.data?.id ?? null;
    await payment.save();

    // Chapa expects a 200 OK
    res.status(200).json({ message: "Payment verified and recorded." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/payments/verify/:tx_ref  — manual fallback verification
// Use this on the payment-success page to confirm status
// ─────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // 1. Find local record
    const payment = await Payment.findOne({ tx_ref });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // If already marked paid in DB, just return it
    if (payment.status === "paid") {
      return res.json({ status: "paid", payment });
    }

    // 2. Ask Chapa
    const verifyRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    const verifyData = await verifyRes.json();

    if (verifyData.status !== "success") {
      return res.json({ status: "pending", payment });
    }

    // 3. Update if Chapa says paid but webhook was missed
    payment.status = "paid";
    payment.paymentDate = new Date();
    payment.chapaTransactionId = verifyData.data?.id ?? null;
    await payment.save();

    res.json({ status: "paid", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/payments/:id  — landlord updates a payment record
// ─────────────────────────────────────────────
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "lease",
      populate: { path: "unit", populate: { path: "property" } },
    });

    if (!payment)
      return res.status(404).json({ message: "Payment not found." });

    if (
      payment.lease.unit.property.landlord.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    Object.assign(payment, req.body);
    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
