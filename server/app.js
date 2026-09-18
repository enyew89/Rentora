require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("./middlewares/passport.js");
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
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
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGOOSE_CONNECTION_STRING,
      collectionName: "sessions",
    }),
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

// ── Serve client build in production ────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  // SPA fallback — serve index.html for any non-API route
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

module.exports = app;
