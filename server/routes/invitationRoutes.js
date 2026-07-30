const express = require("express");
const {
  createInvitation,
  getInvitations,
  acceptInvitation,
  cancelInvitation,
} = require("../controllers/invitationControllers.js");
const { isAuthenticated, isLandlord } = require("../middlewares/auth.js");

const router = express.Router();

// public — renter opens link from email (no auth needed to view, but auth needed to accept)
router.get("/accept/:token", acceptInvitation);

// landlord only
router.post("/", isAuthenticated, isLandlord, createInvitation);
router.get("/", isAuthenticated, isLandlord, getInvitations);
router.delete("/:id", isAuthenticated, isLandlord, cancelInvitation);

module.exports = router;