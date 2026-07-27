# Task List - Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos

> **Spec Reference**: [specs/graph-label-positioning/spec.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/spec.md)  
> **Plan Reference**: [specs/graph-label-positioning/plan.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/plan.md)  
> **Tasks Reference**: [specs/graph-label-positioning/tasks.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/tasks.md)

## SpecKit Progress
- [x] **/speckit.constitution**: Leitura e adoção do contrato da constituição do projeto
- [x] **/speckit.specify**: Elaboração do `spec.md` (Atores, User Stories e Critérios de Aceitação)
- [x] **/speckit.plan**: Elaboração do `plan.md` (Arquitetura, algoritmo em 2 camadas e plano técnico)
- [x] **/speckit.tasks**: Estruturação de tarefas por User Story, com TDD, paralelismo `[P]` e dependências
- [x] **/speckit.implement**: **Implementação concluída com 100% de sucesso (9/9 testes passando em 4ms)**

---

## Tasks Checklist

### US-1 & US-3: Leitura Clara e Ajuste por Quadrante
- [x] **TASK-001** `[P]`: Criar arquivo de testes [tests/unit/graphLabelLayout.test.ts](file:///home/rafael/horizon_dashboard_h/tests/unit/graphLabelLayout.test.ts)
- [x] **TASK-002** `TDD`: Escrever testes unitários para posicionamento angular e ancoragem por quadrante
- [x] **TASK-003**: Implementar módulo base `calculateRadialLabelPosition()` em [src/utils/graphLabelLayout.ts](file:///home/rafael/horizon_dashboard_h/src/utils/graphLabelLayout.ts)

### US-2: Prevenção de Colisão AABB
- [x] **TASK-004** `TDD`: Escrever testes unitários para detecção AABB e repulsão anti-colisão mantendo nós focais fixos
- [x] **TASK-005**: Implementar `computeBoundingBox()` e `resolveLabelCollisions()` em [src/utils/graphLabelLayout.ts](file:///home/rafael/horizon_dashboard_h/src/utils/graphLabelLayout.ts)

### US-4: Integração SVG/Canvas & UX
- [x] **TASK-006** `[P]`: Adicionar efeito halo/stroke protetor em [PersonInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro)
- [x] **TASK-007**: Integrar `graphLabelLayout.ts` no SVG do [PersonInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro)
- [x] **TASK-008**: Integrar `graphLabelLayout.ts` no Canvas 2D do [ResearchGroupInteractionGraph.astro](file:///home/rafael/horizon_dashboard_h/src/components/groups/ResearchGroupInteractionGraph.astro)

### Validação
- [x] **TASK-009** `[P]`: Executar suíte de testes (`vitest`, `tsc check`) e benchmark de tempo de execução (<2ms)
- [x] **TASK-010**: Build estático (`npm run build`) e validação visual de UI/UX
