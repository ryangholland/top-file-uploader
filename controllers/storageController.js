const { PrismaClient } = require("@prisma/client");
const supabase = require("../config/supabase");
const prisma = new PrismaClient();
const https = require("https");

async function getCurrentFolder(req, res) {
  const folderId = req.params.folderId;

  if (folderId === "root") {
    req.session.currentFolder = null;
    req.session.parentFolder = null;
    return res.redirect("/storage");
  }

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
      parentId: folderId === "root" ? null : folderId,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folderId: folderId === "root" ? null : folderId,
    },
  });

  res.render("storage", {
    title: "Storage",
    folder,
    subFolders,
    files,
  });
}

async function createFolder(req, res) {
  const { folderName } = req.body;
  if (!folderName) return res.redirect("/storage");

  await prisma.folder.create({
    data: {
      name: folderName,
      userId: req.user.id,
      parentId: req.session.currentFolder,
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

async function uploadFile(req, res) {
  if (!req.file) {
    // TODO: Display error to user in modal
    res.redirect("/storage");
  }

  const { originalname, buffer, mimetype, size } = req.file;
  const filePath = `/${Date.now()}_${originalname}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("Uploads")
    .upload(filePath, buffer, { contentType: mimetype });

  console.log("Supabase upload response:", { data, error });

  if (error) {
    // TODO: Display error to user in modal
    res.redirect("/storage");
  }

  // Save file metadata in Prisma
  await prisma.file.create({
    data: {
      name: originalname,
      path: filePath,
      userId: req.user.id,
      size: size,
      folderId: req.session.currentFolder,
    },
  });

  // to get supabase public URL:
  // url: supabase.storage.from("Uploads").getPublicUrl(file.path).data.publicUrl

  // TODO: Display success message to user
  console.log(`${originalname} uploaded successfully!`);

  // TODO: Better way to do this?
  if (req.session.currentFolder) {
    res.redirect(`/storage/${req.session.currentFolder}`);
  } else {
    res.redirect("/storage");
  }
}

async function downloadFile(req, res) {
  const fileId = req.params.fileId;

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    // Generate a signed URL to access the file from Supabase
    const { data, error } = await supabase.storage
      .from("Uploads")
      .createSignedUrl(file.path, 60); // 60 seconds expiration

    if (error || !data?.signedUrl) {
      console.error("Error generating signed URL:", error);
      return res.status(500).send("Error generating download link");
    }

    // Fetch the file from Supabase using built-in https
    https
      .get(data.signedUrl, (fileResponse) => {
        if (fileResponse.statusCode !== 200) {
          console.error(
            "Failed to fetch file, status:",
            fileResponse.statusCode
          );
          return res.status(500).send("Error fetching file");
        }

        // Set headers to trigger file download
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${file.name}"`
        );
        res.setHeader("Content-Type", "application/octet-stream");

        // Pipe the file directly to the response
        fileResponse.pipe(res);
      })
      .on("error", (err) => {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).send("Error fetching file");
        }
      });

    // TODO: Make a "View File" button 
    // TODO: Open in new tab/window  
    // Redirect the user to the signed URL to download the file
    // res.redirect(data.signedUrl);
  } catch (err) {
    console.error("Download error:", err);
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
}

async function getFile(req, res) {
  const fileId = req.params.fileId;

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    return res.status(404).send("File not found");
  }

  res.render("file", {
    title: "File Information",
    file,
  });
}

module.exports = {
  getCurrentFolder,
  getStorage,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFile,
  downloadFile,
  getFile,
};
