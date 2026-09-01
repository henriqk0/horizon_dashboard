# Walkthrough: Correção de Defeitos dos Grafos de Interação

> **Recurso**: Correção de Defeitos dos Grafos de Interação  
> **Fase SpecKit**: `/speckit.implement` (concluída)  
> **Constituição**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md) §4 (Walkthrough com prova de trabalho)

---

## 1. Resumo

Quatro defeitos corrigidos, com 22 testes novos em 3 arquivos, seguindo TDD (fase RED observada e
registrada antes de cada implementação).

| ID | Defeito | Arquivos tocados | Prova |
|---|---|---|---|
| BUG-001 | Filtros não filtravam a tabela | `PersonInteractionTable.astro`, `person-interaction.ts`, `student-interaction.ts` | 5 testes de contrato |
| BUG-002 | Pan/zoom em unidades erradas | `graph-pan-zoom.ts` (novo), `PersonInteractionGraph.astro` | 10 testes de invariante |
| BUG-003 | Métrica ausente virava zero | `people-network.ts`, `PeopleNetworkOverview.astro` | 4 testes novos |
| BUG-004 | Ciclo de vida da interação | `ResearchGroupInteractionGraph.astro`, `GraphLegend.astro` | Inspeção + build |

---

## 2. Prova de Trabalho por Defeito

### BUG-001 — Contrato `data-*` restabelecido

O script de filtros já consumia `[data-table-row]`, `[data-relation-types]`,
`[data-table-no-results]` e `[data-table-count-label]`; nenhum era emitido pela tabela.

A serialização virou função pura testável em vez de expressão inline no markup:

```ts
export const serializeRelationTypesAttribute = (
    row: PersonInteractionTableRow,
): string => row.relations.map((relation) => relation.type).join(",");
```

O teste mais importante do arquivo não verifica o formato em si, mas a **igualdade entre os dois
produtores** do mesmo atributo — as arestas do SVG e as linhas da tabela — que é a condição real
para grafo e tabela filtrarem juntos:

```
✓ matches the attribute the SVG edge of the same pair produces
```

### BUG-002 — Sistema de coordenadas unificado

A causa raiz foi confirmada empiricamente antes da correção, num SVG isolado com `viewBox` de 1000
renderizado a 200px: `transform: translate(100px)` num `<g>` deslocou o elemento **20px** na tela.
Confirma que a unidade é do `viewBox`, não pixel de tela — a razão exata de 5:1.

A matemática saiu do `<script>` inline para `src/lib/graph-pan-zoom.ts`, o que a tornou testável.
A invariante de ancoragem é verificada para quatro razões de unidade e ambas as direções de zoom:

```
✓ keeps the world point under the pointer anchored while zooming in
✓ keeps the anchor for any units-per-pixel ratio and zoom direction
✓ clamps the scale to the limits without breaking the anchor
✓ moves the graph exactly as far as the pointer travelled on screen
✓ stays 1:1 with the pointer regardless of the current scale
```

Detalhe de implementação relevante: a razão unidade/pixel é congelada no `pointerdown` e reutilizada
durante todo o arrasto, para que um redimensionamento no meio do gesto não provoque salto.

### BUG-003 — Ausência distinguível de zero

A fixture nova em `tests/people-network.test.ts` reproduz exatamente o `graph_stats` que o ETL está
exportando hoje para `people_collaboration_graph.json` — sem `isolated_nodes`,
`largest_component_size` nem rankings:

```
✓ reports absent structural metrics as null instead of zero
✓ keeps the counters that every export carries
✓ yields empty rankings rather than fabricated entries
✓ still computes the component share when the export is complete
```

O último teste protege a compatibilidade (AC-3.4): com export completo, `largestComponentShare`
continua exatamente `0.6`, como o teste original já afirmava.

### BUG-004 — Ciclo de vida

- `pointercancel` no canvas do grafo de grupo encerra o arrasto e libera a captura.
- `hasUserAdjustedView` impede que o `ResizeObserver` descarte o enquadramento manual; o botão
  "recentralizar" limpa a flag, devolvendo o auto-fit a quem o pediu.
- `GraphLegend` ganhou `dataset.legendInitialized`, alinhando-se a `panZoomInitialized` e
  `filtersInitialized`.

---

## 3. Resultados de Validação

### 3.1 Baseline (obrigatório antes de atribuir falhas)

A árvore de trabalho contém uma sincronização de dados do ETL ainda não commitada (dezenas de
`src/data/*.json` modificados), e **13 testes já falhavam antes desta implementação**. O baseline foi
medido com as mudanças temporariamente removidas via `git stash`, e reproduziu exatamente a mesma
lista de 13 falhas, nos mesmos 6 arquivos:

```
tests/campus-filter.test.ts .............. 2 falhas
tests/campus-pages-coverage.test.ts ...... 1 falha
tests/knowledge-area-search.test.ts ...... 2 falhas
tests/research-group-interaction.test.ts . 4 falhas
tests/site-search-normalization.test.ts .. 1 falha
tests/student-interaction.test.ts ........ 3 falhas
```

Essas falhas são anteriores e independentes deste trabalho — decorrem do novo conteúdo dos exports,
não do código corrigido aqui. **Não foram tratadas nesta iteração** e continuam abertas.

### 3.2 Suíte após a implementação

```
Test Files  6 failed | 10 passed (16)
     Tests  13 failed | 81 passed (94)
```

Mesmas 13 falhas do baseline, zero regressões. Os 22 testes novos passam:

```
✓ tests/graph-pan-zoom.test.ts (10 tests)
✓ tests/person-interaction-table-contract.test.ts (5 tests)
✓ tests/people-network.test.ts (7 tests)
```

### 3.3 Lint

`npm run lint:eslint` — sem avisos ou erros.

### 3.4 Build de produção

```
[build] 16096 page(s) built in 67.80s
[build] Complete!
```

Verificação end-to-end no HTML gerado (`dist/researchers/1008/index.html`): 8 linhas
`data-table-row="true"` para 8 arestas `edge-group` do mesmo grafo, com `data-relation-types`
idêntico dos dois lados. Serialização multi-tipo confirmada em escala: 904 ocorrências de
`initiative,research_group`, 376 de `initiative,article`, 24 de
`initiative,research_group,advisorship`.

---

## 4. Limitações Assumidas e Pendências

1. **Zebra striping da tabela**: linhas ocultas por filtro deixam a alternância de fundo irregular.
   Corrigir exigiria recolorir no cliente; a legibilidade da tabela filtrada não depende disso.
2. **`PeopleNetworkOverview.astro` continua órfão**: nenhuma página o importa. Ele foi tornado
   robusto, não religado — a decisão de reconectar ou remover fica com o time.
3. **Rankings ausentes no export**: a correção mostra um estado vazio honesto. A origem do problema
   está no ETL (`henriqk0/horizon_etl`) e não neste repositório.
4. **13 falhas pré-existentes na suíte**: fora do escopo desta especificação, mas devem ser
   endereçadas antes do próximo release, já que mascaram regressões futuras.
5. **`specs/graph-label-positioning`** declara ter criado `src/utils/graphLabelLayout.ts` e
   `tests/unit/graphLabelLayout.test.ts`; nenhum dos dois existe na árvore atual. Vale conferir se
   aquela implementação foi revertida.
