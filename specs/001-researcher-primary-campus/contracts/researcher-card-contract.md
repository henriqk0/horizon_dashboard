# Contract: Researcher Card & Campus Predicates

**Feature**: `001-researcher-primary-campus`  
**Date**: 2026-09-15  
**Spec**: [spec.md](../spec.md)

---

## 1. Contrato da Função `getResearcherCampusIds`

Localização: `src/lib/tenant-data.ts`

### Assinatura
```typescript
export function getResearcherCampusIds(researcher: Researcher): string[];
```

### Comportamento Sob Contrato
1. **Entrada com `researcher.campus` preenchido:**
   - Dado um objeto `Researcher` onde `campus = { id: 2, name: "Vitória" }`, mesmo que `research_groups` contenha grupos de campi `[11, 13, 2]`.
   - **Retorno Obrigatório:** `["2"]` (array contendo exclusivamente o ID canônico em string do campus principal).
2. **Entrada sem `researcher.campus` (`null` ou `undefined`):**
   - Dado um objeto `Researcher` sem campus informado.
   - **Retorno Obrigatório:** `[]` (array vazio), evitando inferências espúrias e erros de execução.
3. **Imutabilidade e Idempotência:**
   - Chamadas subsequentes com o mesmo pesquisador devem retornar o mesmo array cacheado.

---

## 2. Contrato de Visualização do Card (`ResearcherCardView` e `renderResearcherCardMarkup`)

Localização: `src/lib/researcher-card-markup.ts`

### Assinatura
```typescript
export function buildResearcherCardView(params: {
    researcher: Researcher;
    stats: ResearcherStats;
    baseUrl: string;
    campusIds?: string[];
    campusNames?: string[];
    profileHref?: string;
}): ResearcherCardView;

export function renderResearcherCardMarkup(card: ResearcherCardView): string;
```

### Comportamento do DOM Gerado Sob Contrato
1. **Atributo `data-campus-ids`:**
   - O elemento raiz `<article class="researcher-card ...">` DEVE conter o atributo `data-campus-ids="${card.campusIds.join("|")}"`.
   - Para um pesquisador do campus 2, o valor DEVE ser estritamente `data-campus-ids="2"`.
2. **Renderização de Pílulas (`renderCampusPills`):**
   - Se `card.campusNames = ["Vitória"]`, o markup DEVE renderizar exatamente **uma** pílula contendo "Vitória":
     ```html
     <div class="flex flex-wrap justify-center gap-2 mb-3 w-full px-4" title="Vitória">
         <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-premium-accent/8 border border-premium-accent/15 text-[10px] font-bold text-premium-accent leading-none">
             <span class="w-1.5 h-1.5 rounded-full bg-premium-accent shrink-0"></span>
             Vitória
         </span>
     </div>
     ```
   - NUNCA deve renderizar pílulas adicionais ou contadores de excesso como `+1`, `+2`.
3. **Degradação Graciosa (sem campus):**
   - Se `card.campusNames = []`, a função `renderCampusPills` DEVE retornar string vazia `""`, sem quebrar o layout do card nem exibir elementos quebrados.

---

## 3. Contrato de Agrupamento das Visões de Campus (`buildCampusResearcherViews`)

Localização: `src/lib/researcher-collections.ts`

### Assinatura
```typescript
export function buildCampusResearcherViews(researchers: Researcher[]): Record<string, Researcher[]>;
```

### Invariante de Teste
```typescript
const views = buildCampusResearcherViews(researchers);
// Para qualquer par de campi distintos c1 e c2:
const setC1 = new Set(views[c1].map(r => r.id));
const setC2 = new Set(views[c2].map(r => r.id));
const intersection = [...setC1].filter(id => setC2.has(id));
expect(intersection).toEqual([]); // Nenhum pesquisador pode pertencer a mais de uma visão de campus
```
