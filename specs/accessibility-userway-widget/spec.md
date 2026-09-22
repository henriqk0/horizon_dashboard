# Especificação Técnica: Substituição do Painel de Acessibilidade pelo Widget UserWay

> **Recurso**: Substituição do Painel de Acessibilidade pelo Widget UserWay (Accessibility → UserWay Widget)
> **Fase SpecKit**: `/speckit.specify`
> **Constituição**: [.agent/constitution.md](../../.agent/constitution.md)
> **Requisito de origem**: RF-27 (`docs/2 - implementacao/SI1-2 - identification/SI1-Requisitos.md`) e US-021 (`docs/2 - implementacao/SI3 - initiation/SI.3-product_backlog_initiation.md`)

---

## 1. Objetivo e Visão Geral

Substituir o painel de acessibilidade customizado — hoje implementado pelo componente
`src/components/AccessibilityToggle.astro` e sua lógica distribuída entre `Layout.astro`,
`global.css` e o `ThemeToggle` — pelo **widget de acessibilidade UserWay** (terceirizado, SaaS).

O widget passa a oferecer as ferramentas de personalização (contraste, tamanho de fonte,
espaçamento, "pause animations", cursor ampliado, leitor de tela, modo dislexia, etc.) com
manutenção contínua do fornecedor e conformidade WCAG 2.2. O controle de **tema claro/escuro** do
site permanece sob responsabilidade do `ThemeToggle` (já existente), por não ser uma capacidade
oferecida pelo widget.

Remoções-alvo (deixam de existir): o botão/painel `AccessibilityToggle`, as chaves de
`localStorage` órfãs, as classes CSS de acessibilidade customizadas (`contrast-high`,
`contrast-maximum`, `text-scale-*`, `reduce-motion`, `enhanced-focus`,
`screen-reader-optimized`) e as migrações legadas associadas.

---

## 2. Contexto e Justificativa (O PORQUÊ)

### 2.1 Estado atual

O painel (RF-27/US-021) é renderizado **duas vezes por página** (header mobile e header desktop,
`Layout.astro:363` e `Layout.astro:708`), o que produz IDs duplicados no DOM (`#theme-light`,
`#contrast-normal`, `#option-reduce-motion`, ...) — HTML inválido e referências `for`/`aria-*`
ambíguas para leitores de tela.

A lógica de persistência está **duplicada e divergente** em três lugares:

| Local | Default de `theme-preference` |
|---|---|
| `src/layouts/Layout.astro:192` (script inline do `<head>`) | `"light"` |
| `src/components/AccessibilityToggle.astro:491` (`updateUI`) | `"auto"` |
| `tests/accessibility.test.ts:16` | `"auto"` |

Num primeiro acesso, o painel destaca "Auto" como ativo enquanto o tema aplicado é o claro — o
estado marcado não corresponde ao estado real.

Outros problemas identificados em auditoria:

- `localStorage.setItem("theme", theme)` em `AccessibilityToggle.astro:546` é código morto (nada
  lê a chave `"theme"`).
- A opção "Otimizar para leitor de tela" é um **no-op**: `global.css:208-212` só define
  `pointer-events: none` em `[aria-hidden="true"]`, que não altera nada para leitores de tela.
- `ThemeToggle` (clique rápido) escreve `theme-preference` sem re-executar o `updateUI()` do
  painel, deixando o destaque do painel dessincronizado.
- O dropdown do painel não gerencia foco (não move o foco ao abrir, não restaura ao fechar) e o
  gatilho não declara `aria-controls`/`id` ligando ao painel.
- O painel e o script do `<head>` duplicam `applySettings`/`applyThemeSettings` — manutenção
  dupla que já divergiu (ver tabela acima).

### 2.2 Por que UserWay

- Ferramentas de acessibilidade curadas e atualizadas pelo fornecedor (WCAG 2.2 AA/AAA, ART de
  remediação automática), em vez de uma implementação própria parcial.
- Elimina toda a superfície de bugs acima (IDs duplicados, defaults divergentes, no-ops, estado
  dessincronizado, lógica duplicada).
- Widget é "privacy-by-design" (sem PII/cookies), alinhado à LGPD.
- O painel customizado continua sendo mantido pelo time **apenas** para tema — que o widget não
  cobre.

### 2.3 Limite honesto do escopo

O widget **não corrige** os problemas estruturais de teclado/ARIA que a auditoria de acessibilidade
encontrou no restante do site. Permanecerão fora desta especificação (ver §6 Fora de Escopo):

- Menu mobile por "checkbox hack" não operável por teclado (`Layout.astro:388-398`).
- Tablists de gráficos sem navegação por teclado completa/global (`ProjectCharts`, `AdvisorshipCharts`).
- `ResearcherModal` sem semântica de diálogo e sem gerenciamento de foco.
- Grafos de interação com hover-only para tooltips e pan/zoom sem equivalente de teclado.

---

## 3. Atores

- **Usuário com baixa visão / daltonismo**: usa contraste, tamanho de fonte, cursor ampliado.
- **Usuário com sensibilidade a movimento**: usa "pause animations"/redução de movimento.
- **Usuário de leitor de tela**: usa as ferramentas do widget (screen reader, page structure, tooltips).
- **Mantenedor do portal**: deixa de manter a lógica do painel; configura o widget via dashboard.

---

## 4. User Stories e Critérios de Aceitação

### US-1 — Widget UserWay carregado em todas as páginas

> **Como** usuário com necessidades especiais,
> **quero** encontrar o botão flutuante do widget de acessibilidade em qualquer página do portal,
> **para** ajustar contraste, fonte, movimento e demais ferramentas sem depender da página atual.

**Critérios de aceitação**
- AC-1.1: O script do widget (CDN `cdn.userway.org/widget.js`) é injetado no `<head>` do
  `Layout.astro`, uma única vez por página, com `data-account` preenchido.
- AC-1.2: O `data-account` vem da constante `USERWAY_ACCOUNT_ID` (ID público, fixo no código)
  importada de `src/lib/accessibility-settings.ts`; o script é emitido em todas as builds enquanto
  a constante não estiver vazia.
- AC-1.3: O script usa `async` e `crossorigin="anonymous"`.
- AC-1.4: Nenhum traço do `AccessibilityToggle` (botão, dropdown, listeners) permanece no HTML final.
- AC-1.5: O widget aparece uma única vez (sem duplicação entre headers mobile/desktop).

### US-2 — Remoção limpa do painel customizado e chaves legadas

> **Como** mantenedor,
> **quero** remover o componente, as classes CSS e as chaves de `localStorage` do painel antigo,
> **para** eliminar código morto, no-ops e a divergência de estados documentada em §2.1.

**Critérios de aceitação**
- AC-2.1: `AccessibilityToggle.astro` é excluído e deixam de existir os dois pontos de importação
  em `Layout.astro`.
- AC-2.2: As chaves `contrast`, `text-scale`, `reduce-motion`, `enhanced-focus`,
  `screen-reader-optimized`, `high-contrast` e `theme` deixam de ser lidas; uma função
  `cleanupLegacyAccessibilityKeys` remove as remanescentes de usuários que já as tinham
  (migração única, idempotente, sem efeito colateral).
- AC-2.3: As classes CSS `contrast-high`, `contrast-maximum`, `text-scale-sm/base/lg/xl`,
  `reduce-motion`, `enhanced-focus` e `screen-reader-optimized` são removidas de `global.css` e de
  todos os consumidores (incluindo `KpiCard`, `HomeHero`, `ResearcherCharts` e o `isDark` dos grafos).
- AC-2.4: Nenhuma referência residual a essas chaves/classes em `src/` (verificado por grep) nem em
  `tests/`.

### US-3 — Tema do site continua funcional e consolidado

> **Como** usuário,
> **quero** continuar alternando tema claro/escuro,
> **para** manter minha escolha visual mesmo com o painel removido.

**Critérios de aceitação**
- AC-3.1: `theme-preference` continua sendo a única chave de tema; o script reduzido do `<head>`
  aplica a classe `dark` antes do primeiro paint (sem FOUC) e re-aplica em `astro:after-swap`.
- AC-3.2: O default consolidado passa a ser `"auto"` em **todos** os consumidores (eliminando a
  divergência `light` × `auto` de §2.1).
- AC-3.3: O `ThemeToggle` cicla `claro → escuro → auto` (D-1 decidido), reflete o estado real e
  sincroniza `theme-preference`.
- AC-3.4: Em `"auto"`, a mudança de `prefers-color-scheme` do sistema re-aplica o tema
  dinamicamente (listener de `matchMedia`).

### US-4 — Grafos e componentes de cor não dependem mais de classes de contraste

> **Como** mantenedor,
> **quero** que `isDark` dos componentes de visualização considere apenas o tema real,
> **para** não manter caminhos de cor mortos referentes a classes que não existem mais.

**Critérios de aceitação**
- AC-4.1: `ResearchGroupInteractionGraph.astro:1390-1392` decide `isDark` apenas por
  `document.documentElement.classList.contains("dark")`.
- AC-4.2: `ResearcherCharts.astro:373-374` perde os overrides `.contrast-high`/`.contrast-maximum`
  sem alterar a renderização visual nos temas claro/escuro.
- AC-4.3: `KpiCard` deixa de checar a classe `reduce-motion` e permanece respeitando somente
  `prefers-reduced-motion` do sistema; `HomeHero` perde os seletores `:root.reduce-motion`.
- AC-4.4: O bloco `@media (prefers-reduced-motion: reduce)` de `global.css` é mantido (é o piso
  nativo de acessibilidade, independente do widget).

### US-5 — Lógica extraível testada (TDD)

> **Como** desenvolvedor,
> **quero** que a lógica que sobra (resolução de tema e limpeza de chaves) viva em módulo puro,
> **para** ser testável por Vitest e não se esconder em `<script>` inline.

**Critérios de aceitação**
- AC-5.1: Novo módulo `src/lib/accessibility-settings.ts` exporta `resolveTheme(preference, systemPrefersDark)`
  e `cleanupLegacyAccessibilityKeys(storage)` como funções puras.
- AC-5.2: `tests/accessibility.test.ts` é reescrito: mantém os testes de tema válidos e passa a
  exercitar o módulo puro (resolução `light`/`dark`/`auto`, limpeza idempotente das chaves legadas,
  tolerância a `localStorage` indisponível).
- AC-5.3: O `<script is:inline>` do `<head>` permanece mínimo (tema apenas); a paridade com
  `resolveTheme` é garantida por teste e por comentário de sincronização (D-2).

---

## 5. Decisões (status)

| ID | Decisão | Status |
|---|---|---|
| D-1 | Modo "Auto" de tema no `ThemeToggle` | **DECIDIDO**: ciclo de 3 estados `claro → escuro → auto` (preserva o modo "Auto" que existia no painel) |
| D-2 | Duplicação mínima `resolveTheme` no `<head>` | Mantém espelho inline de ~3 linhas com teste de paridade (não há como importar módulo em script inline pré-paint); a alternativa que aceita FOUC fica descartada |
| D-3 | Conta UserWay | **DECIDIDO**: o ID é público e fica fixo no código — constante `USERWAY_ACCOUNT_ID` exportada de `src/lib/accessibility-settings.ts` com placeholder `"REPLACE_ME"` a trocar pela conta real; sem variável de ambiente, widget emitido em todas as builds |
| D-4 | Atualização dos docs de requisito | Executada na TASK-009: RF-27 / US-021 passam a descrever UserWay + `ThemeToggle` como solução |

---

## 6. Fora de Escopo

- Corrigir os problemas estruturais de acessibilidade do restante do site (menu mobile por
  checkbox, tablists de gráficos, `ResearcherModal`, tooltips/pan-zoom dos grafos) — ver §2.3.
- Configurar a conta/dashboard UserWay (domínio, posição, idioma do widget) — tarefa administrativa
  fora do código.
- Adicionar política de privacidade/CSP — apenas notas de implementação em `plan.md`.
- Alterar o ETL ou dados de origem.
- Manter qualquer suporte às chaves/classes legadas além da limpeza única de AC-2.2.

---

## 7. Impacto em Requisitos Existentes

- **RF-27** (painel de acessibilidade customizado) é atendido de forma substitutiva: tema pelo
  `ThemeToggle`, demais ferramentas pelo widget UserWay.
- **US-019/US-020/US-021** herdados: `high-contrast` e `grayscale` já migrados anteriormente para o
  painel; agora viram responsabilidade do widget.
- Nenhuma API/página/rota muda. A mudança é integralmente de camada de apresentação (Layout,
  componente, CSS, script inline e testes).