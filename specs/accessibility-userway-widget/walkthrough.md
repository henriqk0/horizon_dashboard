# Walkthrough: Substituição do Painel de Acessibilidade pelo Widget UserWay

> **Recurso**: Substituição do Painel de Acessibilidade pelo Widget UserWay
> **Fase SpecKit**: `/speckit.implement` (**concluído**)
> **Constituição**: [.agent/constitution.md](../../.agent/constitution.md) §4 (Walkthrough com prova de trabalho)

---

## 1. Resumo

| ID | Área | Arquivos tocados | Prova |
|---|---|---|---|
| US-1 | Injeção do widget UserWay | `src/layouts/Layout.astro` | Script no `<head>` com `data-account="Jmxwgqf2MY"` (D-3 resolvido) — posição definida pela UI/dashboard do UserWay (meio-direita), presente em todas as páginas (§2.1) |
| US-2 | Remoção do painel e chaves legadas | `AccessibilityToggle.astro` (removido), `Layout.astro`, `global.css` | Zerado: markup do painel, classes CSS e chaves órfãs (§2.2, §2.4) |
| US-3 | Tema consolidado | `ThemeToggle.astro`, `Layout.astro`, `accessibility-settings.ts` | Ciclo 3 estados + default `"auto"` + paridade head ↔ módulo (§2.3, §2.5) |
| US-4 | Limpeza de consumidores | `KpiCard`, `HomeHero`, `ResearcherCharts`, `ResearchGroupInteractionGraph` | Grep zero nos consumidores (§2.4) |
| US-5 | Lógica pura testada | `accessibility-settings.ts` (novo), `tests/accessibility-settings.test.ts` | 17/17 testes passando (§2.5) |

## 2. Prova de Trabalho por User Story

### US-1 — Widget no `<head>`
- Grep no HTML gerado (`dist/index.html`):

```
$ grep -o 'id="a11yWidgetSrc"[^>]*src="https://cdn.userway.org/widget.js"[^>]*data-account="[^"]*"[^>]*async[^>]*' dist/index.html
id="a11yWidgetSrc" src="https://cdn.userway.org/widget.js" data-account="Jmxwgqf2MY" async crossorigin="anonymous"
```

- **Instância única por página**: `grep -c 'data-account=' dist/index.html` → `1`; presente também em
  páginas aninhadas (`dist/publications/1946/index.html`, etc.).
- **`data-account` com a conta real**: `data-account="Jmxwgqf2MY"` no `dist/` — placeholder
  `REPLACE_ME` substituído e **zero** ocorrências de `REPLACE_ME` no HTML gerado (D-3 resolvido).
- **Posição (decisão de produto pós-implementação)**: controlada pela **UI/dashboard do UserWay**
  (meio-direita, conforme ajustado no site), **sem** `data-position` no script — o atributo
  "hard-coda" a posição e bloqueia alterações pela UI (UserWay Advanced Script Attributes Guide /
  tutorial de embed).

### US-2 — Remoção
- `src/components/AccessibilityToggle.astro` **excluído** (`git status` → `D`).
- Grep global no `dist/` por traces do painel (quer 0):

```
$ grep -rl "AccessibilityToggle\|accessibility-menu-container\|option-reduce-motion" dist --include="*.html" | wc -l
0
```

- Chaves órfãs: o `<head>` mantém o **espelho** da limpeza idempotente
  (`contrast`, `text-scale`, `reduce-motion`, `enhanced-focus`,
  `screen-reader-optimized`, `high-contrast`, `theme`) — intencional (AC-2.2), não é markup de painel.

### US-3 — Tema
- Default consolidado em **`"auto"`** no `<head>` (`localStorage.getItem("theme-preference") || "auto"`),
  com normalização de valores desconhecidos; listener de `prefers-color-scheme` (AC-3.4).
- `ThemeToggle.astro` cicla `light → dark → auto` e aplica pelo mesmo `applyThemeSettings` global
  do `<head>` (`window.applyThemeSettings?.()`), com `aria-label` dinâmico por estado.
- Script de tema presente no build: `grep -c "applyThemeSettings" dist/index.html` → `5`.

### US-4 — Consumidores
- Grep em `src/` e `tests/` pelas classes/chaves legadas → somente ocorrências **intencionais**
  (lista canônica em `accessibility-settings.ts`, espelho no `<head>`, dados dos testes):
  `grep` por `contrast-high|contrast-maximum|text-scale-|\.reduce-motion|enhanced-focus|screen-reader-optimized`
  → **zero** fora do módulo/espelho/testes.
- Consumers limpos: `KpiCard` (só `prefers-reduced-motion`), `HomeHero` (bloco
  `:global(:root.reduce-motion)` removido, mantido `@media`), `ResearcherCharts` (overrides
  `.contrast-*` removidos), `ResearchGroupInteractionGraph` (`isDark` apenas `.dark`).
- CSS compilado limpo: `grep -rlE "contrast-high|contrast-maximum|text-scale-|enhanced-focus|screen-reader-optimized|reduce-motion" $(find dist -name "*.css")` → `0` (2 arquivos CSS do build verificados).

### US-5 — Testes
```
$ npx vitest run tests/accessibility-settings.test.ts
 ✓ tests/accessibility-settings.test.ts (17 tests) 9ms
 Test Files  1 passed (1)
      Tests  17 passed (17)
```

## 3. Resultados de Validação

- [x] **Baseline medido**: falhas pré-existentes da suíte são de sincronização de dados/ETL
  (campus, áreas de conhecimento, contagens de interação) — nenhuma relacionada a a11y.
- [x] `npx vitest run` — 16 arquivos: **10 passaram / 6 falharam (9 testes)** — mesmas falhas
  pré-existentes de dados; **zero regressões novas** (tests/accessibility-settings.test.ts: 17/17).
- [x] `npm run lint:eslint` — **exit 0, sem warnings/erros**.
- [x] `npm run build` — **17 574 páginas**, concluído em ~100 s, **exit 0**.
- [x] Verificação no `dist/`: widget presente com `data-account`, painel ausente, CSS limpo,
  script de tema presente (§2).

## 4. Limitações Assumidas e Pendências

1. **Conta UserWay configurada** — `USERWAY_ACCOUNT_ID = "Jmxwgqf2MY"` em
   `src/lib/accessibility-settings.ts`; `data-account="Jmxwgqf2MY"` confirmado no `dist/` após
   rebuild (17 574 páginas). Placeholder `REPLACE_ME` eliminado.
2. **View Transitions futuras**: se `<ViewTransitions />` for ativado, o botão injetado pelo
   widget some no swap — re-injetar via `astro:after-swap` (hoje o projeto não usa).
3. **CSP futura**: permitir `cdn.userway.org` / `*.userway.org` em `script-src`, `style-src
   'unsafe-inline'`, `img-src`, `frame-src`, `font-src` e `connect-src` (plan.md §2.3).
4. **Rede sem acesso ao CDN**: tema permanece local; ferramentas avançadas do widget ficam
   indisponíveis (aceito no RF-27).
5. **Fora de escopo** (auditoria de a11y): menu mobile por checkbox hack, tablists de gráficos,
   `ResearcherModal` e tooltips hover-only dos grafos seguem como pontos de melhoria estrutural —
   o widget UserWay **não** os corrige (spec.md §2.2).