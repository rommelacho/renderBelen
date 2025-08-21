const bcrypt = require("bcryptjs");
const db = require("../database/db");

// Registro de usuario
exports.registrar = (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.render("registro", {
      error: "Todos los campos son obligatorios",
      mensaje: null,
      nombre,
      email,
    });
  }

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Error al consultar email:", err.message);
      return res.render("registro", {
        error: "Error interno al verificar el email",
        mensaje: null,
        nombre,
        email,
      });
    }

    if (row) {
      return res.render("registro", {
        error: "Este correo ya está registrado",
        mensaje: null,
        nombre,
        email,
      });
    }

    const hash = bcrypt.hashSync(password, 10);

    db.run(
      `INSERT INTO usuarios (nombre, email, password, celular) VALUES (?, ?, ?, ?)`,
      [nombre, email, hash, ""], // celular vacío por defecto
      function (err) {
        if (err) {
          console.error("Error al registrar:", err.message);
          return res.render("registro", {
            error: "Error al registrar el usuario",
            mensaje: null,
            nombre,
            email,
          });
        }

        // Registro exitoso, redirigir con mensaje
        return res.render("login", {
          error: null,
          mensaje: "Registro exitoso. Iniciá sesión.",
          email,
        });
      }
    );
  });
};

// Inicio de sesión
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      error: "Correo y contraseña son obligatorios",
      mensaje: null,
      email,
    });
  }

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, usuario) => {
    if (err) {
      console.error("Error al buscar usuario:", err.message);
      return res.render("login", {
        error: "Error interno al buscar el usuario",
        mensaje: null,
        email,
      });
    }

    if (!usuario) {
      return res.render("login", {
        error: "Usuario no encontrado",
        mensaje: null,
        email,
      });
    }

    const esValido = bcrypt.compareSync(password, usuario.password);
    if (!esValido) {
      return res.render("login", {
        error: "Contraseña incorrecta",
        mensaje: null,
        email,
      });
    }

    req.session.usuario = usuario;

    const destino = usuario.email === "rommel@gmail.com" ? "adindex" : "index";
    return res.render(destino, { usuario });
  });
};

//crear usuario:
exports.registrar = (req, res) => {
  const { nombre, email, password, celular } = req.body;

  if (!nombre || !email || !password || !celular) {
    return res.render("registro", {
      error: "Todos los campos son obligatorios",
      mensaje: null,
      nombre,
      email,
      celular,
    });
  }

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Error al consultar email:", err.message);
      return res.render("registro", {
        error: "Error interno al verificar el correo",
        mensaje: null,
        nombre,
        email,
        celular,
      });
    }

    if (row) {
      return res.render("registro", {
        error: "Este correo ya está registrado",
        mensaje: null,
        nombre,
        email,
        celular,
      });
    }

    const hash = bcrypt.hashSync(password, 10);

    db.run(
      `INSERT INTO usuarios (nombre, email, password, celular) VALUES (?, ?, ?, ?)`,
      [nombre, email, hash, celular],
      function (err) {
        if (err) {
          console.error("Error al registrar:", err.message);
          return res.render("registro", {
            error: "Error al registrar el usuario",
            mensaje: null,
            nombre,
            email,
            celular,
          });
        }

        res.render("login", {
          error: null,
          mensaje: "Registro exitoso. Iniciá sesión.",
          email,
        });
      }
    );
  });
};

// Cierre de sesión
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.render("login", {
      error: null,
      mensaje: "Sesión cerrada correctamente",
      email: "",
    });
  });
};
