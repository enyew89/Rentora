

const MaintenanceRequest = require("../models/MaintenanceRequest.js");
const Unit = require("../models/Unit.js");
const Property = require("../models/Property.js");
const Lease = require("../models/Lease.js");  

// GET /maintenance — landlord sees all requests across their properties
exports.getMaintenanceRequests = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id");
    const unitIds = units.map((u) => u._id);

    const requests = await MaintenanceRequest.find({ unit: { $in: unitIds } })
      .populate("renter", "firstName lastName email phone")
      .populate({ path: "unit", populate: { path: "property" } });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /maintenance — renter submits a request
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { unitId, title, description, priority } = req.body;

    // confirm renter has an active lease on this unit
    const lease = await Lease.findOne({
      renter: req.user._id,
      unit: unitId,
      status: "active",
    });

    if (!lease) {
      return res.status(403).json({ message: "No active lease found for this unit." });
    }

    const request = await MaintenanceRequest.create({
      renter: req.user._id,
      unit: unitId,
      title,
      description,
      priority,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /maintenance/:id — landlord updates status/notes
exports.updateMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!request) return res.status(404).json({ message: "Request not found." });

    if (request.unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { status, notes } = req.body;
    if (status) request.status = status;
    if (notes) request.notes = notes;
    if (status === "completed") request.resolvedAt = new Date();

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};