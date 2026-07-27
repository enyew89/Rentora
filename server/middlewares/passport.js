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
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ username: email });

        if (user) {
          // User already exists

          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return cb(null, user);
        }

        // User doesn't exist, create a new one
        user = await User.create({
          username: email,
          googleId: profile.id,
          role: "landlord",
        });

        await sendEmail(
          email,
          "Welcome to Rentora",
          "Welcome to Rentora! Your account has been created successfully."
        );

        return cb(null, user);

      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});
