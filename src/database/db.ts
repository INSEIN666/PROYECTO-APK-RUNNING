import * as SQLite from 'expo-sqlite';

// Abre la base de datos SQLite de forma nativa
const db = SQLite.openDatabaseSync('bapesta_store.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS offline_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER,
        synced INTEGER DEFAULT 0
      );
    `);
    console.log("Base de datos SQLite inicializada correctamente.");
  } catch (error) {
    console.error("Error inicializando la base de datos:", error);
  }
};

export default db;