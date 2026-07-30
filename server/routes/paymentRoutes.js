const express = require("express");
const {
  getPayments,
  createPayment,
  updatePayment,
} = require("../controllers/paymentControllers.js");
const { isAuthenticated, isLandlord } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated, isLandlord);

router.get("/", getPayments);
router.post("/", createPayment);
router.patch("/:id", updatePayment);

module.exports = router;