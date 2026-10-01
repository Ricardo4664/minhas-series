import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import {
  deleteSerie,
  getSerieById,
  toggleSerieConcluida,
} from '../src/database/serieRepository';
import type { Serie } from '../src/types/serie';

export default function DetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serieId = Number(id);

  // undefined = carregando, null = não encontrada
  const [serie, setSerie] = useState<Serie | null | undefined>(undefined);

  const carregar = useCallback(async () => {
    setSerie(await getSerieById(serieId));
  }, [serieId]);

  // Recarrega ao voltar do formulário de edição.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (serie === undefined) {
    return <View className="flex-1 bg-slate-900" />;
  }

  if (serie === null) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-400">Série não encontrada.</Text>
      </View>
    );
  }

  const concluida = serie.concluida === 1;

  async function alternarConcluida() {
    await toggleSerieConcluida(serieId);
    await carregar();
  }

  function confirmarExclusao(titulo: string) {
    Alert.alert('Excluir série', `Tem certeza que deseja excluir "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteSerie(serieId);
          router.back();
        },
      },
    ]);
  }

  return (
    <View className="flex-1 gap-4 bg-slate-900 p-4">
      <View className="gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <Text className="text-2xl font-bold text-slate-50">{serie.titulo}</Text>
        <Text
          className={`self-start rounded-full px-3 py-1 text-xs font-bold text-slate-900 ${
            concluida ? 'bg-emerald-500' : 'bg-sky-500'
          }`}
        >
          {concluida ? 'Concluída' : 'Assistindo'}
        </Text>
        <Info label="Plataforma" valor={serie.plataforma} />
        <Info label="Temporadas assistidas" valor={String(serie.temporadas)} />
        <Info
          label="Nota"
          valor={serie.nota !== null ? '★'.repeat(serie.nota) + '☆'.repeat(5 - serie.nota) : 'Sem nota'}
        />
        <Info label="Cadastrada em" valor={new Date(serie.createdAt).toLocaleDateString('pt-BR')} />
      </View>

      <Pressable
        onPress={alternarConcluida}
        className="items-center rounded-xl bg-emerald-500 py-4 active:bg-emerald-600"
      >
        <Text className="font-bold text-slate-900">
          {concluida ? 'Voltar para assistindo' : 'Marcar como concluída'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push(`/form?id=${serie.id}`)}
        className="items-center rounded-xl border border-slate-500 py-4 active:bg-slate-800"
      >
        <Text className="font-bold text-slate-100">Editar</Text>
      </Pressable>

      <Pressable
        onPress={() => confirmarExclusao(serie.titulo)}
        className="items-center rounded-xl border border-red-500 py-4 active:bg-red-950"
      >
        <Text className="font-bold text-red-400">Excluir</Text>
      </Pressable>
    </View>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <View>
      <Text className="text-xs uppercase text-slate-500">{label}</Text>
      <Text className="text-base text-slate-100">{valor}</Text>
    </View>
  );
}
