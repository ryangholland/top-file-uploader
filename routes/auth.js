const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ message: 'User registered', user });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login Route
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successfully', user: req.user });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Protected Route Example
router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;