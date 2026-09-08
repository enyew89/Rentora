const passport = require("passport");
const User = require("../models/User.js");
const sendEmail = require("../config/nodemailer.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const Property = require("../models/Property.js");
const Lease = require("../models/Lease.js");

function formatUser(user) {
  return {
    id: user._id,
    email: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    profileComplete: user.profileComplete,
    hasProperties: user._hasProperties || false,
    hasLeases: user._hasLeases || false,
  };
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

exports.register = async function (req, res) {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ username: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });
    }

    const user = new User({ username: normalizedEmail });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, function (err) {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Registration succeeded but login failed" });
      }

      sendEmail(
        normalizedEmail,
        "Welcome to Rentora",
        "Welcome to Rentora! Your account has been created successfully.",
      );

      return res.status(201).json({ user: formatUser(registeredUser) });
    });
  } catch (err) {
    if (err.name === "UserExistsError") {
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = function (req, res, next) {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  req.body.username = normalizedEmail;

  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Login failed" });
    }
    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid email or password",
      });
    }

    req.login(user, function (loginErr) {
      if (loginErr) {
        console.error(loginErr);
        return res.status(500).json({ message: "Login failed" });
      }
      return res.json({ user: formatUser(user) });
    });
  })(req, res, next);
};

exports.completeProfile = async function (req, res) {
  const { firstName, lastName, phoneNumber } = req.body;

  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({
      message: "All profile fields are required",
    });
  }

  try {
    req.user.firstName = firstName;
    req.user.lastName = lastName;
    req.user.phoneNumber = phoneNumber;
    req.user.profileComplete = true;

    const savedUser = await req.user.save();

    // Important: update the current session user
    req.user = savedUser;

    console.log("PROFILE UPDATED:");
    console.log(savedUser);

    return res.status(200).json({
      user: formatUser(savedUser),
    });
  } catch (err) {
    console.error("COMPLETE PROFILE ERROR:", err);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

exports.getCurrentUser = async function (req, res) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const freshUser = await User.findById(req.user._id).select("+hash +salt");
    if (!freshUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check what this user can do based on relationships
    const [hasProperties, hasLeases] = await Promise.all([
      Property.exists({ landlord: freshUser._id }),
      Lease.exists({ renter: freshUser._id }),
    ]);

    freshUser._hasProperties = !!hasProperties;
    freshUser._hasLeases = !!hasLeases;

    return res.status(200).json({
      user: formatUser(freshUser),
      hash: freshUser.hash ? true : false,
    });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);
    return res.status(500).json({ message: "Failed to get current user" });
  }
};

exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (destroyErr) {
      if (destroyErr) {
        console.error(destroyErr);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
};

exports.changePassword = async function (req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      message: "New password must be at least 8 characters",
    });
  }

  try {
    const user = await User.findById(req.user._id).select("+hash +salt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("Has password:", Boolean(user.hash));
    console.log("Current password provided:", Boolean(currentPassword));

    // User already has a password
    if (user.hash) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required",
        });
      }

      user.authenticate(currentPassword, async (err, authenticatedUser) => {
        if (err) {
          console.error("AUTHENTICATION ERROR:", err);

          return res.status(500).json({
            message: "Failed to verify current password",
          });
        }

        console.log(
          "Password authentication result:",
          authenticatedUser ? "CORRECT" : "INCORRECT"
        );

        if (!authenticatedUser) {
          return res.status(401).json({
            message: "Current password is incorrect",
          });
        }

        try {
          await user.setPassword(newPassword);
          await user.save();

          return res.status(200).json({
            message: "Password changed successfully",
          });
        } catch (error) {
          console.error("PASSWORD UPDATE ERROR:", error);

          return res.status(500).json({
            message: "Failed to change password",
          });
        }
      });

      return;
    }

    // User has no password (Google-only account)
    await user.setPassword(newPassword);
    await user.save();

    return res.status(200).json({
      message: "Password set successfully",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);

    return res.status(500).json({
      message: "Failed to change password",
    });
  }
};
