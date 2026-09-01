# Plano de Tarefas: Correção de Defeitos dos Grafos de Interação

> **Recurso**: Correção de Defeitos dos Grafos de Interação  
> **Fase SpecKit**: `/speckit.implement`  
> **Especificação**: [specs/graph-interaction-bugfixes/spec.md](file:///home/rafael/horizon_dashboard_h/specs/graph-interaction-bugfixes/spec.md)  
> **Plano Técnico**: [specs/graph-interaction-bugfixes/plan.md](file:///home/rafael/horizon_dashboard_h/specs/graph-interaction-bugfixes/plan.md)  
> **Constituição**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md)

---

## Legenda de Rótulos
* `[P]`: Tarefa Paralelizável (desenvolvida sem bloqueio).
* `TDD`: Tarefa de desenvolvimento guiado por testes (teste antes da implementação).
* `INSP`: Verificada por inspeção e build (lógica não extraível de manipulador DOM inline).

---

## 1. Mapeamento de Tarefas por User Story

### US-2: Navegação previsível no grafo ego-centrado (BUG-002)

- [x] **TASK-001** `TDD`: **Escrever testes da matemática de pan/zoom**
  * **Ação**: Criar `tests/graph-pan-zoom.test.ts` cobrindo `getUnitsPerPixel` (incluindo entradas
    inválidas), `clampScale`, a invariante de ancoragem do zoom sob o cursor, o pan 1:1 e
    `toTransformStyle`.
  * **Critérios**: AC-2.1, AC-2.2, AC-2.3, AC-2.4.

- [x] **TASK-002**: **Implementar `src/lib/graph-pan-zoom.ts`**
  * **Ação**: Módulo puro com `GraphPanZoomTransform`, `getUnitsPerPixel`, `clampScale`,
    `zoomAtPointer`, `panFromDrag` e `toTransformStyle`.

- [x] **TASK-003**: **Integrar o módulo no script do `PersonInteractionGraph.astro`**
  * **Ação**: Substituir a matemática inline; guardar origem da transformação e ponteiro inicial no
    `pointerdown`; reavaliar a razão de unidades por gesto.

### US-1: Filtro coerente entre grafo e tabela (BUG-001)

- [x] **TASK-004** `TDD` `[P]`: **Escrever testes do contrato `data-relation-types`**
  * **Ação**: Criar `tests/person-interaction-table-contract.test.ts` verificando o formato
    serializado e sua compatibilidade com a normalização feita pelo consumidor.
  * **Critérios**: AC-1.1.

- [x] **TASK-005**: **Implementar `serializeRelationTypesAttribute`**
  * **Ação**: Adicionar a função em `src/lib/person-interaction.ts` e reexportar em
    `src/lib/student-interaction.ts`.

- [x] **TASK-006**: **Emitir o contrato no `PersonInteractionTable.astro`**
  * **Ação**: Adicionar `data-table-row`, `data-relation-types`, `data-table-count-label`,
    `data-original-label` e o bloco `data-table-no-results`.
  * **Critérios**: AC-1.1, AC-1.2, AC-1.3, AC-1.4.

### US-3: Honestidade nas métricas de rede (BUG-003)

- [x] **TASK-007** `TDD` `[P]`: **Escrever testes de ausência de métricas**
  * **Ação**: Estender `tests/people-network.test.ts` com fixture sem `largest_component_size`,
    `isolated_nodes` e rankings, afirmando `null` e preservação do comportamento com export completo.
  * **Critérios**: AC-3.1, AC-3.4.

- [x] **TASK-008**: **Tornar `buildGraphSummary` null-safe**
  * **Ação**: Introduzir `toOptionalNumber` e ajustar o tipo `PeopleNetworkGraphSummary`.

- [x] **TASK-009**: **Adicionar estados vazios no `PeopleNetworkOverview.astro`**
  * **Ação**: Mensagens para `topCollaborators` e `topConnectors` vazios.
  * **Critérios**: AC-3.2, AC-3.3.

### US-4: Interação resiliente (BUG-004)

- [x] **TASK-010** `INSP` `[P]`: **Tratar `pointercancel` no grafo de grupo**
  * **Critérios**: AC-4.1.

- [x] **TASK-011** `INSP`: **Preservar enquadramento no redimensionamento**
  * **Ação**: Flag `hasUserAdjustedView` marcada no zoom e no arrasto efetivo.
  * **Critérios**: AC-4.2.

- [x] **TASK-012** `INSP` `[P]`: **Guarda de inicialização no `GraphLegend.astro`**
  * **Critérios**: AC-4.3.

### Validação

- [x] **TASK-013**: **Suíte de testes completa** (`npx vitest run`).
- [x] **TASK-014**: **Lint** (`npm run lint:eslint`).
- [x] **TASK-015**: **Build de produção** (`npm run build`), validando tipos e os 4k+ páginas geradas.

---

## 2. Dependências

```
TASK-001 → TASK-002 → TASK-003
TASK-004 → TASK-005 → TASK-006
TASK-007 → TASK-008 → TASK-009
TASK-010, TASK-011, TASK-012  (independentes)
todas → TASK-013 → TASK-014 → TASK-015
```

---

## 3. Resultado da Validação

| Tarefa | Comando | Resultado |
|---|---|---|
| TASK-013 | `npx vitest run` | 81 passando / 13 falhas **pré-existentes** (idênticas ao baseline medido com `git stash`) |
| TASK-014 | `npm run lint:eslint` | Limpo |
| TASK-015 | `npm run build` | 16.096 páginas em 67,80s, exit 0 |

Verificação end-to-end no HTML gerado (`dist/researchers/1008/index.html`): 8 linhas
`data-table-row="true"` para 8 arestas `edge-group`, e o atributo `data-relation-types` produzindo
os mesmos valores em ambos os lados (`initiative,research_group`, `initiative,article`,
`initiative,research_group,advisorship`, ...).

Ver [walkthrough.md](file:///home/rafael/horizon_dashboard_h/specs/graph-interaction-bugfixes/walkthrough.md).
