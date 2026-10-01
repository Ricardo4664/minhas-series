import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { getSeries } from '../src/database/serieRepository';
import type { Serie, SerieFilter } from '../src/types/serie';

const FILTROS: { valor: SerieFilter; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'assistindo', label: 'Assistindo' },
  { valor: 'concluidas', label: 'Concluídas' },
];

export default function ListaScreen() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [filtro, setFiltro] = useState<SerieFilter>('todas');

  // useFocusEffect roda toda vez que a tela ganha foco (inclusive ao voltar
  // do form/detalhe). O useCallback evita recriar o efeito a cada render:
  // ele só muda quando o filtro muda.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      getSeries(filtro).then((dados) => {
        if (ativo) setSeries(dados);
      });
      return () => {
        ativo = false;
      };
    }, [filtro])
  );

  return (
    <View className="flex-1 bg-slate-900 px-4 pt-4">
      <View className="mb-4 flex-row gap-2">
        {FILTROS.map((f) => {
          const ativo = f.valor === filtro;
          return (
            <Pressable
              key={f.valor}
              onPress={() => setFiltro(f.valor)}
              className={`flex-1 items-center rounded-full border py-2 ${
                ativo ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
              }`}
            >
              <Text className={ativo ? 'font-bold text-slate-900' : 'text-slate-300'}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={series}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-3 pb-24"
        ListEmptyComponent={
          <Text className="mt-10 text-center text-slate-400">
            Nenhuma série por aqui ainda.
          </Text>
        }
        renderItem={({ item }) => <SerieCard serie={item} />}
      />

      <Pressable
        onPress={() => router.push('/form')}
        className="absolute bottom-6 left-4 right-4 items-center rounded-xl bg-emerald-500 py-4 active:bg-emerald-600"
      >
        <Text className="text-base font-bold text-slate-900">+ Nova série</Text>
      </Pressable>
    </View>
  );
}

function SerieCard({ serie }: { serie: Serie }) {
  const concluida = serie.concluida === 1;

  return (
    <Pressable
      onPress={() => router.push(`/detalhe?id=${serie.id}`)}
      className={`rounded-xl border p-4 ${
        concluida ? 'border-emerald-700 bg-emerald-950 opacity-80' : 'border-slate-700 bg-slate-800'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`flex-1 text-lg font-bold ${
            concluida ? 'text-emerald-300 line-through' : 'text-slate-50'
          }`}
        >
          {serie.titulo}
        </Text>
        {concluida && (
          <Text className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-slate-900">
            Concluída
          </Text>
        )}
      </View>
      <Text className="mt-1 text-slate-400">
        {serie.plataforma} · {serie.temporadas}{' '}
        {serie.temporadas === 1 ? 'temporada' : 'temporadas'}
      </Text>
      <Text className="mt-1 text-amber-400">
        {serie.nota !== null ? '★'.repeat(serie.nota) + '☆'.repeat(5 - serie.nota) : 'Sem nota'}
      </Text>
    </Pressable>
  );
}
