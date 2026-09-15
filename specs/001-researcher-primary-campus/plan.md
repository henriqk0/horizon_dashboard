# Implementation Plan: Exibição e Filtragem por Campus Principal em Pesquisadores

**Branch**: `001-researcher-primary-campus` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-researcher-primary-campus/spec.md`

## Summary

Modificar a resolução de campus e a renderização dos cards na aba de pesquisadores (`/researchers`) para que cada pesquisador exiba única e exclusivamente o seu campus oficial de lotação (`researcher.campus`), em vez de agregar todos os campi de seus grupos de pesquisa. Isso elimina a poluição visual no card (badges residuais `+1`, `+2`), impede falsos positivos no filtro de campus por unidade e resolve duplicações estatísticas nas visões analíticas por campus (`campusResearcherViews`).

## Technical Context

**Language/Version**: TypeScript (strict, `astro/tsconfigs/strict`), Node 20

**Primary Dependencies**: Astro 5, Tailwind CSS 4 — nenhuma dependência nova necessária.

**Storage**: static JSON artifacts sob `src/data/` produzidos por `horizon_etl` e sincronizados automaticamente (somente leitura; nenhum arquivo JSON será editado manualmente).

**Testing**: Vitest com jsdom em `tests/campus-filter.test.ts`.

**Target Platform**: build estático servido a partir de `SITE_BASE` / `SITE_URL` (Astro static site).

**Project Type**: front-end estático (site Astro sem servidor de aplicação).

**Performance Goals**: toda a resolução de campus principal ocorre em tempo de build (SSR estático) com cache em memória via `Map` em `src/lib/tenant-data.ts`, mantendo payload leve para o cliente sem impacto no tempo de carregamento ou scroll infinito da grade de pesquisadores.

**Constraints**: `src/data/` não é modificado; ausência do atributo `campus` em registros legados (11 casos) é tratada com degradação graciosa sem exceções.

**Scale/Scope**:
- Arquivos modificados:
  - `src/types/researchers.ts` (definição formal de `campus` na interface `Researcher`)
  - `src/lib/tenant-data.ts` (`getResearcherCampusIds` priorizando campus de lotação e mantendo cache)
  - `src/lib/researcher-card-markup.ts` (`buildResearcherCardView` e `renderCampusPills` exibindo apenas 1 campus sem `+N`)
  - `src/lib/researcher-collections.ts` (`buildCampusResearcherViews` agrupando por campus principal)
  - `tests/campus-filter.test.ts` (testes de unidade cobrindo o novo contrato)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*Source: `.specify/memory/constitution.md` v1.0.0.*

| # | Gate | Status | Evidence / justification |
|---|------|--------|--------------------------|
| I | **Test-First** — every behavior change has a Vitest test in `tests/` written before its implementation task, and the RED-phase output will be recorded in `walkthrough.md`. No test reaches the network, an external service, or permanent storage. | **PASS** | Novos testes serão adicionados a `tests/campus-filter.test.ts` validando: 1) pesquisador multigrupo retorna apenas o campus de lotação; 2) card renderiza apenas 1 pílula; 3) `buildCampusResearcherViews` produz coleções disjuntas. O ciclo RED será executado e gravado antes da implementação. |
| II | **Testable logic outside components** — no business rule, data transformation, or interaction state machine lands inside an `.astro` `<script>`; each one is a module in `src/lib/` with explicit types, and the `<script>` only selects nodes, registers listeners, and delegates. | **PASS** | Toda a lógica reside em `src/lib/tenant-data.ts`, `src/lib/researcher-card-markup.ts` e `src/lib/researcher-collections.ts`. O componente `src/pages/researchers/index.astro` apenas consome essas funções puras. |
| III | **Data is read-only** — the plan does not hand-edit anything under `src/data/`, no test uses those files as a live fixture, and missing fields, empty lists, or broken links render a legible empty state rather than a blank screen or an exception. | **PASS** | Nenhum arquivo sob `src/data/` será editado. Testes utilizam fixtures em memória. Pesquisadores sem campus atribuído renderizam graciosamente sem pílula e sem quebrar o layout. |
| IV | **Static site, configurable base** — no application server, API route, or runtime database access is introduced, and every internal link and asset derives from `SITE_BASE` instead of a hardcoded absolute path. | **PASS** | Mantido o padrão estático existente (`baseUrl` propagado nos cards de pesquisadores). Nenhuma rota de API ou chamada de rede dinâmica é introduzida. |
| V | **Accessibility and interaction contract** — each new stateful interaction has an explicit contract test, `tests/accessibility.test.ts` does not regress, interactive elements stay keyboard-reachable with an accessible name, and no information is conveyed by color alone. | **PASS** | O contrato do card em `contracts/researcher-card-contract.md` assegura atributos de acessibilidade preservados (`title`, rótulos legíveis, estrutura semântica), sem depender unicamente de cor. |

**Initial check (before Phase 0)**: **PASS**

**Post-design re-check (after Phase 1)**: **PASS** — todos os artefatos de design (`data-model.md`, `contracts/researcher-card-contract.md`, `quickstart.md`) estão em estrita conformidade com os cinco portões da constituição.

## Project Structure

### Documentation (this feature)

```text
specs/001-researcher-primary-campus/
├── plan.md              # Este arquivo (plano de implementação e checagem constitucional)
├── research.md          # Fase 0 (decisões de arquitetura, justificativas e alternativas)
├── data-model.md        # Fase 1 (modelos de dados, invariantes e diagrama de fluxo)
├── quickstart.md        # Fase 1 (guia de execução, testes e cenários manuais de validação)
├── contracts/           # Fase 1 (contratos da API interna e do DOM do card)
│   └── researcher-card-contract.md
└── checklists/
    └── requirements.md  # Checklist de validação da especificação
```

### Source Code (repository root)

```text
src/
├── types/
│   └── researchers.ts            # Declaração formal de campus na interface Researcher
├── lib/
│   ├── tenant-data.ts             # getResearcherCampusIds priorizando campus oficial
│   ├── researcher-card-markup.ts  # buildResearcherCardView & renderCampusPills (1 campus)
│   └── researcher-collections.ts  # buildCampusResearcherViews disjuntas por campus
├── pages/
│   └── researchers/
│       └── index.astro            # Verificação do consumo do campusIds unificado
tests/
└── campus-filter.test.ts          # Testes unitários Vitest para campus principal e disjunção
```

**Structure Decision**: Nenhuma modificação na estrutura de diretórios do repositório. As alterações ocorrem estritamente dentro dos módulos de lógica em `src/lib/`, na tipagem em `src/types/` e na suíte de testes em `tests/`.

## Complexity Tracking

Nenhuma violação constitucional identificada. A implementação adota a abordagem mais simples e direta possível, reaproveitando os atributos já existentes nos dados canônicos.
