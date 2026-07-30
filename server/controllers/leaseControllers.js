const Lease = require("../models/Lease.js");
const User = require("../models/User.js");
const Property = require("../models/Property.js");

// GET /leases — landlord sees all active leases
exports.getLeases = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id");
    const unitIds = units.map((u) => u._id);

    const leases = await Lease.find({ unit: { $in: unitIds } })
      .populate("renter", "firstName lastName email phone")
      .populate({ path: "unit", populate: { path: "property" } });

    res.json(leases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /leases/:id
exports.getLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate("renter", "firstName lastName email phone")
      .populate({ path: "unit", populate: { path: "property" } });

    if (!lease) return res.status(404).json({ message: "Lease not found." });

    const landlordId = lease.unit.property.landlord.toString();
    const isLandlord = landlordId === req.user._id.toString();
    const isRenter = lease.renter._id.toString() === req.user._id.toString();

    if (!isLandlord && !isRenter) {
      return res.status(403).json({ message: "Forbidden." });
    }

    res.json(lease);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /leases/:id — landlord updates status, end date, notes
exports.updateLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!lease) return res.status(404).json({ message: "Lease not found." });

    if (lease.unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { status, endDate, notes } = req.body;
    if (status) lease.status = status;
    if (endDate) lease.endDate = endDate;
    if (notes) lease.notes = notes;

    // if terminated, free up the unit
    if (status === "terminated" || status === "expired") {
      lease.unit.status = "available";
      await lease.unit.save();
    }

    await lease.save();
    res.json(lease);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};