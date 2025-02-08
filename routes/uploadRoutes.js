const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const supabase = require("../config/supabase");
const isAuth = require("../middleware/isAuth");

router.get("/", isAuth, (req, res) => {
  res.render("upload", { title: "Upload", message: null });
});

router.post("/", isAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.render("upload", {
      title: "Upload",
      message: "File upload failed",
    });
  }

  console.log(req.file);

  const { originalname, buffer, mimetype, size } = req.file;
  const filePath = `uploads/${Date.now()}_${originalname}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("Uploads")
    .upload(filePath, buffer, { contentType: mimetype });

  console.log("Supabase upload response:", { data, error });

  if (error) {
    return res.render("upload", {
      title: "Upload",
      message: error.message,
    });
  }

  // Save file metadata in Prisma
  await prisma.file.create({
    data: {
      name: originalname,
      path: filePath,
      userId: req.user.id,
      size: size,
    },
  });

  res.render("upload", {
    title: "Upload",
    message: `${originalname} uploaded successfully!`,
  });
});

module.exports = router;
