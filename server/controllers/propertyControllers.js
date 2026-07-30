const Property = require("../models/Property.js");
// GET /properties — landlord's own properties
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /properties/:id
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      landlord: req.user._id,
    });

    if (!property) return res.status(404).json({ message: "Property not found." });

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /properties
exports.createProperty = async (req, res) => {
  try {
    const { name, address, city, description } = req.body;

    const property = await Property.create({
      landlord: req.user._id,
      name,
      address,
      city,
      description,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /properties/:id
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id },
      req.body,
      { new: true }
    );

    if (!property) return res.status(404).json({ message: "Property not found." });

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      landlord: req.user._id,
    });

    if (!property) return res.status(404).json({ message: "Property not found." });

    res.json({ message: "Property deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};