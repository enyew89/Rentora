const Invitation = require("../models/Invitation.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const User = require("../models/User.js");
// POST /invitations — landlord sends invite
exports.createInvitation = async (req, res) => {
  try {
    const { unitId, email } = req.body;

    // confirm unit belongs to this landlord
    const unit = await Unit.findById(unitId).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (unit.status !== "available") {
      return res.status(400).json({ message: "Unit is not available." });
    }

    // cancel any existing pending invite for this unit
    await Invitation.updateMany(
      { unit: unitId, status: "pending" },
      { status: "cancelled" }
    );

    const invitation = await Invitation.create({ unit: unitId, email });

    // TODO: send invitation email with invitation.token

    res.status(201).json({ message: "Invitation sent.", invitation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /invitations — landlord sees all invitations across their units
exports.getInvitations = async (req, res) => {
  try {
    // get all units belonging to this landlord's properties
    const { Property } = await import("../models/Property.js");
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id");
    const unitIds = units.map((u) => u._id);

    const invitations = await Invitation.find({ unit: { $in: unitIds } }).populate({
      path: "unit",
      populate: { path: "property" },
    });

    res.json(invitations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /invitations/accept/:token — renter opens invitation link
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token }).populate({
      path: "unit",
      populate: { path: "property", populate: { path: "landlord" } },
    });

    if (!invitation) return res.status(404).json({ message: "Invitation not found." });
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: `Invitation is ${invitation.status}.` });
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Invitation has expired." });
    }

    // renter must be logged in at this point
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Please log in or register to accept." });
    }

    const unit = invitation.unit;

    // create the lease
    const lease = await Lease.create({
      renter: req.user._id,
      unit: unit._id,
      invitation: invitation._id,
      startDate: new Date(),
      monthlyRent: unit.rentAmount,
    });

    // mark unit as occupied
    unit.status = "occupied";
    await unit.save();

    // mark invitation as accepted
    invitation.status = "accepted";
    await invitation.save();

    res.status(201).json({ message: "Invitation accepted. Lease created.", lease });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /invitations/:id — landlord cancels
exports.cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!invitation) return res.status(404).json({ message: "Invitation not found." });

    if (invitation.unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    invitation.status = "cancelled";
    await invitation.save();

    res.json({ message: "Invitation cancelled." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};