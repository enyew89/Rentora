exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in." });
};

// Role-based middleware removed. Authorization is now relationship-based:
// - Landlord: Property.landlord === req.user._id
// - Renter: Lease.renter === req.user._id
// - Invitation: Invitation.renter === req.user._id
