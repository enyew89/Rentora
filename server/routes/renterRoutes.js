const express = require("express");
const { getRenters } = require("../controllers/renterControllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getRenters);

module.exports = router;
