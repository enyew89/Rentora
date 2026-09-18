const express = require("express");
const { sendContactMessage } = require("../controllers/contactControllers.js");

const router = express.Router();

router.post("/", sendContactMessage);

module.exports = router;
