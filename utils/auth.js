const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(plainText, hashed) {
  return await bcrypt.compare(plainText, hashed);
}

module.exports = { hashPassword, comparePassword };
