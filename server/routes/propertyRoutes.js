const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyControllers.js");
const { isAuthenticated, isLandlord } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated, isLandlord);

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", createProperty);
router.patch("/:id", updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;