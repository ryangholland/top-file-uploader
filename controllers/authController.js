const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/auth");
const prisma = new PrismaClient();

async function getRegister(req, res) {
  res.render("auth/register", { title: "Register", error: null });
}

async function createUser(req, res) {
  const { email, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    req.login(newUser, (err) => {
      if (err) return res.redirect("/auth/login");
      return res.redirect("/");
    });
  } catch (error) {
    res.render("auth/register", {
      title: "Register",
      error: "Email already exists",
    });
  }
}

async function getLogin(req, res) {
  const error = req.session.messages ? req.session.messages[0] : null;
  req.session.messages = [];
  res.render("auth/login", { title: "Login", error });
}

async function getLogout(req, res) {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.redirect("/auth/login");
  });
}

module.exports = { getRegister, createUser, getLogin, getLogout };
