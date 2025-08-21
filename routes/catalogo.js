// 📦 Dependencias
const express = require("express");
const router = express.Router();
const db = require("../database/db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "public/imagenes/" }); // Configuración básica

// 🛠️ Rutas de creación y edición
router.post("/nuevo", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file?.filename;

  if (!nombre || !descripcion || !precio || !imagen) {
    return res.status(400).send("Faltan datos del formulario");
  }

  db.run(
    `INSERT INTO vestidogala (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, imagen],
    function (err) {
      if (err) {
        console.error("Error al guardar vestido de gala:", err.message);
        return res.status(500).send("Error al guardar");
      }
      res.redirect("/catalogo/adgala");
    }
  );
});

router.post("/nuevo15", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file?.filename || "default.jpg"; // Imagen por defecto si no se sube

  db.run(
    `INSERT INTO vestido15 (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, imagen],
    function (err) {
      if (err) {
        console.error("Error al insertar vestido15:", err.message);
        return res.status(500).send("Error al guardar");
      }
      res.redirect("/catalogo/ad15"); // Redirige al catálogo
    }
  );
});

router.post("/editar/:id", upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const query = imagen
    ? `UPDATE vestidogala SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?`
    : `UPDATE vestidogala SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?`;

  const params = imagen
    ? [nombre, descripcion, precio, imagen, id]
    : [nombre, descripcion, precio, id];

  await db.run(query, params);
  res.redirect("/catalogo/adgala");
});

router.post("/editar15/:id", upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  const nuevaImagen = req.file?.filename;

  // Obtener imagen actual si no se subió una nueva
  db.get("SELECT imagen FROM vestido15 WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      console.error("Error al obtener vestido15:", err?.message);
      return res.status(404).send("Vestido no encontrado");
    }

    const imagenFinal = nuevaImagen || row.imagen;

    db.run(
      `UPDATE vestido15 SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?`,
      [nombre, descripcion, precio, imagenFinal, id],
      function (err) {
        if (err) {
          console.error("Error al editar vestido15:", err.message);
          return res.status(500).send("Error al actualizar");
        }
        res.redirect("/catalogo/ad15");
      }
    );
  });
});

// ➕ Ruta para agregar nuevo vestido autóctono
router.post("/nuevoautoc", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file.filename;

  db.run(
    `INSERT INTO vestidoautoc (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, imagen],
    (err) => {
      if (err) return res.status(500).send("Error al guardar");
      res.redirect("/catalogo/adautoc");
    }
  );
});

// ✏️ Ruta para editar vestido autóctono
router.post("/editarautoc/:id", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const { id } = req.params;

  if (req.file) {
    const nuevaImagen = req.file.filename;
    db.run(
      `UPDATE vestidoautoc SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?`,
      [nombre, descripcion, precio, nuevaImagen, id],
      (err) => {
        if (err) return res.status(500).send("Error al editar");
        res.redirect("/catalogo/adautoc");
      }
    );
  } else {
    db.run(
      `UPDATE vestidoautoc SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?`,
      [nombre, descripcion, precio, id],
      (err) => {
        if (err) return res.status(500).send("Error al editar");
        res.redirect("/catalogo/adautoc");
      }
    );
  }
});

// 🎨 Rutas públicas de catálogo
router.get("/nina", (req, res) => {
  db.all("SELECT * FROM vestidos ", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de niña:", err.message);
      return res.status(500).send("Error interno");
    }

    const usuario = req.session.usuario || null;

    res.render("catalogo_nina", {
      vestidos,
      usuario,
    });
  });
});

router.get("/gala", (req, res) => {
  db.all("SELECT * FROM vestidogala", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de gala:", err.message);
      return res.status(500).send("Error interno");
    }
    console.log("Vestidos de gala:", vestidos);
    res.render("catalogo_gala", { vestidos });
  });
});

router.get("/15", (req, res) => {
  db.all("SELECT * FROM vestido15", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de 15:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("catalogo_15", { vestidos });
  });
});

router.get("/autoc", (req, res) => {
  db.all("SELECT * FROM vestidoautoc", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos autóctonos:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("catalogo_autoc", { vestidos });
  });
});

router.get("/agenda", (req, res) => {
  db.all("SELECT * FROM citas ORDER BY fecha, hora", (err, citas) => {
    if (err) {
      console.error("Error al cargar citas:", err.message);
      return res.status(500).send("Error al cargar la agenda");
    }
    const usuario = req.session.usuario || null;

    res.render("agenda", { citas, usuario });
  });
});

// 🧑‍💼 Rutas administrativas
router.get("/adnina", (req, res) => {
  db.all("SELECT * FROM vestidos", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de niña:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("adcatalogo_nina", { vestidos });
  });
});

router.get("/adgala", (req, res) => {
  db.all("SELECT * FROM vestidogala", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de gala:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("adcatalogo_gala", { vestidos });
  });
});

router.get("/ad15", (req, res) => {
  db.all("SELECT * FROM vestido15", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de 15:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("adcatalogo_15", { vestidos });
  });
});

router.get("/adautoc", (req, res) => {
  db.all("SELECT * FROM vestidoautoc", (err, vestidos) => {
    if (err) {
      console.error("Error al cargar vestidos de 15:", err.message);
      return res.status(500).send("Error interno");
    }
    res.render("adcatalogo_autoc", { vestidos });
  });
});

// 🗑️ Eliminar vestido de gala
router.post("/eliminar/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM vestidogala WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error al eliminar:", err.message);
      return res.status(500).send("Error al eliminar vestido");
    }
    res.redirect("/catalogo/adgala"); // Ajustá según la categoría si lo generalizás
  });
});

router.post("/eliminar15/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT imagen FROM vestido15 WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      console.error("Error al obtener vestido:", err?.message);
      return res.status(404).send("Vestido no encontrado");
    }

    const imagen = row.imagen;

    db.run("DELETE FROM vestido15 WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Error al eliminar vestido15:", err.message);
        return res.status(500).send("Error al eliminar");
      }

      if (imagen && imagen !== "default.jpg") {
        const rutaImagen = path.join(__dirname, "../public/imagenes", imagen);
        fs.unlink(rutaImagen, (err) => {
          if (err) console.warn("No se pudo eliminar imagen:", err.message);
        });
      }

      res.redirect("/catalogo/ad15");
    });
  });
});

router.post("/eliminarautoc/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM vestidoautoc WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).send("Error al eliminar");
    res.redirect("/catalogo/adautoc");
  });
});

//agendar cita
router.post("/agenda", async (req, res) => {
  const { nombre, telefono, fecha, hora, servicio, mensaje } = req.body;

  if (!nombre || !telefono || !fecha || !hora) {
    return res.status(400).send("Faltan datos obligatorios");
  }

  try {
    await db.run(
      `INSERT INTO citas (nombre, telefono, fecha, hora, servicio, mensaje) VALUES (?, ?, ?, ?, ?,?)`,
      [nombre, telefono, fecha, hora, servicio, mensaje]
    );
    res.redirect("/catalogo/agenda");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al guardar la cita");
  }
});
/*
router.post("/agenda", async (req, res) => {
  const { nombre, telefono, fecha, hora, servicio, mensaje } = req.body;

  const citaExistente = await db.get(
    "SELECT * FROM citas WHERE fecha = ? AND hora = ?",
    [fecha, hora]
  );

  if (citaExistente) {
    return res.render("agenda", {
      usuario: { nombre, celular: telefono },
      datos: { fecha, hora, servicio, mensaje },
      error:
        "Ya existe una cita en ese horario. Por favor elige otro día u hora.",
    });
  }

  await db.run(
    "INSERT INTO citas (nombre, telefono, fecha, hora, servicio, mensaje) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, telefono, fecha, hora, servicio, mensaje]
  );

  res.redirect("/catalogo/agenda?confirmacion=ok");
});
*/
router.get("/catalogo/agenda", async (req, res) => {
  const { confirmacion } = req.query;
  const citas = await db.all("SELECT * FROM citas ORDER BY fecha, hora");

  res.render("agenda", {
    usuario: req.session.usuario,
    citas,
    confirmacion,
  });
});

module.exports = router;
