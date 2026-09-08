require("dotenv").config();
require("./middlewares/passport.js");
const express = require("express");
const session = require("express-session");
const Connect = require("./config/db.js");
const passport = require("passport");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes.js");
const maintenanceRoutes = require("./routes/maintenanceRoutes.js");
const propertyRoutes = require("./routes/propertyRoutes.js");
const unitRoutes = require("./routes/unitRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const invitationRoutes = require("./routes/invitationRoutes.js");
const leaseRoutes = require("./routes/leaseRoutes.js");
const renterRoutes = require("./routes/renterRoutes.js");

const dns = require("node:dns");
// dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

Connect();

const app = express();

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",  // your Vite frontend
  credentials: true,                // required for sessions/cookies
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());    

app.use(authRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/renters", renterRoutes);

module.exports = app;
