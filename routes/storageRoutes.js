const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

const {
  getCurrentFolder,
  getStorage,
  createFolder,
  updateFolder,
  deleteFolder,
} = require("../controllers/storageController");

router.get("/:folderId", isAuth, getCurrentFolder);
router.get("/", isAuth, getStorage);

router.post("/create-folder", isAuth, createFolder);
router.post("/update-folder/:id", isAuth, updateFolder);
router.post("/delete-folder/:id", isAuth, deleteFolder);

module.exports = router;
