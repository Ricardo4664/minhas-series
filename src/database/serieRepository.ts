import { getDatabase } from './database';
import type {
  CreateSerieInput,
  Serie,
  SerieFilter,
  UpdateSerieInput,
} from '../types/serie';

export async function getSeries(filtro: SerieFilter): Promise<Serie[]> {
  const db = await getDatabase();

  // O filtro é resolvido no SQL (WHERE), não com .filter() no JavaScript.
  if (filtro === 'todas') {
    return db.getAllAsync<Serie>(
      'SELECT * FROM series ORDER BY createdAt DESC, id DESC'
    );
  }

  const concluida = filtro === 'concluidas' ? 1 : 0;
  return db.getAllAsync<Serie>(
    'SELECT * FROM series WHERE concluida = ? ORDER BY createdAt DESC, id DESC',
    [concluida]
  );
}

export async function getSerieById(id: number): Promise<Serie | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Serie>('SELECT * FROM series WHERE id = ?', [id]);
}

export async function createSerie(input: CreateSerieInput): Promise<Serie> {
  const db = await getDatabase();
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO series (titulo, plataforma, temporadas, nota, concluida, createdAt)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [input.titulo, input.plataforma, input.temporadas, input.nota, createdAt]
  );

  return {
    id: result.lastInsertRowId,
    ...input,
    concluida: 0,
    createdAt,
  };
}

export async function updateSerie(id: number, input: UpdateSerieInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE series
        SET titulo = ?, plataforma = ?, temporadas = ?, nota = ?
      WHERE id = ?`,
    [input.titulo, input.plataforma, input.temporadas, input.nota, id]
  );
}

export async function toggleSerieConcluida(id: number): Promise<void> {
  const db = await getDatabase();
  // 1 - 0 = 1 e 1 - 1 = 0: inverte o valor direto no banco.
  await db.runAsync('UPDATE series SET concluida = 1 - concluida WHERE id = ?', [id]);
}

export async function deleteSerie(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM series WHERE id = ?', [id]);
}
