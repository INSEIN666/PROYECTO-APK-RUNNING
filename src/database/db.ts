import * as SQLite from 'expo-sqlite';

// Abrir o crear la base de datos local de manera segura
export const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('bapesta_offline.db');
  return db;
};

// Inicializar las tablas necesarias de forma secuencial y segura para Android
export const initDatabase = async () => {
  try {
    const db = await openDatabase();

    // Configurar modo WAL de forma independiente
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // Crear tabla de Usuarios
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        synced INTEGER DEFAULT 1
      );
    `);

    // Crear tabla de Pedidos
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

    // Intentar agregar la columna image de forma segura si no existe
    try {
      await db.execAsync(`ALTER TABLE orders ADD COLUMN image TEXT;`);
    } catch (e) {
      // La columna ya existe, se ignora de forma segura
    }

    console.log("Base de datos SQLite inicializada correctamente.");
  } catch (error) {
    console.error("Error al inicializar la base de datos SQLite:", error);
  }
};