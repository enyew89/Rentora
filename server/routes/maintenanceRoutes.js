const express = require("express");
const {
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} = require("../controllers/maintenanceControllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/mine", getMyMaintenanceRequests);
router.get("/:id", getMaintenanceRequest);
router.get("/", getMaintenanceRequests);
router.post("/", createMaintenanceRequest);
router.patch("/:id", updateMaintenanceRequest);

module.exports = router;
