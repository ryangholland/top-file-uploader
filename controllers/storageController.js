const { PrismaClient } = require("@prisma/client");
const supabase = require("../config/supabase");
const prisma = new PrismaClient();

async function getCurrentFolder(req, res) {
  const folderId = req.params.folderId;
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    return res.status(404).send("Folder not found");
  }

  req.session.currentFolder = folderId;
  req.session.parentFolder = folder.parentId || null;

  res.redirect("/storage");
}

async function getStorage(req, res) {
  const folderId = req.session.currentFolder || "root";

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  const subFolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
    },
  });
  const files = await prisma.file.findMany({
    where: {
      folderId,
    },
  });

  console.log({ folder, subFolders, files });

  res.render("storage", {
    title: "Storage",
    folder,
    subFolders,
    files,
    parentFolder: req.session.parentFolder,
  });
}

async function createFolder(req, res) {
  const { folderName } = req.body;
  if (!folderName) return res.redirect("/storage");

  await prisma.folder.create({
    data: {
      name: folderName,
      userId: req.user.id,
      parentId: req.session.parentFolder,
    },
  });

  res.redirect("/storage");
}

// TODO : updateFolder
async function updateFolder(req, res) {
  // const { id } = req.params;
  // const { name } = req.body;
  // await prisma.folder.update({
  //   where: { id },
  //   data: { name },
  // });

  res.redirect("/storage");
}

// TODO : deleteFolder
async function deleteFolder(req, res) {
  // const { id } = req.params;
  // await prisma.folder.delete({
  //   where: { id },
  // });

  res.redirect("/storage");
}

module.exports = {
  getCurrentFolder,
  getStorage,
  createFolder,
  updateFolder,
  deleteFolder,
};
