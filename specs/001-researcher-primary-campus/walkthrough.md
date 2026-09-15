# Walkthrough: Exibição e Filtragem por Campus Principal em Pesquisadores

**Feature**: `001-researcher-primary-campus`  
**Date**: 2026-09-15  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Tasks**: [tasks.md](./tasks.md)

---

## 1. Resumo da Implementação

Implementamos a padronização e exibição estrita do campus principal nos pesquisadores do Horizon Dashboard.
Anteriormente, pesquisadores que participavam de grupos de pesquisa em múltiplos campi herdavam todos esses campi em seus cards (gerando badges como `[Vitória] [Cefor] [+1]`) e no mecanismo de filtro da página, além de causarem duplicações nas contagens agregadas por campus.

Com a alteração:
1. O tipo `Researcher` em `src/types/researchers.ts` passou a declarar formalmente a propriedade `campus?: { id: string | number; name: string } | null`.
2. A função `getResearcherCampusIds` em `src/lib/tenant-data.ts` prioriza o campus oficial de lotação do pesquisador com cache em memória, retornando apenas `[primaryCampusId]`.
3. O card em `src/lib/researcher-card-markup.ts` renderiza unicamente a pílula do campus principal, sem indicadores numéricos residuais (`+N`).
4. O atributo de filtragem no DOM (`data-campus-ids`) é restrito ao ID do campus principal, garantindo filtragem e busca sem falsos positivos.
5. A função `buildCampusResearcherViews` em `src/lib/researcher-collections.ts` assegura partições estritamente disjuntas entre os campi, eliminando contagens duplicadas.

---

## 2. Evidências do Ciclo TDD (Test-First)

### 2.1. Fase RED (Falha Observada)

Antes de alterar os módulos de lógica, foram adicionados testes em `tests/campus-filter.test.ts` que comprovaram o comportamento defeituoso:

```text
FAIL tests/campus-filter.test.ts > Researcher primary campus resolution and card contract (US1)
AssertionError: expected [ '2', '11', '13' ] to deeply equal [ '2' ]
- Expected: ["2"]
+ Received: ["2", "11", "13"]

FAIL tests/campus-filter.test.ts > Researcher primary campus resolution and card contract (US1) > renders strictly one campus pill and no overflow badges on researcher card
AssertionError: expected markup not to contain 'Cefor'
Received markup:
  <div class="flex flex-wrap justify-center gap-2 mb-3 w-full px-4" title="Vitória, Cefor, Cariacica">
    <span ...>Vitória</span>
    <span ...>Cefor</span>
    <span ...>+1</span>
  </div>
```

### 2.2. Fase GREEN (Aprovação dos Testes)

Após as modificações em `src/types/researchers.ts`, `src/lib/tenant-data.ts` e `src/lib/researcher-card-markup.ts`, a suíte de testes passou com 100% de sucesso:

```text
✓ tests/campus-filter.test.ts (16 tests) 182ms
  ✓ Campus filter normalization (2)
  ✓ Campus predicates use campus ids (3)
  ✓ Campus dashboards remain keyed by id (3)
  ✓ Publications use the canonical article campus (2)
  ✓ Researcher primary campus resolution and card contract (US1) (2)
    ✓ returns strictly the primary campus id for a researcher with multiple research groups 0ms
    ✓ renders strictly one campus pill and no overflow badges on researcher card 1ms
  ✓ Strict campus filtering and DOM contract (US2) (2)
    ✓ sets data-campus-ids to strictly the primary campus id and rejects secondary campuses in filter predicate 0ms
    ✓ handles researchers with no campus gracefully in filter predicates 0ms
  ✓ Disjoint campus researcher views without duplicate counts (US3) (2)
    ✓ ensures researchers are partitioned exclusively into their primary campus views 43ms
    ✓ verifies multi-group researcher belongs only to their primary campus view 18ms

Test Files  1 passed (1)
     Tests  16 passed (16)
```

---

## 3. Validação de Qualidade e Build

- **Linting (`npm run lint:eslint`)**: 0 erros, 0 avisos.
- **Build (`npm run build`)**: Compilação estática de produção executada com sucesso.
