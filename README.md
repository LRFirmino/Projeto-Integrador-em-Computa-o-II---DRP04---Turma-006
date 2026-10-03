# 💰 Controle de Gastos Familiar

> Aplicativo mobile para **controle financeiro familiar e de pequenas despesas do dia a dia**.
> Simples, rápido e **100% offline** — pensado para registrar um gasto em poucos toques, na fila
> do caixa, sem depender de internet ou de conectar conta bancária.

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-expo--sqlite-003B57?logo=sqlite" />
</p>

---

## 1. Descrição Geral

O **Controle de Gastos Familiar** foi desenvolvido como solução para o **Projeto Integrador em
Computação II (DRP04) da UNIVESP**. O problema central identificado junto à comunidade externa é a
dificuldade das famílias em registrar e acompanhar **pequenas despesas do cotidiano** (padaria,
lanche, transporte, assinaturas). Individualmente esses valores parecem pequenos, mas somados
comprometem o orçamento do mês.

A proposta é um aplicativo **mobile (Android e iOS)** com foco em:

- ⚡ **Lançamento ultrarrápido** — valor + categoria em 2 a 3 toques.
- 🧭 **Visão clara do dinheiro** — saldo atual, entradas x saídas e resumo do mês.
- 🚦 **Alertas de limite por categoria** — barras que ficam verdes ou vermelhas.
- 📊 **Relatórios e gráficos descomplicados** — para onde o dinheiro está indo.
- 📶 **Offline-first** — todos os dados ficam no aparelho (SQLite), sem servidores externos.

### Tecnologias utilizadas

| Camada              | Tecnologia                                        |
| ------------------- | ------------------------------------------------- |
| Framework cross-platform | **React Native + Expo** (TypeScript)         |
| Navegação           | **Expo Router** (file-based routing)              |
| Armazenamento local | **expo-sqlite** (SQLite offline-first)            |
| Gráficos            | **react-native-svg** (rosca e barras)             |
| Ícones              | **@expo/vector-icons** (Ionicons)                 |
| Tema                | Design tokens próprios com **Light/Dark Mode**    |

### Funcionalidades implementadas

- **Dashboard** com card de saldo, resumo de entradas/saídas e lançamentos agrupados
  (*Hoje*, *Ontem*, datas).
- **FAB (+)** sempre visível no menu inferior para o lançamento rápido.
- **Formulário de lançamento** com teclado numérico, tipo (Despesa/Receita), categorias visuais
  com ícones e cores, descrição opcional e data (padrão: hoje).
- **Categorias e limites** com barras de progresso e alertas de "atenção"/"excedido".
- **Relatórios** com gráfico de rosca (gastos por categoria), gráfico de barras
  (evolução dos últimos 6 meses) e maiores gastos.
- **Histórico** com busca, filtro por tipo e navegação por mês.
- **Ajustes** com tema (Sistema/Claro/Escuro) e informações do app.
- **Edição e exclusão** de lançamentos e categorias.

---

## 2. Pré-requisitos

Antes de começar, instale em sua máquina:

- **[Node.js](https://nodejs.org/) 20 ou superior** (recomendado LTS) — inclui o `npm`.
  - Verifique com: `node -v` e `npm -v`.
- **Git** (para clonar o repositório) — *opcional* se você receber o projeto em `.zip`.
- **Aplicativo Expo Go** no celular (Android/iOS) — para rodar sem compilar nativamente.
- **Emulador Android** (Android Studio) **ou** **Simulator iOS** (Xcode, somente macOS) — *opcional*
  para quem quiser rodar no computador.

> 💡 Você **não precisa** de Android Studio nem Xcode se for testar pelo **Expo Go** em um celular
> físico na mesma rede Wi‑Fi.

---

## 3. Passo a Passo para Instalação e Execução

### 3.1 Obter o projeto

**Via Git (clone):**

```bash
git clone <URL-DO-REPOSITORIO>
cd projeto_univesp_controle_de_gastos
```

**Ou, se recebeu um arquivo `.zip`:** extraia a pasta e abra o terminal dentro dela.

### 3.2 Instalar as dependências

```bash
npm install
```

### 3.3 Iniciar o servidor de desenvolvimento

```bash
npm start
# ou, equivalentemente:
npx expo start
```

Um QR Code aparecerá no terminal. A partir dele você pode abrir o app (veja a seção 4).

### 3.4 Comandos úteis

| Comando              | O que faz                                            |
| -------------------- | ---------------------------------------------------- |
| `npm start`          | Inicia o servidor de desenvolvimento (Expo).         |
| `npm run android`    | Abre direto no emulador/dispositivo Android.         |
| `npm run ios`        | Abre direto no Simulator iOS (somente macOS).        |
| `npm run web`        | Abre a versão web (útil para conferir o layout).     |
| `npm run typecheck`  | Verifica erros de TypeScript (`tsc --noEmit`).       |

> 🌐 **Web:** o app também roda no navegador (`npm run web`). O `expo-sqlite` na web usa
> WebAssembly + Web Worker, então o arquivo `metro.config.js` já adiciona `wasm` às extensões de
> asset e envia os cabeçalhos `Cross-Origin-Embedder-Policy`/`Cross-Origin-Opener-Policy`
> necessários para o `SharedArrayBuffer`. Ao publicar a versão web, configure esses mesmos
> cabeçalhos no servidor de hospedagem (isso já está preparado no `app.json` para o EAS Hosting).

---

## 4. Como Executar nos Dispositivos

### 🤖 Android

**Opção A — Celular físico com Expo Go (mais simples):**

1. Instale o **Expo Go** pela Play Store.
2. Rode `npm start` no computador.
3. Abra o **Expo Go** e escaneie o QR Code exibido no terminal.
4. O celular e o computador precisam estar na **mesma rede Wi‑Fi**.
   - Se não conectar, rode `npx expo start --tunnel`.

**Opção B — Emulador Android:**

1. Abra um emulador pelo **Android Studio** (Device Manager).
2. Rode `npm run android` (ou pressione `a` no terminal do `expo start`).
3. O Expo instalará o **Expo Go** automaticamente no emulador.

**Opção C — Gerar APK / build de produção:**

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

> É necessária uma conta gratuita no [expo.dev](https://expo.dev) e um arquivo `eas.json` de
> configuração.

### 🍎 iOS

**Opção A — Celular físico com Expo Go:**

1. Instale o **Expo Go** pela App Store.
2. Rode `npm start` e escaneie o QR Code com a **câmera** do iPhone.

**Opção B — Simulator (requer macOS + Xcode):**

1. Instale o **Xcode** e os simuladores pelo App Store.
2. Rode `npm run ios` (ou pressione `i` no terminal do `expo start`).

> ⚠️ Gerar um build nativo iOS exige macOS. No Windows, use o **Expo Go** no iPhone ou o serviço
> **EAS Build** na nuvem.

---

## 5. Estrutura de Pastas

```
projeto_univesp_controle_de_gastos/
├── assets/                     # Ícones, splash e imagens do app
├── src/
│   ├── app/                    # Rotas do Expo Router (cada arquivo = uma tela)
│   │   ├── _layout.tsx         # Layout raiz: providers (tema, finanças) e Stack
│   │   ├── (tabs)/             # Navegação inferior em abas
│   │   │   ├── _layout.tsx     # Configuração das abas + FAB (+)
│   │   │   ├── index.tsx       # Dashboard / tela principal
│   │   │   ├── history.tsx     # Histórico com busca e filtros
│   │   │   ├── reports.tsx     # Relatórios e gráficos
│   │   │   ├── categories.tsx  # Categorias e alertas de limite
│   │   │   └── settings.tsx    # Ajustes (tema, sobre)
│   │   ├── transaction.tsx     # Modal de lançamento (criar/editar)
│   │   └── category.tsx        # Modal de categoria (criar/editar)
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Design system (AppText, Card, Button, etc.)
│   │   ├── BalanceCard.tsx     # Card destacado de saldo
│   │   ├── DonutChart.tsx      # Gráfico de rosca (SVG)
│   │   ├── BarChart.tsx        # Gráfico de barras (SVG)
│   │   ├── TransactionItem.tsx # Item da lista de lançamentos
│   │   ├── DateField.tsx       # Campo de data
│   │   ├── MonthSelector.tsx   # Navegação entre meses
│   │   └── FloatingAddButton.tsx # FAB (+)
│   ├── context/
│   │   ├── FinanceContext.tsx  # Estado global de finanças + CRUD
│   │   └── ThemeContext.tsx    # Tema Light/Dark persistido
│   ├── db/
│   │   ├── schema.ts           # Script SQL de criação das tabelas + seed
│   │   └── index.ts            # Repositório (consultas e operações SQLite)
│   ├── theme/
│   │   └── index.ts            # Cores, espaçamentos e raios (design tokens)
│   ├── types/
│   │   └── models.ts           # Tipagens (Transaction, Category, etc.)
│   └── utils/
│       └── format.ts           # Formatação de moeda, datas e agrupamentos
├── app.json                    # Configuração do Expo (nome, ícones, splash)
├── metro.config.js             # Config do Metro (suporte a WASM + headers web)
├── patches/                    # Correções aplicadas a dependências (patch-package)
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração do TypeScript (alias @/*)
└── README.md                   # Este arquivo
```

---

## 6. Modelo do Banco de Dados Local (SQLite)

O banco é criado automaticamente na primeira execução (`src/db/schema.ts`). As tabelas são:

```sql
-- Categorias de lançamento
CREATE TABLE categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  icon          TEXT    NOT NULL DEFAULT 'pricetag-outline',
  color         TEXT    NOT NULL DEFAULT '#10B981',
  monthly_limit REAL                -- limite mensal (NULL = sem limite)
);

-- Lançamentos financeiros
CREATE TABLE transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  category_id INTEGER,
  date        TEXT    NOT NULL,     -- YYYY-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- Preferências locais (ex.: tema escolhido)
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

Na primeira execução, são inseridas categorias padrão com ícones, cores e limites sugeridos:
*Alimentação, Transporte, Lanches, Assinaturas, Moradia, Saúde, Lazer e Outros*.

---

## 7. Design System & Acessibilidade

- **Estilo:** Modern Minimalist & Clean.
- **Cores:**
  - 🟢 **Verde esmeralda** para entradas/receitas e indicadores saudáveis.
  - 🔴 **Vermelho coral** para saídas/despesas e limites atingidos.
  - Fundos neutros com **Light/Dark Mode** adaptável.
- **Ergonomia:** botões grandes (mínimo de ~52px de altura), bom espaçamento para evitar toques
  acidentais e tipografia legível com alto contraste.
- **Fluxo rápido:** o formulário abre com o teclado numérico (`autoFocus`) e já vem com uma
  categoria selecionada — basta digitar o valor e salvar.

---

## 8. Solução de Problemas (Troubleshooting)

| Problema | Solução |
| -------- | ------- |
| O Expo Go não conecta ao QR Code | Verifique se estão na mesma rede Wi‑Fi e rode `npx expo start --tunnel`. |
| Erros estranhos após instalar dependências | Limpe o cache: `npx expo start -c`. |
| `Unable to resolve module` | Apague `node_modules` e rode `npm install` novamente. |
| Erros de versão de pacotes Expo | Rode `npx expo install --fix`. |
| Erros de TypeScript | Rode `npm run typecheck` para listar os pontos. |
| Web: `Worker chunk not found` / `SharedArrayBuffer is not defined` | Confirme que o `metro.config.js` está presente (adiciona `wasm` em `assetExts`) e que o servidor envia os cabeçalhos `Cross-Origin-Embedder-Policy: credentialless` e `Cross-Origin-Opener-Policy: same-origin`. |

> 🩹 **Correção aplicada a dependência (patch):** o pacote `@expo/metro-config@57.0.12` tem um bug
> conhecido ([expo/expo#50153](https://github.com/expo/expo/issues/50153)) em que `expo start --web`
> retorna erro HTTP 500 ao servir uma rota que usa Web Worker (caso do `expo-sqlite`) com
> `web.output` em `static`/`server`. A correção oficial
> ([PR #50244](https://github.com/expo/expo/pull/50244)) ainda não tinha sido publicada em uma versão
> 57.x, então ela é aplicada via **`patch-package`** (arquivo em `patches/`). O script `postinstall`
> garante que o patch seja reaplicado automaticamente após cada `npm install`. Quando o Expo publicar
> uma versão corrigida, basta atualizar o pacote e remover o patch.

---

## 9. Equipe e Créditos

**Projeto Integrador em Computação II — DRP04 — Turma 006 (UNIVESP)**

- Luiz Henrique de Toledo — RA 24214219
- Luiz Eduardo Rodrigues Firmino — RA 24221183

Orientador do PI: **Kelvin dos Santos Alves**

---

<p align="center">Feito com 💚 para ajudar as famílias a cuidarem melhor do seu dinheiro.</p>
