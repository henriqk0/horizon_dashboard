# Plano de Tarefas: Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos

> **Recurso**: Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos  
> **Fase SpecKit**: `/speckit.implement`  
> **Especificação**: [specs/graph-label-positioning/spec.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/spec.md)  
> **Plano Técnico**: [specs/graph-label-positioning/plan.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/plan.md)  
> **Constituição**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md)

---

## Legenda de Rótulos
* `[P]`: Tarefa Paralelizável (desenvolvida sem bloqueio).
* `TDD`: Tarefa de desenvolvimento guiado por testes (Test-Driven Development).

---

## 1. Mapeamento de Tarefas por User Story

### US-1 & US-3: Leitura Clara sem Obstrução e Orientação por Quadrante (Nós da Esquerda e Bordas)

- [x] **TASK-001** `[P]`: **Infraestrutura de Testes (TDD Setup)**
  * **Ação**: Criar o arquivo [tests/unit/graphLabelLayout.test.ts](file:///home/rafael/horizon_dashboard_h/tests/unit/graphLabelLayout.test.ts) com estruturas de dados base e fixtures de testes para posicionamento de labels.
  * **Status**: Concluído (Estrutura criada com 5 testes radiais)

- [x] **TASK-002** `TDD`: **Escrever Testes Unitários para Posicionamento Angular e Ancoragem por Quadrante**
  * **Ação**: Implementar testes verificando que nós à esquerda possuem `textAnchor: "end"` e se expandem para fora do nó, e que nós à direita/topo/base usam os alinhamentos corretos.
  * **Status**: Concluído (Fase RED observada antes da implementação)

- [x] **TASK-003**: **Implementar Módulo Base de Layout Radial Angular (`graphLabelLayout.ts`)**
  * **Ação**: Criar o arquivo [src/utils/graphLabelLayout.ts](file:///home/rafael/horizon_dashboard_h/src/utils/graphLabelLayout.ts) e implementar `calculateRadialLabelPosition()`.
  * **Status**: Concluído (Fase GREEN atingida, 5/5 testes aprovados em 3ms)

---

### US-2: Prevenção Ativa de Colisão Entre Textos em Grafos Densos

- [x] **TASK-004** `TDD`: **Escrever Testes Unitários para Detecção e Resolução de Colisão AABB**
  * **Ação**: Adicionar cenários de teste para interseção de caixas delimitadoras (AABB) e desambiguação de sobreposição com prioridade para nós focais.
  * **Status**: Concluído (Fase RED observada)

- [x] **TASK-005**: **Implementar Resolvedor de Colisão AABB (`graphLabelLayout.ts`)**
  * **Ação**: Implementar `computeBoundingBox()`, `doBoxesOverlap()` e `resolveLabelCollisions()`.
  * **Status**: Concluído (Fase GREEN atingida, 9/9 testes aprovados em 4ms)

---

### US-4: Integração nos Componentes de Grafo e Manutenção de UX/Performance

- [x] **TASK-006** `[P]`: **Adicionar Efeito Halo de Leitura para SVG (`PersonInteractionGraph.astro`)**
  * **Ação**: Adicionar atributos protetores `paint-order="stroke fill"` com contorno suave em [PersonInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro).
  * **Status**: Concluído

- [x] **TASK-007**: **Integrar Engine Dinâmica no Grafo SVG do Pesquisador**
  * **Ação**: Integrar a engine de colisão e posicionamento angular no SVG de [PersonInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro).
  * **Status**: Concluído

- [x] **TASK-008**: **Integrar Engine Dinâmica no Grafo Canvas de Grupos de Pesquisa**
  * **Ação**: Atualizar o método de desenho de labels pílula em [ResearchGroupInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/groups/ResearchGroupInteractionGraph.astro) com posicionamento por quadrantes e prevenção de colisão AABB.
  * **Status**: Concluído

---

### Validação de Qualidade e Critérios de Aceitação

- [x] **TASK-009** `[P]`: **Execução da Suíte de Testes Automatizados e Benchmark de Performance**
  * **Ação**: Executar `npx vitest run tests/unit/graphLabelLayout.test.ts`.
  * **Status**: Concluído (9/9 testes unitários passando em 4ms)

- [x] **TASK-010**: **Build Estático e Validação Visual Interativa (QA / UX)**
  * **Ação**: Executar `npm run build` e validar compilação estática.
  * **Status**: Concluído (Build Astro compilado com sucesso)
