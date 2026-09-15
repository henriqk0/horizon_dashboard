# Data Model: Exibição e Filtragem por Campus Principal em Pesquisadores

**Feature**: `001-researcher-primary-campus`  
**Date**: 2026-09-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Entidades do Domínio

### 1.1. `Researcher` (Interface TypeScript em `src/types/researchers.ts`)

Representa o pesquisador com seus dados canônicos fornecidos pelo pipeline ETL.

```typescript
export interface ResearcherCampus {
    id: string | number;
    name: string;
}

export interface Researcher {
    id: string;
    name: string;
    identification_id?: string | null;
    birthday?: string | null;
    cnpq_url?: string | null;
    google_scholar_url?: string | null;
    resume?: string | null;
    citation_names?: string | null;
    initiatives: ResearcherInitiative[];
    research_groups: ResearcherGroup[];
    knowledge_areas: ResearcherKnowledgeArea[];
    academic_education: AcademicEducation[];
    articles: Article[];
    advisorships: ResearcherAdvisorship[];
    classification?: "student" | "researcher" | "outside_ifes" | null;
    classification_confidence?: "low" | "medium" | "high" | null;
    classification_note?: string | null;
    role_evidence?: ResearcherRoleEvidence | null;
    was_student?: boolean;
    was_staff?: boolean;
    // Campo adicionado para representar formalmente o campus de lotação oficial:
    campus?: ResearcherCampus | null;
}
```

#### Regras de Validação do Modelo:
- `researcher.campus`: Quando presente, deve conter `id` não vazio e `name` correspondente ao campus oficial.
- Se `researcher.campus` for `null` ou `undefined`, o pesquisador é tratado como sem campus institucional explícito.

---

### 1.2. `ResearcherCardView` (Interface TypeScript em `src/lib/researcher-card-markup.ts`)

Representa o modelo de visualização desacoplado preparado para renderização rápida no SSR e no cliente.

```typescript
export interface ResearcherCardView {
    id: string;
    name: string;
    initial: string;
    searchIndex: string;
    campusIds: string[];            // Garantia: array com 0 ou 1 elemento (apenas o campus principal)
    campusNames: string[];          // Garantia: array com 0 ou 1 elemento (apenas o campus principal)
    highestDegree: string | null;
    identificationLabel: string | null;
    citationName: string | null;
    knowledgeAreaNames: string[];
    projects: number;
    articles: number;
    advisorships: number;
    advisorshipsTooltip: string;
    isSupervisor: boolean;
    isStudent: boolean;
    cnpqUrl: string | null;
    scholarUrl: string | null;
    profileHref: string;
}
```

#### Invariantes do Modelo de Visualização:
- `campusIds.length <= 1`: Em nenhuma circunstância o card deve conter mais de 1 campus associado.
- `campusNames.length <= 1`: O nome do campus exibido na pílula do card corresponde estritamente ao ID em `campusIds`.
- Se `campusIds` for vazio (`[]`), `campusNames` também deve ser vazio (`[]`), e nenhuma pílula de campus é desenhada no card.

---

### 1.3. `CampusResearcherViews` (Mapeamento em `src/lib/researcher-collections.ts`)

Mapeamento associativo que armazena os pesquisadores ativos de cada campus para alimentar os painéis de KPI e gráficos da página.

```typescript
export type CampusResearcherViews = Record<string, Researcher[]>;
```

#### Regras de Negócio e Invariantes:
- **Disjunção**: Para quaisquer dois campi $C_A \neq C_B$, a interseção de pesquisadores deve ser vazia ($\text{views}[C_A] \cap \text{views}[C_B] = \emptyset$).
- **Cobertura**: Todo pesquisador com `campus.id = C_X` pertence exclusivamente a $\text{views}[C_X]$.

---

## 2. Diagrama de Relações e Fluxo de Dados

```mermaid
flowchart TD
    CanonicalData["researchers_only_canonical.json"] -->|Lê dados canônicos| Domain["Researcher (com researcher.campus)"]
    Domain -->|getResearcherCampusIds()| TenantLib["src/lib/tenant-data.ts"]
    TenantLib -->|Retorna [primaryCampusId]| CardMarkup["src/lib/researcher-card-markup.ts"]
    CardMarkup -->|buildResearcherCardView()| CardView["ResearcherCardView (campusIds: [id])"]
    CardView -->|renderResearcherCardMarkup()| DOMCard["HTML .researcher-card (data-campus-ids='id')"]
    TenantLib -->|buildCampusResearcherViews()| CampusViews["CampusResearcherViews (sem duplicatas)"]
    DOMCard -->|filterResearchers()| FilterResult["Lista Filtrada de Cards"]
    CampusViews -->|KPIs e Gráficos| DashboardViews["Cards de KPI por Campus"]
```
