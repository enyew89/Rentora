const express = require("express");
const { getRenters } = require("../controllers/renterControllers.js");
const { isAuthenticated, isLandlord } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", isLandlord, getRenters);

module.exports = router;