const express = require("express");
const {
  getLeases,
  getMyLease,
  getLease,
  updateLease,
} =  require("../controllers/leaseControllers.js");
const { isAuthenticated, isLandlord, isRenter } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/mine", isRenter, getMyLease);
router.get("/", isLandlord, getLeases);
router.get("/:id", getLease);            // landlord or renter
router.patch("/:id", isLandlord, updateLease);

module.exports = router;
