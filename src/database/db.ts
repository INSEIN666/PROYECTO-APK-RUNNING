import * as SQLite from 'expo-sqlite';

// Abrir o crear la base de datos local
export const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('bapesta_offline.db');
  return db;
};

// Inicializar las tablas necesarias (Usuarios y Pedidos/Sincronización)
export const initDatabase = async () => {
  try {
    const db = await openDatabase();

    // Tabla de Usuarios
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        synced INTEGER DEFAULT 1
      );
    `);

    // Tabla de Pedidos / Compras realizadas (Incluyendo la columna 'image')
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        total TEXT NOT NULL,
        items TEXT NOT NULL,
        image TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    // Por seguridad: si la tabla ya existía en tu teléfono de antes sin la columna image, 
    // intentamos agregarla dinámicamente para que no falle.
    try {
      await db.execAsync(`ALTER TABLE orders ADD COLUMN image TEXT;`);
    } catch (e) {
      // Si la columna ya existe, SQLite lanzará un error que ignoramos de forma segura aquí
    }

    console.log("Base de datos SQLite inicializada correctamente.");
  } catch (error) {
    console.error("Error al inicializar la base de datos SQLite:", error);
  }
};