# Phase 0 Research: Exibição e Filtragem por Campus Principal em Pesquisadores

**Feature**: `001-researcher-primary-campus`  
**Date**: 2026-09-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Contexto e Problema

Na versão atual do dashboard, os cards de pesquisadores exibem os campi de todos os grupos de pesquisa aos quais o pesquisador pertence. Em uma análise do dataset canônico (`src/data/researchers_only_canonical.json`):
- **560 pesquisadores** participam de grupos de pesquisa em múltiplos campi.
- Como consequência, seus cards mostram múltiplos campi (`[Campus A] [Campus B] [+N]`) e o filtro por campus exibe esses pesquisadores em todas essas unidades, gerando dados inflados e duplicidade estatística nos dashboards agregados por campus (`campusResearcherViews`).

---

## 2. Decisões de Arquitetura e Design

### Decisão 1: Fonte da Verdade do Campus Principal

- **Decisão**: Utilizar o atributo oficial `researcher.campus` (`{ id: string | number; name: string }`) presente em cada registro do pesquisador.
- **Racional**:
  - No arquivo canônico `src/data/researchers_only_canonical.json`, **2.496 de 2.507 pesquisadores (99,56%)** já possuem esse atributo preenchido.
  - 100% dos IDs presentes correspondem com precisão aos identificadores da lista oficial de campi (`src/data/campuses_canonical.json`).
  - Existem 21 pesquisadores cuja lotação oficial difere dos campi dos grupos dos quais participam (por exemplo, pesquisadores lotados no campus Serra que colaboram em grupos sediados em Vitória ou Presidente Kennedy). O campo `researcher.campus` reflete com fidelidade a lotação de pessoal, enquanto os grupos refletem colaborações de pesquisa interinstitucionais.
- **Alternativas consideradas**:
  - *Manter a extração a partir de `researcher.research_groups`:* Rejeitada porque é a causa primária do problema reportado pelo usuário.
  - *Utilizar o campus do primeiro grupo da lista:* Rejeitada porque para os 21 pesquisadores com lotação divergente dos grupos, atribuiria o campus incorreto.

---

### Decisão 2: Tratamento de Registros sem Campus (Fallback Gracioso)

- **Decisão**: Quando `researcher.campus` for nulo ou ausente (ocorrência em apenas 11 registros em todo o dataset de 2.507 pesquisadores), o sistema deve retornar uma lista vazia de campi (`campusIds: []`, `campusNames: []`).
- **Racional**:
  - Os 11 pesquisadores sem campus no dataset também possuem 0 grupos de pesquisa cadastrados. Logo, não há dados para inferência e atribuir um campus arbitrário violaria a integridade dos dados acadêmicos.
  - O Princípio III da Constituição do projeto exige que a ausência de campos seja tolerada com renderização graciosa: o card renderizará sem a pílula de campus, o pesquisador continuará visível e buscável por nome na visão global ("Todos os Campi"), e não haverá quebras em tempo de execução nem exceções no console.
- **Alternativas consideradas**:
  - *Atribuir campus padrão (ex.: Reitoria):* Rejeitada porque adulteraria dados sem confirmação documental.
  - *Ocultar os 11 pesquisadores:* Rejeitada porque excluiria servidores com produção e publicações válidas da plataforma.

---

### Decisão 3: Contrato do Card e Filtragem Client-Side

- **Decisão**: Em `src/lib/researcher-card-markup.ts`, garantir que `buildResearcherCardView` gere `campusIds` e `campusNames` contendo apenas o campus principal (array com no máximo 1 item). O atributo `data-campus-ids` do card no HTML conterá apenas esse ID único, e `renderCampusPills` renderizará no máximo 1 pílula, sem badges de overflow (`+N`).
- **Racional**:
  - O script de filtragem client-side em `src/pages/researchers/index.astro` utiliza `researcher.campusIds.includes(currentCampusId)` e a renderização SSR inicial do grid usa `data-campus-ids`.
  - Ao fornecer um array unielementar com o campus principal, tanto a renderização no servidor quanto a reatividade do filtro no navegador passam a operar de forma estrita sobre o campus principal sem exigir modificações estruturais complexas no motor de busca.
- **Alternativas consideradas**:
  - *Criar novo campo `primaryCampusId` separado e alterar todo o código de evento de filtro:* Rejeitada por adicionar redundância e aumentar o risco de regressão em comparação com a uniformização de `campusIds` no card.

---

### Decisão 4: Isolamento e Testabilidade (Princípios I e II da Constituição)

- **Decisão**: A lógica de resolução e fallback do campus de pesquisador residirá exclusivamente em `src/lib/tenant-data.ts`, sendo exportada de forma tipada (`getResearcherPrimaryCampusId`, `getResearcherCampusIds`).
- **Racional**:
  - Em conformidade com o Princípio II, componentes `.astro` não conterão regras de transformação.
  - Em conformidade com o Princípio I, testes em `tests/` com Vitest cobrirão a resolução com fixtures em memória antes de qualquer alteração de código.
