const express = require("express");
const {
  getPayments,
  getMyPayments,
  createPayment,
  initializePayment,
  verifyPayment,
  webhook,
  updatePayment,
} = require("../controllers/paymentControllers.js");
const { isAuthenticated, isLandlord, isRenter } = require("../middlewares/auth.js");

const router = express.Router();

// ─── PUBLIC — no isAuthenticated, Chapa calls this directly ───
router.post("/webhook", webhook);

// ─── PROTECTED ─────────────────────────────────────────────────
router.use(isAuthenticated);

router.get("/mine", isRenter, getMyPayments);
router.get("/", isLandlord, getPayments);
router.post("/", isLandlord, createPayment);              // manual cash/cheque recording
router.post("/initialize", isRenter, initializePayment); // renter starts Chapa payment
router.get("/verify/:tx_ref", isRenter, verifyPayment);  // renter checks payment status
router.patch("/:id", isLandlord, updatePayment);

module.exports = router;