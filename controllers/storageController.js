const { PrismaClient } = require("@prisma/client");
const supabase = require("../config/supabase");
const prisma = new PrismaClient();

async function getStorage(req, res) {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
  });

  const dbfiles = await prisma.file.findMany({
    where: { userId: req.user.id },
  });

  const files = dbfiles.map((file) => ({
    ...file,
    url: supabase.storage.from("Uploads").getPublicUrl(file.path).data
      .publicUrl,
  }));

  console.log(files)

  res.render("storage", { title: "Storage", user: req.user, folders, files });
}

async function createFolder(req, res) {
  const { name } = req.body;
  if (!name) return res.redirect("/storage");

  await prisma.folder.create({
    data: { name, userId: req.user.id },
  });

  res.redirect("/storage");
}

async function updateFolder(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  await prisma.folder.update({
    where: { id },
    data: { name },
  });

  res.redirect("/storage");
}

async function deleteFolder(req, res) {
  const { id } = req.params;
  await prisma.folder.delete({
    where: { id },
  });

  res.redirect("/storage");
}

module.exports = { getStorage, createFolder, updateFolder, deleteFolder };
