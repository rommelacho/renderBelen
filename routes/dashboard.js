// routes/dashboard.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const db = require("../database/db");

router.get("/dashboard", authMiddleware, (req, res) => {
  const usuario = req.session.usuario;

  db.all(`SELECT * FROM vestidos`, [], (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos:", err.message);
      return res.status(500).send("Error al cargar el catálogo");
    }

    res.render("dashboard", { usuario, vestidos });
  });
});

router.get("/dashboard", authMiddleware, (req, res) => {
  const usuario = req.session.usuario;
  res.render("dashboard", { usuario });
});

module.exports = router;
