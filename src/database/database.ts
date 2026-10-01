import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'minhas-series.db';

// Singleton: guardamos a Promise da conexão para que o banco seja aberto
// uma única vez, mesmo que várias telas chamem getDatabase() ao mesmo tempo.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS series (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo      TEXT    NOT NULL,
      plataforma  TEXT    NOT NULL,
      temporadas  INTEGER NOT NULL,
      nota        INTEGER,
      concluida   INTEGER NOT NULL DEFAULT 0,
      createdAt   TEXT    NOT NULL
    );
  `);
}
