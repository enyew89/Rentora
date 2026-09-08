const Invitation = require("../models/Invitation.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const User = require("../models/User.js");
const Property = require("../models/Property.js");
const Payment = require("../models/Payment.js");

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

// ─── POST /api/invitations ─── Landlord invites a renter by email ─────────────
exports.createInvitation = async (req, res) => {
  try {
    const { unitId, email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!unitId || !normalizedEmail) {
      return res.status(400).json({ message: "Unit ID and email are required." });
    }

    // 1. Find unit and verify landlord ownership
    const unit = await Unit.findById(unitId).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    // 2. Check unit is available
    if (unit.status !== "available") {
      return res.status(400).json({ message: "This unit is already occupied." });
    }

    // 3. Find the renter by email — they MUST have an existing Rentora account
    const renter = await User.findOne({ username: normalizedEmail });
    if (!renter) {
      return res.status(404).json({
        message: "No Rentora account exists with this email.",
      });
    }

    // 4. Check for existing pending invitation for this unit + renter
    const existingPending = await Invitation.findOne({
      unit: unitId,
      renter: renter._id,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        message: "This renter already has a pending invitation for this unit.",
      });
    }

    // 5. Cancel any old pending invitations for this unit
    await Invitation.updateMany(
      { unit: unitId, status: "pending" },
      { status: "cancelled" }
    );

    // 6. Create the invitation
    const invitation = await Invitation.create({
      unit: unitId,
      landlord: req.user._id,
      email: normalizedEmail,
      renter: renter._id,
    });

    res.status(201).json({ message: "Invitation sent.", invitation });
  } catch (err) {
    console.error("createInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/invitations ─── Landlord sees all their invitations ─────────────
exports.getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ landlord: req.user._id })
      .populate("renter", "firstName lastName username phoneNumber")
      .populate({
        path: "unit",
        populate: { path: "property", select: "name address" },
      });

    res.json(invitations);
  } catch (err) {
    console.error("getInvitations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/invitations/mine ─── Renter sees their own invitations ──────────
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      renter: req.user._id,
      status: "pending",
    })
      .populate("landlord", "firstName lastName username phoneNumber")
      .populate({
        path: "unit",
        populate: { path: "property", select: "name address city" },
      });

    res.json(invitations);
  } catch (err) {
    console.error("getMyInvitations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /api/invitations/:id/accept ─── Renter accepts an invitation ───────
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    // Verify this invitation belongs to the logged-in renter
    if (invitation.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    // Verify it's still pending
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "This invitation is no longer pending." });
    }

    // Verify it hasn't expired
    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "This invitation has expired." });
    }

    // Verify the unit is still available
    const unit = await Unit.findById(invitation.unit);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found." });
    }
    if (unit.status !== "available") {
      return res.status(400).json({ message: "This unit is no longer available." });
    }

    // Create the lease
    const lease = await Lease.create({
      renter: req.user._id,
      unit: unit._id,
      invitation: invitation._id,
      startDate: new Date(),
      monthlyRent: unit.rentAmount,
    });

    // Generate monthly pending payment records for 12 months
    const paymentDocs = [];
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(lease.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      paymentDocs.push({
        lease: lease._id,
        renter: req.user._id,
        amount: lease.monthlyRent,
        dueDate,
        status: "pending",
        method: "chapa",
        paymentGateway: "chapa",
      });
    }
    await Payment.insertMany(paymentDocs);

    // Mark unit as occupied
    unit.status = "occupied";
    unit.renter = req.user._id;
    await unit.save();

    // Mark invitation as accepted
    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation accepted.", lease });
  } catch (err) {
    console.error("acceptInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /api/invitations/:id/decline ─── Renter declines an invitation ─────
exports.declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    // Verify this invitation belongs to the logged-in renter
    if (invitation.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "This invitation is no longer pending." });
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation declined." });
  } catch (err) {
    console.error("declineInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/invitations/:id ─── Landlord cancels an invitation ───────────
exports.cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) return res.status(404).json({ message: "Invitation not found." });

    if (invitation.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    invitation.status = "cancelled";
    await invitation.save();

    res.json({ message: "Invitation cancelled." });
  } catch (err) {
    console.error("cancelInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};
