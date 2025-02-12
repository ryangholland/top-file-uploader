const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  getCurrentFolder,
  getStorage,
  createFolder,
  updateFolder,
  deleteFolder,
  uploadFile,
  updateFile,
  deleteFile,
  getFile,
  downloadFile,
} = require("../controllers/storageController");

router.get("/:folderId", isAuth, getCurrentFolder);
router.get("/", isAuth, getStorage);

router.post("/create-folder", isAuth, createFolder);
router.post("/update-folder", isAuth, updateFolder);
router.post("/delete-folder/:id", isAuth, deleteFolder);

router.post("/upload-file", isAuth, upload.single("file"), uploadFile);
router.post("/update-file", isAuth, updateFile);
router.post("/delete-file/:id", isAuth, deleteFile);

router.get("/file/:fileId", isAuth, getFile);
router.get("/download/:fileId", isAuth, downloadFile);

module.exports = router;
