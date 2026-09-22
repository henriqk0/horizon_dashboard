# Plano de Tarefas: Substituição do Painel de Acessibilidade pelo Widget UserWay

> **Recurso**: Substituição do Painel de Acessibilidade pelo Widget UserWay
> **Fase SpecKit**: `/speckit.implement`
> **Especificação**: [spec.md](spec.md)
> **Plano Técnico**: [plan.md](plan.md)
> **Constituição**: [.agent/constitution.md](../../.agent/constitution.md)

---

## Legenda de Rótulos
* `[P]`: Tarefa Paralelizável (desenvolvida sem bloqueio).
* `TDD`: Tarefa de desenvolvimento guiado por testes (teste antes da implementação).
* `INSP`: Verificada por inspeção e build (lógica restrita a markup/script inline).

---

## 0. Decisões (ver spec.md §5)

- [x] **D-1**: ciclo de 3 estados `claro → escuro → auto` no `ThemeToggle` — **DECIDIDO**.
- [x] **D-3**: ID público fixo no código — constante `USERWAY_ACCOUNT_ID` (placeholder
  `"REPLACE_ME"`) em `src/lib/accessibility-settings.ts`; sem variável de ambiente, widget emitido
  em todas as builds — **DECIDIDO**.

---

## 1. Mapeamento de Tarefas por User Story

### US-5: Lógica extraível testada (TDD)

- [x] **TASK-001** `TDD`: **Escrever testes da lógica consolidada**
  * **Ação**: Criar `tests/accessibility-settings.test.ts` cobrindo `resolveTheme` (default `"auto"`,
    `light`/`dark` explícitos, `auto` + sistema claro/escuro), paridade do espelho do `<head>` com
    `resolveTheme`, e `cleanupLegacyAccessibilityKeys` (7 chaves, idempotência, tolerância a
    `localStorage` indisponível).
  * **Critérios**: AC-5.1, AC-5.2, AC-3.2.

- [x] **TASK-002** `TDD`: **Implementar `src/lib/accessibility-settings.ts`**
  * **Ação**: Módulo puro com `ThemePreference`, `resolveTheme`, `LEGACY_ACCESSIBILITY_KEYS`,
    `cleanupLegacyAccessibilityKeys` e a constante `USERWAY_ACCOUNT_ID` (placeholder `"REPLACE_ME"`,
    a trocar pela conta real antes do primeiro deploy).
  * **Critérios**: AC-5.1, AC-5.2, AC-1.2.

### US-1: Widget UserWay carregado em todas as páginas

- [x] **TASK-003** `INSP` `[P]`: **Injetar o script do widget no `<head>` do Layout**
  * **Ação**: No frontmatter do `Layout.astro`,
    `import { USERWAY_ACCOUNT_ID } from "../lib/accessibility-settings";` e snippet condicional
    `{USERWAY_ACCOUNT_ID && (<script is:inline id="a11yWidgetSrc" src="https://cdn.userway.org/widget.js"
    data-account={USERWAY_ACCOUNT_ID} async crossorigin="anonymous" />)}` antes do `</head>`
    (posição do botão é definida pela UI/dashboard do UserWay — **sem** `data-position`, que
    hard-codaria a posição e bloquearia ajustes pela UI).
  * **Critérios**: AC-1.1, AC-1.2, AC-1.3, AC-1.5.

### US-2: Remoção do painel customizado e chaves legadas

- [x] **TASK-004** `INSP`: **Reduzir `applyThemeSettings` do `<head>` a tema apenas**
  * **Ação**: Remover blocos de contraste (incl. migração `high-contrast`), `text-scale` e os três
    toggles; default do tema consolidado em `"auto"`; manter `astro:after-swap`; adicionar o listener
    de `prefers-color-scheme`; invocar `cleanupLegacyAccessibilityKeys` (espelho).
  * **Critérios**: AC-3.1, AC-3.2, AC-3.4, AC-2.2.

- [x] **TASK-005** `[P]`: **Remover o componente `AccessibilityToggle.astro` e seus usos**
  * **Ação**: Deletar o arquivo; remover import e as duas instâncias em `Layout.astro` (mobile e desktop).
  * **Critérios**: AC-1.4, AC-2.1.

- [x] **TASK-006** `[P]`: **Limpar CSS das classes de acessibilidade customizadas**
  * **Ação**: Remover de `global.css` `:root.text-scale-*`, `contrast-high`, `contrast-maximum`
    (incl. hack `.bg-border-main`), `reduce-motion`, `enhanced-focus`, `screen-reader-optimized` e a
    variável `--base-font-size`. Manter o bloco `@media (prefers-reduced-motion: reduce)`.
  * **Critérios**: AC-2.3, AC-4.4.

### US-3: Tema consolidado

- [x] **TASK-007**: **Ciclo de 3 estados no `ThemeToggle.astro`**
  * **Ação**: Ciclo `light → dark → auto`, label dinâmico por estado e escrita de
    `theme-preference` (aplicado no mesmo fluxo do `<head>`).
  * **Critérios**: AC-3.1, AC-3.3.

### US-4: Componentes de cor sem dependência das classes removidas

- [x] **TASK-008** `[P]` `INSP`: **Limpar consumidores das classes removidas**
  * **Ação**: `KpiCard.astro` (checar só `prefers-reduced-motion`), `HomeHero.astro` (remover
    seletores `:root.reduce-motion`), `ResearcherCharts.astro` (remover overrides
    `.contrast-high`/`.contrast-maximum`), grafos `isDark` (apenas `.dark`).
  * **Critérios**: AC-4.1, AC-4.2, AC-4.3.

### Documentação

- [x] **TASK-009** `D-4`: **Atualizar docs de requisito e backlog**
  * **Ação**: RF-27 em `docs/2 - implementacao/SI1-2 - identification/SI1-Requisitos.md` e
    US-021/US-019/US-020 em `docs/2 - implementacao/SI3 - initiation/SI.3-product_backlog_initiation.md`
    passam a descrever o widget UserWay + `ThemeToggle` como solução.

### Validação

- [x] **TASK-010**: **Suíte de testes completa** (`npx vitest run`) — baseline pré-existente de 13
  falhas não pode aumentar; zero regressões novas.
- [x] **TASK-011**: **Lint** (`npm run lint:eslint`).
- [x] **TASK-012**: **Build de produção** (`npm run build`).
- [x] **TASK-013**: **Verificação no `dist/`** — script do widget presente no `<head>` com
  `data-account` (sinalizar se ainda é `"REPLACE_ME"`); greps de remoção zerados (AC-1.4, AC-2.4);
  tema `dark` ainda aplicado.
- [x] **TASK-014**: **Preencher `walkthrough.md`** com prova de trabalho (saídas dos comandos +
  inspeções no HTML gerado).

---

## 2. Dependências

```
TASK-001 → TASK-002 → TASK-003, TASK-004
TASK-003 → TASK-005 (não deixar a página sem a11y: widget entra antes da remoção do painel)
TASK-004 → TASK-007 (onda única de tema)
TASK-005, TASK-006, TASK-008  (independentes entre si)
TASK-003..TASK-008 → TASK-009 → TASK-010 → TASK-011 → TASK-012 → TASK-013 → TASK-014
```

---

## 3. Pendências Monitoradas

- **Conta UserWay definida (D-3 resolvido)**: `USERWAY_ACCOUNT_ID = "Jmxwgqf2MY"`; `data-account`
  confirmado no `dist/` pós-rebuild (sem restos de `REPLACE_ME`).
- View Transitions ativadas no futuro podem remover o botão injetado pelo widget no `swap` —
  re-injetar via `astro:after-swap` quando/se ativadas (hoje o projeto não usa `<ViewTransitions />`).
- CSP futura deverá permitir os domínios `cdn.userway.org` / `*.userway.org` (ver plan.md §2.3).
- Widget bloqueado em rede sem acesso ao CDN: tema permanece local; ferramentas avançadas ficam
  indisponíveis (aceito no RF-27).