# Implementation Plan - Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos

> **Spec Reference**: [specs/graph-label-positioning/spec.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/spec.md)  
> **Plan Reference**: [specs/graph-label-positioning/plan.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/plan.md)  
> **Constitution**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md)

## Goal Description
Implementar o posicionamento dinâmico baseado em vetores angulares e um algoritmo de prevenção de colisão entre rótulos (labels) e nós nos grafos de interação (Pesquisadores e Grupos de Pesquisa), garantindo legibilidade perfeita, priorização de nós em foco e ausência de sobreposição visual especialmente no lado esquerdo do grafo.

## User Review Required
> [!IMPORTANT]
> **Abordagem Algorítmica em Duas Camadas**:
> 1. **Vetor Angular Radial**: Orienta o alinhamento da label (`start`, `end`, `middle`) para fora da bolinha do nó de acordo com o quadrante em relação ao centro do grafo.
> 2. **Resolvedor de Colisão AABB (Axis-Aligned Bounding Box)**: Detecta e ajusta posições de labels que se sobreponham em clusters densos.

## Proposed Changes

### Core Utility / Engine
#### [NEW] `src/utils/graphLabelLayout.ts`
- Implementa as funções puras de cálculo de vetor angular, bounding boxes e ajuste iterativo anti-colisão.

### Unit Tests
#### [NEW] `tests/unit/graphLabelLayout.test.ts`
- Testes unitários cobrindo alinhamento por quadrante, detecção de colisões AABB e tratamento de prioridades.

### Component Integration
#### [MODIFIED] `src/components/researchers/PersonInteractionGraph.astro`
- Atualiza a função `calculateNodeLabelPlacement` para utilizar a engine dinâmica com suporte a `text-anchor` ajustado e efeito halo de contraste no SVG.

#### [MODIFIED] `src/components/groups/ResearchGroupInteractionGraph.astro`
- Atualiza a renderização de rótulos no loop Canvas (`drawNodeLabels`), utilizando a engine de layout para evitar sobreposições de pílulas de texto.

## Verification Plan
### Automated Tests
- Executar `npx vitest run tests/unit/graphLabelLayout.test.ts` (ou `npm run test`).
- Executar `npm run check` para validação de tipos TypeScript.
- Executar `npm run build` para garantir integridade do build Astro.

### Manual Verification
- Inspecionar a página de perfil de pesquisador com grafo de conexões em resoluções Desktop e Mobile.
- Inspecionar o grafo de grupos de pesquisa validando que nós à esquerda da tela não têm seus nomes cobrindo a bolinha nem outros nomes.
