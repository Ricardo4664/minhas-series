// Entidade completa, exatamente como está na tabela `series`.
export interface Serie {
  id: number;
  titulo: string;
  plataforma: string;
  temporadas: number;
  nota: number | null; // 1 a 5, ou null quando a série ainda não tem nota
  concluida: number; // 0 = assistindo, 1 = concluída (SQLite não tem booleano)
  createdAt: string; // ISO 8601
}

// O que o usuário informa ao cadastrar. `id` e `createdAt` são gerados,
// e toda série nova começa como "assistindo" (concluida = 0).
export type CreateSerieInput = Omit<Serie, 'id' | 'createdAt' | 'concluida'>;

// Campos editáveis no formulário (os mesmos do cadastro).
export type UpdateSerieInput = CreateSerieInput;

export type SerieFilter = 'todas' | 'assistindo' | 'concluidas';
