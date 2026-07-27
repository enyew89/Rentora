const passport = require("passport");
const User = require("../models/User.js");
const sendEmail = require("../config/nodemailer.js");

function formatUser(user) {
  return {
    id: user._id,
    email: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileComplete: user.profileComplete,
    
  };
}

exports.register = async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = new User({ username: email, role: "landlord" });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, function (err) {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Registration succeeded but login failed" });
      }

      sendEmail(
        email,
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

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  req.body.username = email;

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
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const freshUser = await User.findById(req.user._id).select("+hash +salt");
    console.log("Fetched current user:", freshUser.hash ? "Has password" : "No password");
    if (!freshUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: formatUser(freshUser),
      hash: freshUser.hash ? true : false,
    });
  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);

    return res.status(500).json({
      message: "Failed to get current user",
    });
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
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user.hash) {
      // Local user — verify current password first
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      user.authenticate(currentPassword, async function (err, result) {
        if (err || !result) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }

        await user.setPassword(newPassword);
        await user.save();

        return res
          .status(200)
          .json({ message: "Password changed successfully" });
      });
    } else {
      // Google OAuth user — no current password needed
      await user.setPassword(newPassword);
      await user.save();

      return res.status(200).json({ message: "Password set successfully" });
    }
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Failed to change password" });
  }
};
