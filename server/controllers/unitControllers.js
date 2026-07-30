const Unit = require("../models/Unit.js");
const Property = require("../models/Property.js");

// helper — confirm the property belongs to the logged-in landlord
const landlordOwnsProperty = async (propertyId, userId) => {
  const property = await Property.findOne({ _id: propertyId, landlord: userId });
  return !!property;
};

// GET /units?property=:propertyId
exports.getUnits = async (req, res) => {
  try {
    const { property } = req.query;
    if (!property) return res.status(400).json({ message: "property query param required." });

    const owns = await landlordOwnsProperty(property, req.user._id);
    if (!owns) return res.status(403).json({ message: "Forbidden." });

    const units = await Unit.find({ property });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /units/:id
exports.getUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /units
exports.createUnit = async (req, res) => {
  try {
    const { property, unitNumber, bedrooms, bathrooms, rentAmount, floor, size } = req.body;

    const owns = await landlordOwnsProperty(property, req.user._id);
    if (!owns) return res.status(403).json({ message: "Forbidden." });

    const unit = await Unit.create({
      property,
      unitNumber,
      bedrooms,
      bathrooms,
      rentAmount,
      floor,
      size,
    });

    res.status(201).json(unit);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Unit number already exists in this property." });
    }
    res.status(500).json({ message: err.message });
  }
};

// PATCH /units/:id
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    Object.assign(unit, req.body);
    await unit.save();

    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /units/:id
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate("property");
    if (!unit) return res.status(404).json({ message: "Unit not found." });

    if (unit.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    await unit.deleteOne();
    res.json({ message: "Unit deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};