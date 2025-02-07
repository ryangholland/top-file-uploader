const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  getRegister,
  createUser,
  getLogin,
  getLogout,
} = require("../controllers/authController");

// Register Routes
router.get("/register", getRegister);
router.post("/register", createUser);

// Login Route
router.get("/login", getLogin);
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureMessage: true,
  }));

// Logout Route
router.get("/logout", getLogout);

module.exports = router;
