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
const { isAuthenticated } = require("../middlewares/auth.js");

const router = express.Router();

// ─── PUBLIC — no isAuthenticated, Chapa calls this directly ───
router.post("/webhook", webhook);

// ─── PROTECTED ─────────────────────────────────────────────────
router.use(isAuthenticated);

router.get("/mine", getMyPayments);
router.get("/", getPayments);
router.post("/", createPayment);
router.post("/initialize", initializePayment);
router.get("/verify/:tx_ref", verifyPayment);
router.patch("/:id", updatePayment);

module.exports = router;
