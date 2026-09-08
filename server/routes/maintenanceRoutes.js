const express = require("express");
const {
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} = require("../controllers/maintenanceControllers.js");
const { isAuthenticated, isLandlord, isRenter } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/mine", isRenter, getMyMaintenanceRequests);
router.get("/:id", getMaintenanceRequest);
router.get("/", isLandlord, getMaintenanceRequests);
router.post("/", isRenter, createMaintenanceRequest);
router.patch("/:id", isLandlord, updateMaintenanceRequest);

module.exports = router;
