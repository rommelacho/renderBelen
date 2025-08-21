const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware base
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Sesiones primero
app.use(
  session({
    secret: "belen-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Luego variables globales
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.error = null;
  res.locals.mensaje = null;
  res.locals.email = "";
  next();
});

// Rutas
const mainRoutes = require("./routes/main");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const catalogoRouter = require("./routes/catalogo");
const vestidosRoutes = require("./routes/vestidos");

app.use("/catalogo", catalogoRouter);
app.use("/", mainRoutes);
app.use(authRoutes);
app.use("/", dashboardRoutes);
app.use("/", vestidosRoutes);
app.use(express.static("public"));

// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
