const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const isAuth = require("../middleware/isAuth");

router.get("/", isAuth, (req, res) => {
  res.render("upload", { title: "Upload", message: null });
});

router.post("/", isAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.render("upload", {
      title: "Upload",
      message: "File upload failed",
    });
  }
  res.render("upload", {
    title: "Upload",
    message: "File uploaded successfully!",
  });
});

module.exports = router;
