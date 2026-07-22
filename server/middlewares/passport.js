console.log("passport.js loaded");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User.js");
const sendEmail = require("../config/nodemailer.js");
const findOrCreate = require("mongoose-findorcreate");

passport.use(User.createStrategy());
console.log("About to register Google strategy");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/rentora",
    },
    async function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id },
        { username: profile.emails[0].value },
        function (err, user) {
          if (!err) {
            sendEmail(profile.emails[0].value);
          }
          return cb(err, user);
        },
      );
    },
  ),
);
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});
