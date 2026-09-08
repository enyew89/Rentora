const Invitation = require("../models/Invitation.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const User = require("../models/User.js");
const Property = require("../models/Property.js");
const Payment = require("../models/Payment.js"); // ← added
const sendEmail = require("../config/nodemailer.js");

function formatUser(user) {
  return {
    id: user._id,
    email: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileComplete: user.profileComplete,
  };
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

// ─── POST /api/invitations ─────────────────────────────────────────────────────
exports.createInvitation = async (req, res) => {
  try {
    const { unitId, email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!unitId || !normalizedEmail) {
      return res.status(400).json({ message: "Unit ID and email are required." });
    }

    const unit = await Unit.findById(unitId).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (unit.status !== "available") {
      return res.status(400).json({ message: "Unit is not available." });
    }

    const existingUser = await User.findOne({ username: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please invite a different email address.",
      });
    }

    await Invitation.updateMany(
      { unit: unitId, status: "pending" },
      { status: "cancelled" }
    );

    const invitation = await Invitation.create({ unit: unitId, email: normalizedEmail });

    const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${invitation.token}`;

    sendEmail(
      normalizedEmail,
      "You've been invited to Rentora",
      `You have been invited to rent Unit ${unit.unitNumber} at ${unit.property.name}.\n\nAccept your invitation here:\n${inviteLink}\n\nThis link expires in 7 days.`
    );

    res.status(201).json({ message: "Invitation sent.", inviteLink, invitation });
  } catch (err) {
    console.error("createInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/invitations ──────────────────────────────────────────────────────
exports.getInvitations = async (req, res) => {
  try {
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
    console.error("getInvitations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/invitations/:token ───────────────────────────────────────────────
exports.getInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token }).populate({
      path: "unit",
      populate: { path: "property", select: "name address" },
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: `This invitation is ${invitation.status}.` });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "This invitation has expired." });
    }

    return res.status(200).json({
      invitation: {
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        unit: {
          unitNumber: invitation.unit.unitNumber,
          rentAmount: invitation.unit.rentAmount,
          bedrooms: invitation.unit.bedrooms,
          bathrooms: invitation.unit.bathrooms,
        },
        property: {
          name: invitation.unit.property.name,
          address: invitation.unit.property.address,
        },
      },
    });
  } catch (err) {
    console.error("getInvitation error:", err);
    res.status(500).json({ message: "Failed to load invitation." });
  }
};

// ─── POST /api/invitations/accept ─────────────────────────────────────────────
exports.registerFromInvitation = async (req, res) => {
  try {
    const { token, firstName, lastName, phoneNumber, password } = req.body;

    if (!token || !firstName || !lastName || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1. Find and validate invitation
    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: `This invitation is ${invitation.status}.` });
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "This invitation has expired." });
    }

    // 2. Get unit
    const unit = await Unit.findById(invitation.unit);
    if (!unit) return res.status(404).json({ message: "Unit not found." });
    if (unit.status !== "available") {
      return res.status(400).json({ message: "This unit is no longer available." });
    }

    // 3. Check for existing account
    const existing = await User.findOne({ username: invitation.email });
    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    // 4. Create renter account
    const user = new User({
      username: invitation.email,
      firstName,
      lastName,
      phoneNumber,
      role: "renter",
      profileComplete: true,
    });
    await user.setPassword(password);
    await user.save();

    // 5. Create lease
    const lease = await Lease.create({
      renter: user._id,
      unit: unit._id,
      invitation: invitation._id,
      startDate: new Date(),
      monthlyRent: unit.rentAmount,
    });

    // 6. Generate monthly pending payment records for 12 months ── NEW
    const paymentDocs = [];
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(lease.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      paymentDocs.push({
        lease: lease._id,
        renter: user._id,
        amount: lease.monthlyRent,
        dueDate,
        status: "pending",
        method: "chapa",
        paymentGateway: "chapa",
      });
    }
    await Payment.insertMany(paymentDocs);

    // 7. Mark unit as occupied
    unit.status = "occupied";
    unit.renter = user._id;
    await unit.save();

    // 8. Mark invitation as accepted
    invitation.status = "accepted";
    invitation.renter = user._id;
    invitation.acceptedAt = new Date();
    await invitation.save();

    // 9. Log renter in automatically
    req.login(user, (err) => {
      if (err) {
        console.error("Auto-login after registration failed:", err);
        return res.status(201).json({
          message: "Account created. Please log in.",
          autoLogin: false,
        });
      }

      return res.status(201).json({
        message: "Account created and invitation accepted.",
        autoLogin: true,
        user: formatUser(user),
        lease,
      });
    });
  } catch (err) {
    console.error("registerFromInvitation error:", err);
    res.status(500).json({ message: "Failed to create renter account." });
  }
};

// ─── DELETE /api/invitations/:id ──────────────────────────────────────────────
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
    console.error("cancelInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};