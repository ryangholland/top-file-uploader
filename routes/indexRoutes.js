const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "File Uploader", error: null });
});

module.exports = router;
