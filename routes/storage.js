const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const isAuth = require("../middleware/isAuth");

router.get("/", isAuth, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
  });

  res.render("storage", { title: "Storage", user: req.user, folders });
});

router.post("/add", isAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.redirect("/storage");

  await prisma.folder.create({
    data: { name, userId: req.user.id },
  });

  res.redirect("/storage");
});

router.post("/edit/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await prisma.folder.update({
    where: { id },
    data: { name },
  });

  res.redirect("/storage");
});

router.post("/delete/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.folder.delete({
    where: { id },
  });

  res.redirect("/storage");
});

module.exports = router;
