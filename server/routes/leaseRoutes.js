const express = require("express");
const {
  getLeases,
  getMyLease,
  getLease,
  updateLease,
} = require("../controllers/leaseControllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/mine", getMyLease);
router.get("/", getLeases);
router.get("/:id", getLease);
router.patch("/:id", updateLease);

module.exports = router;
