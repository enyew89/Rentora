const express = require("express");
const Property = require("../models/Property.js");
const Unit = require("../models/Unit.js");
const {
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitControllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getUnits);
router.get("/all", async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);
    const units = await Unit.find({ property: { $in: propertyIds } }).populate(
      "renter",
      "firstName lastName username phoneNumber role"
    );
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/:id", getUnit);
router.post("/", createUnit);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);

module.exports = router;
