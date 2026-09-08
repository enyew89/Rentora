const express = require("express");
const router = express.Router();
const {
  createInvitation,
  getInvitations,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
} = require("../controllers/invitationControllers.js");

const { isAuthenticated } = require("../middlewares/auth.js");

// ── Landlord routes ──────────────────────────────────────────────────────
router.post("/", isAuthenticated, createInvitation);
router.get("/", isAuthenticated, getInvitations);
router.delete("/:id", isAuthenticated, cancelInvitation);

// ── Renter routes ────────────────────────────────────────────────────────
router.get("/mine", isAuthenticated, getMyInvitations);
router.patch("/:id/accept", isAuthenticated, acceptInvitation);
router.patch("/:id/decline", isAuthenticated, declineInvitation);

module.exports = router;
