exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in." });
};

exports.isLandlord = (req, res, next) => {
  if (req.user?.role === "landlord" || req.user?.role === "admin") return next();
  res.status(403).json({ message: "Landlord access only." });
};

exports.isRenter = (req, res, next) => {
  if (req.user?.role === "renter" || req.user?.role === "admin") return next();
  res.status(403).json({ message: "Renter access only." });
};