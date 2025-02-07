const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('@prisma/client');
const { comparePassword } = require('../utils/auth');

const prisma = new PrismaClient();

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return done(null, false, { message: 'User not found' });

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return done(null, false, { message: 'Incorrect password' });

  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

module.exports = passport;