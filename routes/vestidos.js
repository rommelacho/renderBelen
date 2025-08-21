// 📦 Importación de módulos
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const db = require("../database/db");
const authMiddleware = require("../middlewares/authMiddleware");

// 🖼️ Configuración de almacenamiento para imágenes con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/imagenes"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `vestido-${timestamp}${ext}`); // Nombre único para evitar colisiones
  },
});

const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/* 🆕 CREAR VESTIDO                                                            */
/* -------------------------------------------------------------------------- */

// 🖼️ Vista para formulario de nuevo vestido
router.get("/vestidos/nuevo", authMiddleware, (req, res) => {
  res.render("vestidos_nuevo");
});

// 📥 Procesar creación de vestido con imagen
router.post(
  "/vestidos/nuevo",
  authMiddleware,
  upload.single("imagen"),
  (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const imagen = req.file?.filename;

    if (!nombre || !descripcion || !precio || !imagen) {
      return res.status(400).send("Faltan datos del formulario");
    }

    db.run(
      `INSERT INTO vestidos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)`,
      [nombre, descripcion, precio, imagen],
      function (err) {
        if (err) {
          console.error("Error al agregar vestido:", err.message);
          return res.status(500).send("Error al guardar el vestido");
        }
        res.redirect("/catalogo/adnina");
      }
    );
  }
);

/* -------------------------------------------------------------------------- */
/* ✏️ EDITAR VESTIDO                                                           */
/* -------------------------------------------------------------------------- */

// 🖼️ Vista para editar vestido (no usada actualmente)
router.get("/vestidos/editar/:id", authMiddleware, (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM vestidos WHERE id = ?`, [id], (err, vestido) => {
    if (err || !vestido) {
      return res.status(404).send("Vestido no encontrado");
    }
    res.render("/", { vestido }); // ⚠️ Esta vista parece incompleta o incorrecta
  });
});

// 📥 Procesar edición de vestido con posible nueva imagen
router.post(
  "/vestidos/editar/:id",
  authMiddleware,
  upload.single("imagen"),
  (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio } = req.body;
    const nuevaImagen = req.file?.filename;

    // Obtener imagen actual si no se subió una nueva
    db.get("SELECT imagen FROM vestidos WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.error("Error al obtener imagen actual:", err.message);
        return res.status(500).send("Error interno");
      }

      const imagenFinal = nuevaImagen || row.imagen;

      db.run(
        `UPDATE vestidos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?`,
        [nombre, descripcion, precio, imagenFinal, id],
        function (err) {
          if (err) {
            console.error("Error al editar vestido:", err.message);
            return res.status(500).send("Error al actualizar");
          }
          res.redirect("/catalogo/adnina");
        }
      );
    });
  }
);

/* -------------------------------------------------------------------------- */
/* 🗑️ ELIMINAR VESTIDO                                                         */
/* -------------------------------------------------------------------------- */

// 🧹 Eliminar vestido por ID (protegido por autenticación)
router.post("/vestidos/eliminar/:id", authMiddleware, (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM vestidos WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Error al eliminar vestido:", err.message);
      return res.status(500).send("Error al eliminar");
    }

    console.log(`Vestido con ID ${id} eliminado correctamente`);
    res.redirect("/catalogo/adnina");
  });
});

/* -------------------------------------------------------------------------- */
/* 📦 Exportación del router                                                   */
/* -------------------------------------------------------------------------- */

module.exports = router;
