// database/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "belen.db");
const db = new sqlite3.Database(dbPath);

console.log("Base de datos conectada correctamente");
// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

db.run(`
  CREATE TABLE IF NOT EXISTS vestidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL,
    imagen TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS vestidogala (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL,
    imagen TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS vestido15 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL,
    imagen TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS vestidoautoc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL,
    imagen TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS accesorio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL,
    imagen TEXT
  )
`);
module.exports = db;
