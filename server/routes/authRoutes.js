const router = require("express").Router();
const passport = require("passport")

router.get("/login", (req, res) => {
  res.send("Login route");
});

router.get("/register", (req, res) => {
  res.send("Register route");
}); 

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
    }
    res.redirect("/");
  });
});

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/rentora", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  res.redirect("http://localhost:5173/complete-profile");
}); 

module.exports = router;
    

