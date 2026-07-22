import passport from "passport";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";


exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.register = async function (req, res) {
  try {
    const user = await User.register(
      { username: req.body.email },
      req.body.password,
    );

    req.login(user, function (err) {
      if (err) {
        console.error(err);
        return res.redirect("/register");
      }
      sendWelcomeEmail(req.body.email);
      return res.redirect("/secrets");
    });
  } catch (err) {
    console.error(err);
    return res.redirect("/register");
  }
};

exports.login = function (req, res) {
  const user = new User({
    username: req.body.email,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
};
