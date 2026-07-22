require("dotenv").config();
require("./middlewares/passport.js");
const express = require("express");
const session = require("express-session");
const Connect = require("./config/db.js");
const passport = require("passport");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes.js");
const dns = require("node:dns");
// dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

Connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());    

app.use(authRoutes);

module.exports = app;
