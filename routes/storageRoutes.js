const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

const {
  getStorage,
  createFolder,
  updateFolder,
  deleteFolder,
} = require("../controllers/storageController");

router.get("/", isAuth, getStorage);

router.post("/add", isAuth, createFolder);

router.post("/edit/:id", isAuth, updateFolder);

router.post("/delete/:id", isAuth, deleteFolder);

module.exports = router;
