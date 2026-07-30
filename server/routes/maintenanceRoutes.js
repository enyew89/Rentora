const express = require("express");
const {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} = require("../controllers/maintenanceControllers.js");
const { isAuthenticated, isLandlord, isRenter } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", isLandlord, getMaintenanceRequests);
router.post("/", isRenter, createMaintenanceRequest);
router.patch("/:id", isLandlord, updateMaintenanceRequest);

module.exports = router;