const express = require("express");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Register Route
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register", error: null });
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);

  try {
    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.redirect("/auth/login");
  } catch (error) {
    res.render("auth/register", {
      title: "Register",
      error: "Email already exists",
    });
  }
});

// Login Route
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login", error: null });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/auth/profile",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })
);

// Profile Route
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/auth/login");
  res.render("auth/profile", { title: "Profile", user: req.user });
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.redirect("/auth/login");
  });
});

module.exports = router;
