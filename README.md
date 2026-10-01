# Minhas Séries

App mobile feito com **Expo + TypeScript** para registrar as séries que você assistiu ou está assistindo. Os dados ficam salvos em **SQLite** no próprio aparelho e continuam lá depois de fechar o app.

- Lista com filtro **todas / assistindo / concluídas** (filtro feito no SQL)
- Cadastro e edição na mesma tela, com nota de 1 a 5 estrelas (ou sem nota)
- Tela de detalhe para marcar como concluída, editar ou excluir

**Tecnologias:** Expo SDK 57 · Expo Router · expo-sqlite · NativeWind 4 · TypeScript

## Estrutura

```
app/
  _layout.tsx        Stack com as rotas index, form e detalhe
  index.tsx          Lista + filtros
  form.tsx           Cadastro (/form) e edição (/form?id=3)
  detalhe.tsx        Detalhe (/detalhe?id=3)
src/
  types/serie.ts             Serie, CreateSerieInput, UpdateSerieInput, SerieFilter
  database/database.ts       Conexão singleton + migrations
  database/serieRepository.ts  As 6 funções de acesso ao banco
```

## Como rodar

```bash
npm install --legacy-peer-deps
npx expo start
```

Escaneie o QR code com o **Expo Go**.

> O `--legacy-peer-deps` é necessário por causa das dependências do NativeWind 4 (veja o Registro 2 do diário).

## Teste de persistência (Etapa 8)

1. Cadastrei 3 séries, marquei uma como concluída e editei outra.
2. Fechei o app completamente e abri de novo.
3. Todos os dados continuaram lá e os filtros funcionaram.

| Lista antes de fechar | Lista depois de reabrir | Filtro "Concluídas" |
| :---: | :---: | :---: |
| <img src="docs/1-antes.png" width="220" /> | <img src="docs/2-depois.png" width="220" /> | <img src="docs/3-filtro.png" width="220" /> |

## Diário do copiloto

### Registro 1 — Etapa 1
**O que o piloto pediu:** criar o projeto e configurar Expo Router e NativeWind.
**O que o copiloto sugeriu (resumo):** criou os 5 arquivos do NativeWind e o `import '../global.css'` no `_layout.tsx`. Ao rodar `npx tsc --noEmit` apareceu o erro `TS2882: Cannot find module or type declarations for side-effect import of '../global.css'`. O copiloto explicou que o TypeScript 6 passou a verificar imports de efeito colateral, e o projeto não tinha nenhum tipo para arquivos `.css`.
**O que o piloto fez:** aceitou a correção: adicionar `declare module '*.css';` no `nativewind-env.d.ts`. Com isso o `tsc` passou sem erros.

### Registro 2 — Etapa 1 (sugestão corrigida)
**O que o piloto pediu:** entender por que o Metro não compilava (`Cannot find module 'babel-preset-expo'`).
**O que o copiloto sugeriu (resumo):** instalar o pacote com `npx expo install babel-preset-expo -- --save-dev`. O comando falhou com `npm error code ERESOLVE`, um conflito de peer dependencies causado pelo NativeWind. O pacote foi parar no `package.json`, mas não foi instalado.
**O que o piloto fez:** corrigiu. A sugestão ignorava o motivo de o próprio enunciado usar `--legacy-peer-deps` na instalação do NativeWind. Rodou `npm install --legacy-peer-deps` e o bundle passou a compilar. Por isso o README manda instalar com essa flag.

### Registro 3 — Etapa 1 (sugestão rejeitada)
**O que o piloto pediu:** a estrutura de pastas do projeto.
**O que o copiloto sugeriu (resumo):** o `AGENTS.md` que veio no template do `create-expo-app` diz que as rotas ficam em `src/app/`.
**O que o piloto fez:** rejeitou. A estrutura vista em aula e cobrada na rubrica é `app/` na raiz, com `src/types` e `src/database` separados. Manteve `app/` na raiz.

### Registro 4 — Etapa 3
**O que o piloto pediu:** como fazer o singleton da conexão com o banco.
**O que o copiloto sugeriu (resumo):** guardar a **Promise** da conexão (`dbPromise`) em vez do objeto do banco já aberto. Se duas telas chamarem `getDatabase()` ao mesmo tempo, antes de a primeira abertura terminar, as duas recebem a mesma Promise e o banco abre uma única vez. As migrations rodam junto da primeira abertura.
**O que o piloto fez:** aceitou, porque evita abrir o banco duas vezes (o que tiraria ponto na rubrica).

### Registro 5 — Etapa 5 (Parte 3: `useFocusEffect`)
**O que o piloto pediu:** por que a série nova não aparece ao voltar para a lista e como o `useFocusEffect` resolve isso.
**O que o copiloto sugeriu (resumo):** no Stack, a lista não é desmontada quando abrimos o form. Ela fica embaixo na pilha, então um `useEffect(..., [])` não roda de novo. O `useFocusEffect` executa a função toda vez que a tela **ganha foco**. Ele pede `useCallback` porque, sem ele, cada render criaria uma função nova e o efeito rodaria de novo a cada render. Com `useCallback(..., [filtro])`, ele só é recriado quando o filtro muda. A função de limpeza (`ativo = false`) evita atualizar o estado depois que a tela perde o foco.
**O que o piloto fez:** aceitou e usou na lista e no detalhe (o detalhe precisa recarregar depois da edição).

### Registro 6 — Etapa 4
**O que o piloto pediu:** como alternar `concluida` entre 0 e 1.
**O que o copiloto sugeriu (resumo):** `UPDATE series SET concluida = 1 - concluida WHERE id = ?`, que inverte o valor direto no banco sem precisar fazer um `SELECT` antes.
**O que o piloto fez:** aceitou. Continua usando `?` para o `id` e mantém `concluida` como `INTEGER`, sem `boolean`.

### Registro 7 — Etapa 6
**O que o piloto pediu:** como validar o campo temporadas.
**O que o copiloto sugeriu (resumo):** o `TextInput` sempre entrega `string`. Antes de converter com `Number()`, a validação usa a regex `/^\d+$/`, que aceita só inteiros ≥ 0 e bloqueia valores vazios, `"2.5"`, `"-1"` e textos que virariam `NaN`.
**O que o piloto fez:** aceitou.
