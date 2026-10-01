import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { createSerie, getSerieById, updateSerie } from '../src/database/serieRepository';

export default function FormScreen() {
  // Parâmetros de rota sempre chegam como string: /form?id=3 → id = "3".
  const { id } = useLocalSearchParams<{ id?: string }>();
  const serieId = id ? Number(id) : null;
  const editando = serieId !== null;

  const [titulo, setTitulo] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [temporadas, setTemporadas] = useState('');
  const [nota, setNota] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Modo edição: carrega a série e preenche os campos.
  useEffect(() => {
    if (serieId === null) return;
    getSerieById(serieId).then((serie) => {
      if (!serie) return;
      setTitulo(serie.titulo);
      setPlataforma(serie.plataforma);
      setTemporadas(String(serie.temporadas));
      setNota(serie.nota);
    });
  }, [serieId]);

  function escolherNota(valor: number) {
    // Tocar na nota já selecionada remove a nota.
    setNota((atual) => (atual === valor ? null : valor));
  }

  async function salvar() {
    const tituloLimpo = titulo.trim();
    const plataformaLimpa = plataforma.trim();
    const temporadasLimpo = temporadas.trim();

    if (!tituloLimpo || !plataformaLimpa) {
      setErro('Preencha o título e a plataforma.');
      return;
    }
    // O TextInput entrega string: só aceitamos dígitos (inteiro ≥ 0).
    if (!/^\d+$/.test(temporadasLimpo)) {
      setErro('Temporadas precisa ser um número inteiro maior ou igual a 0.');
      return;
    }

    const dados = {
      titulo: tituloLimpo,
      plataforma: plataformaLimpa,
      temporadas: Number(temporadasLimpo),
      nota,
    };

    if (serieId !== null) {
      await updateSerie(serieId, dados);
    } else {
      await createSerie(dados);
    }
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerClassName="gap-4 p-4">
      <Stack.Screen options={{ title: editando ? 'Editar série' : 'Nova série' }} />

      <Campo label="Título">
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex.: Breaking Bad"
          placeholderTextColor="#64748b"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-3 text-slate-50"
        />
      </Campo>

      <Campo label="Plataforma">
        <TextInput
          value={plataforma}
          onChangeText={setPlataforma}
          placeholder="Ex.: Netflix, Max, Prime Video"
          placeholderTextColor="#64748b"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-3 text-slate-50"
        />
      </Campo>

      <Campo label="Temporadas assistidas">
        <TextInput
          value={temporadas}
          onChangeText={setTemporadas}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#64748b"
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-3 text-slate-50"
        />
      </Campo>

      <Campo label={nota !== null ? `Nota: ${nota}/5` : 'Nota: sem nota'}>
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((valor) => {
            const marcada = nota !== null && valor <= nota;
            return (
              <Pressable
                key={valor}
                onPress={() => escolherNota(valor)}
                className="h-12 w-12 items-center justify-center rounded-lg border border-slate-600 bg-slate-800"
              >
                <Text className={`text-2xl ${marcada ? 'text-amber-400' : 'text-slate-600'}`}>★</Text>
              </Pressable>
            );
          })}
        </View>
      </Campo>

      {erro && <Text className="text-red-400">{erro}</Text>}

      <Pressable
        onPress={salvar}
        className="mt-2 items-center rounded-xl bg-emerald-500 py-4 active:bg-emerald-600"
      >
        <Text className="text-base font-bold text-slate-900">
          {editando ? 'Salvar alterações' : 'Cadastrar série'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-slate-300">{label}</Text>
      {children}
    </View>
  );
}
