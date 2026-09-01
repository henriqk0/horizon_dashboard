# Especificação Técnica: Correção de Defeitos dos Grafos de Interação

> **Recurso**: Correção de Defeitos dos Grafos de Interação (Graph Interaction Bugfixes)  
> **Fase SpecKit**: `/speckit.specify`  
> **Constituição**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md)

---

## 1. Objetivo e Visão Geral

Auditoria dos componentes de grafo do Horizon Dashboard identificou quatro defeitos que afetam a
confiabilidade percebida dos dados e a usabilidade da navegação. Nenhum deles quebra o build ou a
suíte de testes atual — todos degradam silenciosamente a experiência, o que os torna especialmente
perigosos num painel cujo produto final é *confiança em números*.

Esta especificação cobre a correção dos quatro defeitos, preservando o comportamento estático
(server-rendered) dos grafos e sem introduzir bibliotecas externas de visualização.

---

## 2. Defeitos Identificados

### BUG-001 — Os filtros do grafo não filtram a tabela (severidade: alta)

**Local**: [PersonInteractionGraph.astro:820-823](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro)
× [PersonInteractionTable.astro](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionTable.astro)

O script de filtros consulta os seletores `[data-table-row="true"]`, `[data-table-no-results="true"]`
e `[data-table-count-label="true"]`. O componente de tabela **não emite nenhum atributo `data-*`**,
portanto o `NodeList` é sempre vazio e os dois `querySelector` retornam `null`.

**Sintoma**: ao ativar um filtro de vínculo, o grafo, os KPIs e os cards laterais reagem, mas a
tabela abaixo continua exibindo todas as linhas e o rótulo continua informando a contagem original.
O usuário lê "3 conexões diretas" no KPI e 47 linhas na tabela, no mesmo recorte.

**Escopo afetado**: páginas `/researchers/[id]` e `/students/[id]`.

### BUG-002 — Pan/zoom do SVG mistura pixels de tela com unidades do viewBox (severidade: alta)

**Local**: [PersonInteractionGraph.astro:723,746,764](file:///home/rafael/horizon_dashboard_h/src/components/researchers/PersonInteractionGraph.astro)

As coordenadas de ponteiro são lidas em pixels CSS (`event.clientX`, `getBoundingClientRect()`) e
aplicadas como `transform: translate(Xpx, Ypx)` num `<g>` **interno ao SVG**, onde a unidade `px`
é interpretada no sistema de coordenadas local (unidades do `viewBox`), não em pixels de tela.

Verificação empírica isolada (viewBox de 1000 renderizado a 200px de largura): `translate(100px)`
deslocou o elemento **20px** na tela.

No componente, o `viewBox` varia de 960 (poucas conexões) a ~1628 (120 vizinhos), contra uma coluna
renderizada de aproximadamente 600–900px.

**Sintomas**:
1. O arrasto acompanha o cursor a ~0,4–0,6× da velocidade — o grafo "escorrega" para trás do mouse.
2. O zoom com a roda não ancora no cursor: a fórmula de ancoragem mistura as duas unidades e o
   conteúdo deriva lateralmente conforme se amplia.

### BUG-003 — Métricas ausentes renderizadas como zeros confiáveis (severidade: média)

**Local**: [people-network.ts:294,309](file:///home/rafael/horizon_dashboard_h/src/lib/people-network.ts)
e [PeopleNetworkOverview.astro](file:///home/rafael/horizon_dashboard_h/src/components/home/PeopleNetworkOverview.astro)

`buildGraphSummary` coage campos ausentes com `Number(stats.x ?? 0)`, enquanto as métricas de rede
complexa usam `?? null`. Dado **ausente** vira, portanto, um zero com aparência de medição.

Os exports atuais do ETL confirmam o cenário. Em `people_collaboration_graph.json` faltam
`isolated_nodes`, `largest_component_size`, `classification_distribution` e
`top_people_by_weighted_degree`; em ambos os arquivos faltam `top_hubs_by_degree_centrality` e
`complex_network_metrics`.

**Sintomas**:
1. "Maior componente: 0,0%" exibido como se fosse uma medição, ao lado de campos igualmente
   ausentes que corretamente exibem "N/A".
2. As listas "Top 10 pesquisadores colaboradores" e "Hubs e conectores" renderizam título e
   descrição seguidos de nada — não há estado vazio.

> [!NOTE]
> `PeopleNetworkOverview.astro` e `buildPeopleNetworkOverview` não são importados por nenhuma
> página hoje (apenas pela suíte de testes). A correção mantém o módulo, tornando-o robusto para
> quando for religado. A decisão de remover ou reconectar o componente fica fora deste escopo.

### BUG-004 — Defeitos menores de ciclo de vida de interação (severidade: baixa)

1. **`pointercancel` sem tratamento** no grafo de grupo
   ([ResearchGroupInteractionGraph.astro:1796](file:///home/rafael/horizon_dashboard_h/src/components/groups/ResearchGroupInteractionGraph.astro)):
   se o ponteiro for cancelado durante o arrasto, `dragState.active` permanece `true` e o grafo
   passa a panoramizar seguindo o mouse sem botão pressionado.
2. **`resizeCanvas` descarta o enquadramento do usuário**
   ([:1700](file:///home/rafael/horizon_dashboard_h/src/components/groups/ResearchGroupInteractionGraph.astro)):
   qualquer disparo do `ResizeObserver` chama `applyFilters({ refit: true })`, anulando o zoom e o
   pan ajustados manualmente.
3. **`GraphLegend` registra listeners três vezes**
   ([GraphLegend.astro](file:///home/rafael/horizon_dashboard_h/src/components/graphs/GraphLegend.astro)):
   `initLegend()` roda imediatamente, no `DOMContentLoaded` e no `astro:page-load`, sem a flag de
   inicialização usada pelos outros scripts do projeto.

---

## 3. Atores e User Stories

**Atores**: Pesquisador (analisa a própria rede), Gestor (lê KPIs institucionais), Estudante
(descobre orientadores e grupos).

### US-1 — Filtro coerente entre grafo e tabela
> **Como** pesquisador analisando meu grafo de relacionamento,  
> **quero** que a tabela de vínculos respeite os filtros de tipo que eu ativei,  
> **para** que a leitura tabular corresponda exatamente ao que o grafo está mostrando.

**Critérios de aceitação**
- AC-1.1: Com um filtro ativo, apenas as linhas cujos tipos de relação incluem ao menos um tipo
  selecionado permanecem visíveis.
- AC-1.2: O rótulo de contagem acima da tabela reflete o número de linhas visíveis e a expressão
  "com os filtros selecionados".
- AC-1.3: Ao desativar todos os filtros, tabela e rótulo retornam integralmente ao estado original.
- AC-1.4: Quando nenhum vínculo corresponde ao filtro, uma mensagem de estado vazio é exibida no
  lugar das linhas.

### US-2 — Navegação previsível no grafo ego-centrado
> **Como** usuário explorando um grafo denso,  
> **quero** que o grafo acompanhe exatamente o meu cursor ao arrastar e amplie sob o ponteiro,  
> **para** conseguir inspecionar regiões específicas sem perder a referência visual.

**Critérios de aceitação**
- AC-2.1: O deslocamento do conteúdo na tela é igual ao deslocamento do ponteiro (1:1), qualquer
  que seja o tamanho do `viewBox`.
- AC-2.2: O ponto do grafo sob o cursor permanece sob o cursor durante o zoom com a roda.
- AC-2.3: A escala continua limitada ao intervalo `[0.2, 5]` e o botão de reset restaura o
  enquadramento inicial.
- AC-2.4: A conversão de unidades é reavaliada quando o contêiner muda de largura.

### US-3 — Honestidade nas métricas de rede
> **Como** gestor lendo o painel institucional,  
> **quero** distinguir "métrica ausente no export" de "métrica igual a zero",  
> **para** não tomar decisão sobre um número que não foi medido.

**Critérios de aceitação**
- AC-3.1: Campos ausentes em `graph_stats` produzem `null` no view model, não `0`.
- AC-3.2: A interface exibe "N/A" para métricas nulas, com o mesmo tratamento já aplicado às
  métricas de rede complexa.
- AC-3.3: Listas de ranking vazias exibem mensagem de estado vazio explicando a ausência no export.
- AC-3.4: Exports completos continuam produzindo exatamente os mesmos valores de hoje.

### US-4 — Interação resiliente
> **Como** usuário em dispositivo touch ou com a janela sendo redimensionada,  
> **quero** que o grafo não entre em estado inconsistente,  
> **para** manter o controle da visualização.

**Critérios de aceitação**
- AC-4.1: `pointercancel` encerra o arrasto e libera a captura do ponteiro.
- AC-4.2: O redimensionamento preserva o enquadramento após a primeira interação manual do usuário.
- AC-4.3: A legenda registra seus listeners uma única vez por elemento.

---

## 4. Fora de Escopo

- Remover ou reconectar `PeopleNetworkOverview.astro` ao fluxo de páginas.
- Corrigir a ausência dos campos no export do ETL (`henriqk0/horizon_etl`) — o dashboard apenas
  passa a lidar com a ausência corretamente.
- Harmonizar as divergências de cor entre SVG e Canvas (coberto por `specs/graph-color-legend`).
- Adicionar `namedItems` para vínculos do tipo `article`.
