// routes/main.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { titulo: "Bienvenidos a Belén Escobar" });
});

module.exports = router;
