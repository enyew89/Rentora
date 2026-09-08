

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
      .populate("renter", "firstName lastName username phoneNumber")
      .populate({ path: "unit", populate: { path: "property" } });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMaintenanceRequests = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;
    const query = MaintenanceRequest.find({ renter: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "unit", populate: { path: "property" } });

    if (limit > 0) {
      query.limit(limit);
    }

    const requests = await query;
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id).populate({
      path: "unit",
      populate: { path: "property" },
    });

    if (!request) return res.status(404).json({ message: "Request not found." });

    const isRequestRenter = request.renter.toString() === req.user._id.toString();
    const isPropertyLandlord =
      request.unit.property.landlord.toString() === req.user._id.toString();

    if (!isRequestRenter && !isPropertyLandlord) {
      return res.status(403).json({ message: "Forbidden." });
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /maintenance — renter submits a request
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { unitId, title, description, priority } = req.body;

    const leaseQuery = {
      renter: req.user._id,
      status: "active",
    };

    if (unitId) {
      leaseQuery.unit = unitId;
    }

    // confirm renter has an active lease before creating the request
    const lease = await Lease.findOne(leaseQuery);

    if (!lease) {
      return res.status(403).json({ message: "No active lease found for this unit." });
    }

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const request = await MaintenanceRequest.create({
      renter: req.user._id,
      unit: lease.unit,
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
