const express = require("express");
const router = express.Router();
const {
  createInvitation,
  getInvitations,
  getInvitation,
  registerFromInvitation,
  cancelInvitation,
} = require("../controllers/invitationControllers.js");

const { isAuthenticated, isLandlord, isRenter} = require("../middlewares/auth.js");

// ── Landlord routes (protected) ───────────────────────────────────────────────
router.post("/", isAuthenticated, createInvitation);
router.get("/", isAuthenticated, getInvitations);
router.delete("/:id", isAuthenticated, cancelInvitation);

// ── Public routes — no login required ─────────────────────────────────────────
// IMPORTANT: /accept must be defined BEFORE /:token
// otherwise Express matches "accept" as the token
router.post("/accept", registerFromInvitation);
router.get("/:token", getInvitation);

module.exports = router;