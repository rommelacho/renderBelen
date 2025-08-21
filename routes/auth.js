// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    mensaje: null,
    email: "",
  });
});
router.post("/login", authController.login);

router.get("/registro", (req, res) => res.render("registro"));
router.post("/registro", authController.registrar);

router.get("/logout", authController.logout);
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.redirect("/"); // o redirigí a donde prefieras
  });
});

module.exports = router;
