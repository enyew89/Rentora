const Invitation = require("../models/Invitation.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const User = require("../models/User.js");
const Property = require("../models/Property.js");
const sendEmail = require("../config/nodemailer.js");

// ─── POST /api/invitations ─────────────────────────────────────────────────────
// Landlord creates an invitation for a specific renter email
exports.createInvitation = async (req, res) => {
  try {
    const { unitId, email } = req.body;

    if (!unitId || !email) {
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

    // Cancel any existing pending invite for this unit
    await Invitation.updateMany(
      { unit: unitId, status: "pending" },
      { status: "cancelled" }
    );

    const invitation = await Invitation.create({ unit: unitId, email });

    // Link points to the React page, not the API
    const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${invitation.token}`;

    sendEmail(
      email,
      "You've been invited to Rentora",
      `You have been invited to rent Unit ${unit.unitNumber} at ${unit.property.name}.\n\nAccept your invitation here:\n${inviteLink}\n\nThis link expires in 7 days.`
    );

    res.status(201).json({
      message: "Invitation sent.",
      inviteLink,
      invitation,
    });
  } catch (err) {
    console.error("createInvitation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/invitations ──────────────────────────────────────────────────────
// Landlord sees all invitations across their units
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
// Public — renter's page calls this on load to validate the token
// Returns invitation details for display (unit, property, email)
// Does NOT require login, does NOT create anything
exports.getInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token }).populate({
      path: "unit",
      populate: {
        path: "property",
        select: "name address",
      },
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
// Public — renter submits registration form
// Validates token → creates User → creates Lease → logs renter in
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

    // 2. Check if account already exists for this email
    const existing = await User.findOne({ username: invitation.email });
    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    // 3. Create renter account
    const user = new User({
      username: invitation.email,
      firstName,
      lastName,
      phoneNumber,
      role: "renter",
      profileComplete: true,
    });

    await user.setPassword(password); // passport-local-mongoose
    await user.save();

    // 4. Get unit
    const unit = await Unit.findById(invitation.unit);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found." });
    }

    // 5. Create lease
    const lease = await Lease.create({
      renter: user._id,
      unit: unit._id,
      invitation: invitation._id,
      startDate: new Date(),
      monthlyRent: unit.rentAmount,
    });

    // 6. Mark unit as occupied
    unit.status = "occupied";
    unit.renter = user._id;
    await unit.save();

    // 7. Mark invitation as accepted
    invitation.status = "accepted";
    await invitation.save();

    // 8. Log renter in automatically
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
        user: {
          _id: user._id,
          email: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        lease,
      });
    });
  } catch (err) {
    console.error("registerFromInvitation error:", err);
    res.status(500).json({ message: "Failed to create renter account." });
  }
};

// ─── DELETE /api/invitations/:id ──────────────────────────────────────────────
// Landlord cancels an invitation by its _id
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