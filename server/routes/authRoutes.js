const router = require("express").Router();
const passport = require("passport");
const authControllers = require("../controllers/authControllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

router.post("/api/auth/register", authControllers.register);
router.post("/api/auth/login", authControllers.login);
router.post("/api/auth/logout", authControllers.logout);
router.get("/api/auth/me", authControllers.getCurrentUser);
router.post("/api/auth/change-password", isAuthenticated, authControllers.changePassword);

router.post(
  "/api/auth/complete-profile",
  isAuthenticated,
  authControllers.completeProfile,
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
    }
    res.redirect("/");
  });
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/rentora",
  (req, res) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.error("Google auth callback error:", err);
        return res.redirect(clientUrl + "/login");
      }

      if (!user) {
        return res.redirect(clientUrl + "/login");
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Google login error:", loginErr);
          return res.redirect(clientUrl + "/login");
        }

        if (!user.profileComplete) {
          return res.redirect(clientUrl + "/complete-profile");
        }

        return res.redirect(clientUrl + "/dashboard");
      });
    })(req, res);
  },
);

module.exports = router;
