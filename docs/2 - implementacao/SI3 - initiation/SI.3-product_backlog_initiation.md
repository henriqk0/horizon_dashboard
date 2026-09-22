# Product Backlog – Horizon Dashboard
**Última atualização:** 30/03/2026
**Responsável (PO):** Antigravity (Senior Lead)
**Versão do Documento:** 1.1

---

# 1. Visão Geral
Este Backlog foca na **Visualização e Acessibilidade** dos dados acadêmicos consumidos de arquivos JSON canônicos.

---

# 2. Epics & User Stories

## Epic 1: Portal de Grupos de Pesquisa (Release 1)
**Objetivo**: Permitir a descoberta e detalhamento dos grupos de pesquisa da instituição.

### US-001 – Listagem e Busca de Grupos
```yaml
id: US-001
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-01, RF-14]
tags: [type:feature, area:frontend, component:search]
```

#### Descrição
Implementar a página inicial com listagem de grupos em Grid/Cards e funcionalidade de busca/filtro em tempo real.

#### Critérios de Aceitação
- **Funcional**:
    - [x] Visualização em Cards com Nome, Líder, Área e Campus.
    - [x] Busca textual por Nome do Grupo ou Líder.
    - [x] Filtros por Campus e Área do Conhecimento.
- **UI/UX**:
    - [x] Design responsivo (Mobile/Desktop).
    - [x] Feedback visual de carregamento (Skeleton) ou lista vazia.

### US-002 – Detalhes do Grupo
```yaml
id: US-002
milestone: R1
prioridade: Alta
tamanho: 8
origem: [RF-07, RF-09]
tags: [type:feature, area:frontend, component:details]
```

#### Descrição
Página detalhada do grupo exibindo metadados completos, lista de membros, linhas de pesquisa e contatos.

#### Critérios de Aceitação
- **Funcional**:
    - [x] Exibição do Nome, Sigla, Link CNPq e Descrição.
    - [x] Lista de Membros com fotos e link para Lattes.
    - [x] Breadcrumbs para navegação hierárquica.
- **Tech**:
    - [x] Rota dinâmica `/groups/[id]`.
    - [x] Build estático (SSG) para performance.

---

## Epic 2: Perfis de Pesquisadores (Release 2)
**Objetivo**: Dar visibilidade à produção individual dos pesquisadores.

### US-003 – Página de Perfil do Pesquisador
```yaml
id: US-003
milestone: R2
prioridade: Alta
tamanho: 8
origem: [RF-02]
tags: [type:feature, area:frontend]
```

#### Descrição
Página individual do pesquisador exibindo informações detalhadas extraídas do arquivo canônico (`researchers_canonical.json`), incluindo iniciativas, grupos de pesquisa e áreas de conhecimento.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Dados Pessoais: Nome, Email (ofuscado/link), Links (Lattes, Google Scholar).
    - [ ] Listagem de **Initiatives** (Projetos) vinculados com Role e Status.
    - [ ] Listagem de **Research Groups** vinculados.
    - [ ] Listagem de **Knowledge Areas** vinculadas.
- **UI/UX**:
    - [ ] Design limpo e organizado em seções.
    - [ ] Links para as páginas de detalhes de Grupos e Projetos.

### US-034 – Listagem de Pesquisadores
```yaml
id: US-034
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-30]
tags: [type:feature, area:frontend, component:list]
```

#### Descrição
Página dedicada para listar todos os pesquisadores disponíveis no sistema, com capacidade de busca para facilitar a localização.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Listagem paginada ou infinita (virtualizada se muitos itens) de pesquisadores.
    - [ ] Cards contendo: Nome, e-mail (opcional), e principais áreas de conhecimento (se couber).
    - [ ] Busca textual por Nome.
- **UI/UX**:
    - [ ] Grid responsivo de cards.
    - [ ] Feedback visual para "Nenhum pesquisador encontrado".

- [ ] Feedback visual para "Nenhum pesquisador encontrado".

### US-035 – Dashboard Analytics de Pesquisadores
```yaml
id: US-035
milestone: R1
prioridade: Média
tamanho: 8
origem: [RF-32, RF-33, RF-34, RF-35, RF-36]
tags: [type:feature, area:frontend, component:charts]
```

#### Descrição
Implementar uma seção de indicadores na página de listagem de pesquisadores (`/researchers`), fornecendo uma visão macro da distribuição de competências e engajamento da equipe.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] **Chart 1 (Requisitado)**: Barra horizontal - Pesquisadores por Área de Conhecimento (Top 10).
    - [ ] **Chart 2 (Requisitado)**: Barra vertical/Lista - Top 10 Linhas de Pesquisa por Qtd de Pesquisadores.
    - [ ] **Metric 3 (Sugerida)**: Gráfico de Donut - Distribuição de Papéis (Coordenador vs Pesquisador).
    - [ ] **Metric 4 (Sugerida)**: Histograma - Pesquisadores por Qtd de Projetos Ativos (Engajamento).
    - [ ] **Metric 5 (Sugerida)**: Ranking - Top 5 Grupos com mais pesquisadores.
- **UI/UX**:
    - [ ] Componentes gráficos consistentes com o tema (ECharts ou similar via Astro).
    - [ ] Responsividade para mobile (stacking dos gráficos).

---

## Epic 3: Transparência Financeira (Release 3)
**Objetivo**: Visualização dos recursos captados e executados.

### US-004 – Dashboard de Fomento
```yaml
id: US-004
milestone: R3
prioridade: Média
tamanho: 13
origem: [RF-04]
tags: [type:feature, area:frontend, component:charts]
```

#### Descrição
Gráficos e tabelas exibindo a distribuição de bolsas e recursos de projetos por Campus e Área.

#### Critérios de Aceitação
- [ ] Gráfico de Barras: Recursos por Área.
- [ ] Gráfico de Pizza: Tipos de Bolsa.
- [ ] Filtros temporais (Ano a Ano).

---

## Epic 4: Métricas de Impacto (Release 4)

### US-005 – Visualização de Impacto Científico
```yaml
id: US-005
milestone: R4
prioridade: Baixa
tamanho: 5
origem: [RF-05]
tags: [type:feature, area:frontend]
```

#### Descrição
Exibir métricas consolidadas (Índice H, Citações totais) integradas aos cards de grupos e perfis.

---

# 3. Backlog Refinado (R1 - Entregue)

| ID | Título | Status | PR/Commit | Issue |
|----|--------|--------|-----------|-------|
| **US-001** | Listagem de Grupos | **Done** | v1.0.0 | - |
| **US-002** | Detalhes do Grupo | **Done** | v1.0.0 | - |
| **Fix** | Remoção de Avatares (Listagem) | **Done** | v1.0.3 | [#6](https://github.com/ifesserra-lab/horizon_dashboard/issues/6) |
| **Task** | Dados Reais & KPIs | **Done** | v1.0.4 | - |
| **US-006** | Dashboard de Áreas de Conhecimento | **Done** | v1.0.6 | [#21](https://github.com/ifesserra-lab/horizon_dashboard/issues/21) |
| **US-011** | Top 10 Research Lines (Home) | **Done** | v1.0.6 | [#24](https://github.com/ifesserra-lab/horizon_dashboard/issues/24) |
| **US-012** | Top 10 Research Lines (Areas) | **Done** | v1.0.6 | [#22](https://github.com/ifesserra-lab/horizon_dashboard/issues/22) |
| **US-015** | Separação de Membros | **Done** | v1.0.10 | [#35](https://github.com/ifesserra-lab/horizon_dashboard/issues/35) |
| **US-015** | Separação de Membros | **Done** | v1.0.10 | [#35](https://github.com/ifesserra-lab/horizon_dashboard/issues/35) |
| **US-030** | Painel de Acessibilidade Completo | **Done** | v1.3.0 | [#56](https://github.com/ifesserra-lab/horizon_dashboard/issues/56) |
| **US-036** | Catálogo e Dashboard de Orientações | **Done** | v1.3.2 | [#51](https://github.com/ifesserra-lab/horizon_dashboard/pull/51) |
| **US-042** | Segmentação de Gráfico de Orientações por Tipo | **Done** | v2.1.0 | [#75](https://github.com/ifesserra-lab/horizon_dashboard/issues/75) |
| **US-043** | Busca e Scroll nos Projetos | **Done** | v2.1.0 | [#77](https://github.com/ifesserra-lab/horizon_dashboard/issues/77) |
| **US-044** | Linha do Tempo e Refinamentos do Perfil | **Done** | v2.2.0 | [#79](https://github.com/ifesserra-lab/horizon_dashboard/issues/79) |
| **Refinement** | Filtro global de campus por ID canônico e publicações por campus canônico | **Done** | 2026-03-30 | [#91](https://github.com/ifesserra-lab/horizon_dashboard/issues/91) |
### US-006 – Dashboard de Áreas de Conhecimento
**GitHub Issue**: [#21](https://github.com/ifesserra-lab/horizon_dashboard/issues/21)

```yaml
id: US-006
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-18, RF-14]
tags: [type:feature, area:frontend, component:dashboard]
```

#### Descrição
Implementar uma página dedicada para visualizar a distribuição dos grupos de pesquisa por áreas acadêmicas.

#### Critérios de Aceitação
- **Funcional**:
    - [x] Dashboad Summary com KPIs (Grupos, Pesquisadores, Campi).
    - [x] Listagem de áreas com grupos e campi vinculados.
    - [ ] Busca em tempo real por nome da área ou grupos.
- **UI/UX**:
    - [x] Design responsivo.
    - [x] Estilo premium seguindo o padrão da plataforma.

### US-011 – Top 10 Linhas de Pesquisa (Dashboard Home)
**GitHub Issue**: [#24](https://github.com/ifesserra-lab/horizon_dashboard/issues/24)

```yaml
id: US-011
milestone: R1
prioridade: Alta
tamanho: 3
origem: [RF-19]
tags: [type:feature, area:frontend, component:charts]
```

#### Descrição
Substituir a card de "Distribuição por Área" na home pelo "Top 10 Linhas de Pesquisa", filtrando áreas genéricas para mostrar temas específicos.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Cálculo dinâmico das 10 linhas mais frequentes.
    - [ ] Filtro automático de áreas genéricas (ex: 'Educação', 'Interdisciplinar').
- **UI/UX**:
    - [ ] Rótulos atualizados para "Linha de Pesquisa".
    - [ ] Tooltip/Texto explicativo se necessário.

### US-012 – Top 10 Linhas de Pesquisa (Página de Áreas)
**GitHub Issue**: [#22](https://github.com/ifesserra-lab/horizon_dashboard/issues/22)

```yaml
id: US-012
milestone: R1
prioridade: Média
tamanho: 3
origem: [RF-19]
tags: [type:feature, area:frontend]
```

#### Descrição
Adicionar um card de visualização do "Top 10 Linhas de Pesquisa" na página de Áreas de Conhecimento, similar ao da home, para fornecer contexto imediato sobre os temas mais fortes.


### US-013 – Separação de Membros por Função (Detalhes do Grupo)
```yaml
id: US-013
milestone: R1
prioridade: Alta
tamanho: 3
origem: [RF-22]
tags: [type:feature, area:frontend, component:details]
```

#### Descrição
Refatorar a seção de membros na página de detalhes do grupo (`src/pages/groups/[id].astro`) para exibir pesquisadores e estudantes em seções distintas, melhorando a organização visual e hierarquia.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Separar membros em seções: "Pesquisadores", "Estudantes" e "Técnicos" (se houver).
    - [ ] Manter os Líderes destacados ou incluídos na seção de Pesquisadores (conforme regra de negócio, geralmente líderes são pesquisadores).
- **UI/UX**:
    - [ ] Títulos de seção claros para cada grupo.
    - [ ] Manter o design dos cards de membros existente.


### US-014 – Identificação de Egressos (Detalhes do Grupo)
**GitHub Issue**: [#35](https://github.com/ifesserra-lab/horizon_dashboard/issues/35) (Implemented as US-015)

```yaml
id: US-014
milestone: R1
prioridade: Média
tamanho: 3
origem: [RF-23]
tags: [type:feature, area:frontend, component:details]
```

#### Descrição
Como usuário, quero identificar facilmente quais membros são egressos (ex-membros) na lista do grupo de pesquisa, para entender o histórico de participação.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Identificar membros com `end_date` preenchido como Egressos.
    - [ ] Adicionar um badge visual ou indicador "Egresso" no card do membro.
    - [ ] Aplicar estilo visual distinto (ex: tons de cinza ou opacidade reduzida) para diferenciar de membros ativos.
- **UI/UX**:
    - [ ] Badge "Egresso" visível.
    - [ ] Tooltip (opcional) indicando período de participação se disponível.


---

# 2. Epics & User Stories
### UI Consistency: Padronização de Ícones
**Descrição**: Padronizar o ícone de "Áreas de Conhecimento" no menu lateral para corresponder ao ícone utilizado no Dashboard.
**Critérios de Aceitação**:
- Ícone do menu lateral idêntico ao do card "Áreas de Conhecimento" da home.
- RF Relacionado: RF-21.

### US-032 – Exibir Grupo de Pesquisa no Projeto
**GitHub Issue**: TBD
```yaml
id: US-032
milestone: R1
prioridade: Média
tamanho: 2
origem: [User Request]
tags: [type:feature, area:frontend, component:projects]
```

#### Descrição
Adicionar o nome do Grupo de Pesquisa na seção "Informações Adicionais" da página de detalhes do projeto, para que o usuário saiba a qual grupo a iniciativa está vinculada.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Exibir campo "Grupo de Pesquisa" na seção "Informações Adicionais".
    - [ ] Mostrar o nome do grupo se disponível.
    - [ ] Ocultar o campo se o projeto não tiver grupo vinculado.
- **UI/UX**:
    - [ ] Seguir o mesmo estilo de "Status" e "Tipo".

### US-033 – Listar Projetos no Grupo de Pesquisa
**GitHub Issue**: [#62](https://github.com/ifesserra-lab/horizon_dashboard/issues/62)
```yaml
id: US-033
milestone: R1
prioridade: Média
tamanho: 3
origem: [User Request]
tags: [type:feature, area:frontend, component:groups]
```

#### Descrição
Listar todos os projetos vinculados a um grupo de pesquisa na página de detalhes do grupo (`/groups/[id]`), para que os usuários possam ver as iniciativas em andamento de cada grupo.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Criar nova seção "Projetos" na página de detalhes do grupo.
    - [ ] Listar projetos onde `research_group.id` corresponde ao ID do grupo visitado.
    - [ ] Exibir cards resumidos dos projetos (Título, Status, Datas).
    - [ ] Linkar cards para detalhes do projeto (`/projects/[id]`).
- **UI/UX**:
    - [ ] Manter consistência visual com os cards de membros.
    - [ ] Se não houver projetos, exibir mensagem informativa ou ocultar a seção.



### US-036 – Catálogo e Dashboard de Orientações
```yaml
id: US-036
milestone: R1
prioridade: Alta
tamanho: 8
origem: [User Request]
tags: [type:feature, area:frontend, component:advisorships]
```

#### Descrição
Implementar uma página dedicada para visualizar e explorar as orientações (advisorships) da instituição, incluindo KPIs, gráficos analíticos e um catálogo buscável de estudantes e orientadores.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] KPIs: Total de Orientações, Bolsas Ativas, Valor Total Investido.
    - [ ] Gráficos: Orientações por Orientador (Top 10), Distribuição por Tipo de Bolsa (Fellowship).
    - [ ] Listagem em Cards contendo: Nome do Estudante, Orientador, Projeto Vinculado e Detalhes da Bolsa.
    - [ ] Busca em tempo real por estudante, orientador ou projeto.
- **UI/UX**:
    - [ ] Seguir o padrão visual da página de Projetos (`/projects`).
    - [ ] Design responsivo e acessível (WCAG).

### US-037 – Gráfico de Investimento em Bolsas
```yaml
id: US-037
milestone: R1
prioridade: Alta
tamanho: 5
origem: [User Request, RF-38]
tags: [type:feature, area:frontend, component:chart]
```

#### Descrição
Como gestor, quero visualizar a evolução do investimento financeiro em bolsas de pesquisa ao longo dos anos, para acompanhar o volume de recursos aplicados.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Calcular o valor total investido por ano (Soma de `valor da bolsa * meses ativos no ano`).
    - [ ] Exibir gráfico de Linha ou Área com a evolução temporal.
    - [ ] Formatar valores em Reais (R$).
- **UI/UX**:
    - [ ] Nova aba "Investimento" no componente de gráficos de orientações.
    - [ ] Tooltip com valor exato ao passar o mouse.




### US-038 – Gráfico de Projetos por Ano (Perfil)
```yaml
id: US-038
milestone: R1
prioridade: Média
tamanho: 3
origim: [RF-43]
tags: [type:feature, area:frontend, component:chart]
```

#### Descrição
Exibir um gráfico de barras na seção de Iniciativas do pesquisador mostrando a quantidade de projetos ativos/concluídos distribuídos por ano.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Agrupar projetos por ano (baseado em `start_date` ou `end_date`).
    - [ ] Preencher anos vazios para continuidade.
- **UI/UX**:
    - [ ] Componente visual consistente com o gráfico de publicações.
    - [ ] Tooltip com quantidade exata.

### US-039 – Gráfico de Orientações por Ano (Perfil)
```yaml
id: US-039
milestone: R1
prioridade: Média
tamanho: 3
origim: [RF-44]
tags: [type:feature, area:frontend, component:chart]
```

#### Descrição
Exibir um gráfico de barras na seção de Orientações do pesquisador mostrando a quantidade de orientações em andamento/concluídas por ano.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Agrupar orientações por ano de início (`start_date`).
    - [ ] Preencher anos vazios para continuidade.
- **UI/UX**:
    - [ ] Componente visual consistente com o gráfico de publicações.

### US-042 – Segmentação de Gráfico de Orientações por Tipo
**GitHub Issue**: [#75](https://github.com/ifesserra-lab/horizon_dashboard/issues/75)

```yaml
id: US-042
milestone: R2
prioridade: Alta
tamanho: 3
origem: [RF-46]
tags: [type:feature, area:frontend, component:chart]
```

#### Descrição
Separar o gráfico de orientações por tipo (Mestrado, Iniciação Científica, etc.) no detalhe do pesquisador, permitindo visualizar a distribuição anual.

#### Critérios de Aceitação
- **Funcional**:
    - [x] Implementar gráfico de barras empilhadas (stacked) por ano e tipo.
    - [x] Agrupar tipos "None" como "Outros".
- **UI/UX**:
    - [x] Adicionar legenda de cores por tipo.
    - [x] Tooltip detalhado por segmento.


### US-040 – KPIs do Pesquisador (Totalizadores)
```yaml
id: US-040
milestone: R1
prioridade: Alta
tamanho: 2
origim: [RF-45]
tags: [type:feature, area:frontend, component:kpi]
```

#### Descrição
Exibir badges ou cards contendo os totalizadores de Artigos, Orientações e Projetos no topo do perfil do pesquisador, para fornecer uma visão rápida da produtividade.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Calcular total de Artigos.
    - [ ] Calcular total de Projetos (Iniciativas).
    - [ ] Calcular total de Orientações.
- **UI/UX**:
    - [ ] Ícones distintos para cada métrica.
    - [ ] Layout responsivo (Stack no mobile).


## Epic 1: Extração SigPesq (Release 1)
**Objetivo**: Coletar dados de projetos da base SigPesq.

### US-001 – Extração de Projetos SigPesq
```yaml
id: US-001
milestone: R1
prioridade: Alta
tamanho: 8
origem: [RF-01, RNF-01, RNF-04, RNF-06]
tags: [type:feature, area:backend, source:sigpesq]
dependencias: []
modulos_afetados: [src/adapters/sources/sigpesq, src/flows]
```

#### Descrição
Implementar a visualização de extração para o Dashboard. O sistema deve conectar e exibir dados de **Projetos**, **Grupos de Pesquisa** e **Pesquisadores**, consumindo os arquivos JSON.

#### Critérios de Aceitação (Definition of Done)
- **Funcional**:
    - [ ] Dados de **Projetos** extraídos (Título, Data, Status).
    - [ ] Dados de **Grupos de Pesquisa** extraídos (Líder, Área, certificado).
    - [ ] Dados de **Bolsistas** extraídos (Nome, Modalidade de bolsa, Vigência).
    - [ ] Mapeamento correto utilizando entidades da lib **`research_domain_lib`** (`Project`, `ResearchGroup`, `Researcher`).
- **Teste (TDD)**:
    - [ ] Teste Unitário: Parser de HTML/JSON do SigPesq com mocks.
    - [ ] Teste Integração: Gravação via `ResearchDomainLib` (ou suas abstrações).
    - [ ] Cobertura > 80% no módulo `adapters/sources/sigpesq`.
- **Deploy**:
    - [ ] Flow `ingest_sigpesq` registrado no Prefect.
    - [ ] Execução bem-sucedida em ambiente de Staging.
- **Observabilidade**:
    - [ ] Logs de "Início", "Extração (Qtd)", "Carga" e "Fim".

#### Tasks Sugeridas
1.  **T-001 [Dev]**: Implementar `SigPesqClient` (Source Adapter).
    - *Critério*: Passar testes unitários com HTML mockado.
2.  **T-002 [Dev]**: Implementar `SigPesqMapper` (Raw -> Domain).
    - *Critério*: Transformação valida tipos Pydantic.
3.  **T-003 [Ops]**: Criar Flow Prefect e Dockerfile.
    - *Critério*: Container sobe e flow registra no server.

---

## Epic 2: Extração Lattes (Release 2)
**Objetivo**: Enriquecer dados de pesquisadores (Currículo, Produção).

### US-002 – Extração de Currículo Lattes (XML/Zip)
```yaml
id: US-002
milestone: R2
prioridade: Alta
tamanho: 13
origem: [RF-02, RF-06, RNF-01]
tags: [type:feature, area:backend, source:lattes]
dependencias: [US-001]
modulos_afetados: [src/adapters/sources/lattes, src/core/logic]
```

#### Descrição
Processar arquivos XML de currículos Lattes para extrair dados pessoais e produções bibliográficas. Deve lidar com desduplicação de autores (`RF-06`).

#### Critérios de Aceitação (Definition of Done)
- **Funcional**:
    - [ ] XML parseado corretamente para Objetos de Domínio (`Researcher`, `Publication`).
    - [ ] Identificação única por ID Lattes (16 dígitos).
- **Teste (TDD)**:
    - [ ] Teste Unitário: Parser XML com massa de dados de exemplo.
    - [ ] Teste de Lógica: Algoritmo de normalização de nomes.
- **Deploy**:
    - [ ] Flow `ingest_lattes` capaz de processar lote de zips.
    - [ ] Infraestrutura de disco/volume montada para leitura de arquivos.

#### Tasks Sugeridas
1.  **T-004 [Dev]**: Criar `LattesXMLParser`.
    - *Critério*: Extrair nome, resumo e lista de artigos.
2.  **T-005 [Dev]**: Implementar Lógica de `Merge/Deduplication`.
    - *Critério*: Teste com 2 XMLs do mesmo autor (versões diferentes) resulta em 1 registro atualizado.

---

## Epic 3: Dados de Execução FAPES (Release 3)
**Objetivo**: Monitorar execução financeira e bolsas.

### US-003 – Dados Financeiros e Bolsas
```yaml
id: US-003
milestone: R3
prioridade: Média
tamanho: 8
origem: [RF-04]
tags: [type:feature, area:backend, source:fapes]
dependencias: []
```

#### Descrição
Extrair dados do Portal da Transparência/Dados Abertos sobre repasses da FAPES.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Extração de valores (R$) e beneficiários.
    - [ ] Vínculo com Projetos existentes (se houver chave comum).
- **Teste**:
    - [ ] Teste de parsing de CSV/API Fapes.
- **Deploy**:
    - [ ] Flow agendado (Cron) para rodar mensalmente.

---

### US-006 – Integração API FAPES (Projetos e Bolsas)
```yaml
id: US-006
milestone: R3
prioridade: Alta
tamanho: 8
origem: [RF-04]
tags: [type:feature, area:backend, source:fapes]
dependencias: []
modulos_afetados: [src/adapters/sources/fapes, src/flows]
```

#### Descrição
Desenvolver a integração com a **API da FAPES** para extrair dados estruturados de:
1.  **Projetos** (Títulos, vigência, valores).
2.  **Bolsistas** (Beneficiários de bolsas).
3.  **Pagamentos** (Execução financeira).

#### Critérios de Aceitação (Definition of Done)
- **Funcional**:
    - [ ] Conexão autenticada/segura com API FAPES.
    - [ ] Extração de dados de **Projetos** mapeados para o Domínio.
    - [ ] Extração de dados de **Bolsistas** mapeados para o Domínio.
    - [ ] Extração de dados de **Pagamentos** financeiros.
- **Teste (TDD)**:
    - [ ] Teste Unitário: Client HTTP com Mock da API FAPES.
    - [ ] Teste de Contrato: Validação do Schema JSON retornado.
- **Deploy**:   
    - [ ] Flow `ingest_fapes_api` agendado.
- **Observabilidade**:
    - [ ] Logs detalhando: "Projetos Encontrados"  , "Novos Baixados", "Falha na Extração".

#### Tasks Sugeridas
1.  **T-006 [Dev]**: Criar `FapesSiteScraper` para listar e baixar PDFs.
    - *Critério*: Salvar arquivos com nomenclatura padronizada.
2.  **T-007 [Dev]**: Implementar `EditalPDFParser` com Docling.
    - *Critério*: Converter PDF para Markdown com layout preservado.
3.  **T-008 [Dev]**: Implementar `EditalMatcher` (Regex/NLP).
    - *Critério*: Extrair Tabela de Cronograma e Parágrafo de Objetivo.
4.  **T-009 [Ops]**: Criar Flow Prefect com Persistência.

---

## Epic 4: Metadados Google Scholar (Release 4)
**Objetivo**: Métricas de impacto.

### US-004 – Metadados e Citações
```yaml
id: US-004
milestone: R4
prioridade: Baixa
tamanho: 5
origem: [RF-05]
tags: [type:feature, source:scholar]
```

#### Descrição
Busca de perfil e métricas (H-Index) via Scraper.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] H-Index atualizado para pesquisador.
- **Teste**:
    - [ ] Mock severo do Scholar para evitar banimento em CI.
- **Deploy**:
    - [ ] Uso de Proxies configurados no Deploy (Env Vars).

---

## Cross-Cutting (Arquitetura)

### US-005 – Observabilidade e Idempotência
```yaml
id: US-005
milestone: R1
prioridade: Crítica
tamanho: 5
origem: [RNF-01, RNF-06]
tags: [type:arch, area:core]

## Epic 5: Ingestão de Grupos de Pesquisa (Excel) (Release 1)
**Objetivo**: Processar planilhas extraídas do SigPesq e popular o domínio de Grupos de Pesquisa.

### US-007 – Carga de Grupos de Pesquisa (Excel -> DB)
```yaml
id: US-007
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-01]
tags: [type:feature, area:backend, source:sigpesq]
dependencias: [US-001]
modulos_afetados: [src/flows, src/core/logic]
```

#### Descrição
Ler o arquivo Excel de Grupos de Pesquisa (processado na US-001/Extração) e persistir utilizando os Controllers da `research_domain_lib`. Deve garantir a criação da hierarquia (Universidade -> Campus -> Grupo).

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Leitura do Excel `data/raw/sigpesq/research_group/*.xlsx`.
    - [ ] **Universidade** "IFES" configurada.
    - [ ] **Campus** "Serra" configurado.
    - [ ] **Grupo de Pesquisa** exibido com nome, sigla e vínculos.
- **Teste**:
    - [ ] Teste de Integração com banco (Mock ou Local) validando a criação dos registros.
- **Deploy**:
    - [ ] Flow `ingest_sigpesq_groups` executável via `app.py`.

#### Tasks Sugeridas
1.  **T-010 [Dev]**: Implementar `ResearchGroupExcelLoader`.
    - *Critério*: Ler Excel com Pandas e iterar linhas.
2.  **T-011 [Dev]**: Implementar Lógica de Carga (Service).
    - *Critério*: Usar `UniversityController`, `CampusController`, `ResearchGroupController` para idempotência.


#### Descrição
Implementar Base Repository com Loguru e lógica de `ON CONFLICT DO UPDATE`.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Logs aparecem no Stdout e UI do Prefect.
    - [ ] Inserir registro X duas vezes não cria duplicata.
- **Teste**:
    - [ ] Teste de Repositório (Integration) provando idempotência.
    - [ ] Teste validando formato JSON dos logs.
- **Deploy**:
    - [ ] Variáveis de ambiente de LOG_LEVEL configuráveis.

---

## Epic 6: Atualização de Grupos de Pesquisa CNPq (Release 2)
**Objetivo**: Enriquecer dados dos grupos de pesquisa com informações oficiais do CNPq (DGP).

### US-009 – Atualização de Dados de Grupos via DGP/CNPq
```yaml
id: US-009
milestone: R2
prioridade: Média
tamanho: 8
origem: [RF-09, RNF-01, RNF-02, RNF-06]
tags: [type:feature, area:backend, source:cnpq]
dependencias: [US-007]
modulos_afetados: [src/flows, src/core/logic/strategies]
```

#### Descrição
Desenvolver um novo pipeline que extrai URLs de espelho de grupos do banco de dados, utiliza a lib `dgp_cnpq_lib` para coletar dados atualizados (nome, líderes, linhas de pesquisa) e atualiza os membros do grupo.

#### Critérios de Aceitação (Definition of Done)
- **Funcional**:
    - [ ] Extração de URLs de grupos existentes no DB via `ResearchGroupRepository`.
    - [ ] Uso da `dgp_cnpq_lib` para extrair dados do espelho.
    - [ ] Atualização dos dados do grupo (Líderes, Linhas de Pesquisa) no DB.
    - [ ] Sincronização de membros do grupo (inserção de novos, atualização de participações).
- **Teste (TDD)**:
    - [ ] Teste Unitário: Estratégia de mapeamento dos dados da lib para o domínio `ResearchGroup`.
    - **Tasks**:
        - Create `CnpqCrawlerAdapter` to connect with `dgp_cnpq_lib`.
        - Implement `CnpqSyncLogic` for orchestration.
        - Create Sync Flow.

### US-010: Sincronização de Egressos CNPq
- **Description**: Como gestor, quero que os ex-membros (egressos) dos grupos de pesquisa sejam sincronizados com suas respectivas datas de saída, para manter o histórico fiel da participação.
- **Acceptance Criteria**:
    - Extrair lista de egressos do CNPq.
    - Identificar pesquisadores/estudantes já existentes ou criar novos.
    - Atualizar a associação no grupo (TeamMember) preservando a `start_date` e preenchendo a `end_date`.
    - Garantir que egressos não sejam reativados como membros ativos incorretamente.
- **Priority**: High
- **Tasks**:
    - Atualizar `CnpqCrawlerAdapter` para extrair egressos.
    - Atualizar `CnpqSyncLogic` para processar egressos.
- **Deploy**:
    - [ ] Flow `sync_cnpq_groups` registrado e explorável no `app.py`.
- **Observabilidade**:
    - [ ] Log de "Qtd de Grupos Processados", "Sucesso/Erro por URL".

#### Tasks Sugeridas
1.  **T-012 [Dev]**: Implementar `CnpqCrawlerStrategy`.
    - *Critério*: Mapear `dict` retornado pela lib para as entidades do domínio.
2.  **T-013 [Ops]**: Criar Flow Prefect `sync_cnpq_groups`.
    - *Critério*: Flow orquestra: Seleção -> Crawler -> Persistência.

---

# 4. Backlog Refinado (Release 1)

| ID | Título | Milestone | Status |
|----|--------|-----------|--------|
| **US-005** | Observabilidade e Idempotência (Base) | R1 | **Ready** |
| **US-001** | Extração Projetos SigPesq | R1 | **Ready** |
| **US-006** | Extração Editais FAPES (PDF) | R3 | **Ready** |
| **US-011** | Top 10 Research Lines (Home) | R1 | **PR #25** |
| **US-012** | Top 10 Research Lines (Areas) | R1 | **PR #25** |


---

# 5. Definition of Ready (DoR) Check for R1
- [x] US-005 e US-001 possuem arquitetura definida em `SI.3-design.md`.
- [x] Critérios de Teste e Deploy explícitos.
- [x] Origem rastreada para `SI.1`.

---

## Epic 7: Acessibilidade (Release 1 Extension)
**Objetivo**: Garantir que a plataforma seja inclusiva para usuários com necessidades especiais.

### US-019 – Recursos de Acessibilidade (Baixa Visão e Daltonismo)
**GitHub Issue**: [#30](https://github.com/ifesserra-lab/horizon_dashboard/issues/30)

```yaml
id: US-019
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RNF-02]
tags: [type:feature, area:frontend, component:accessibility]
```

#### Descrição
Como um usuário com baixa visão ou daltonismo, quero poder ativar modos de visualização específicos (Alto Contraste / Filtros de Daltonismo) para navegar no site com maior facilidade.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Implementar seletor de Acessibilidade (Alto Contraste e/ou Filtros).
    - [ ] Garantir que as configurações sejam persistidas no `localStorage`.
    - [ ] Aplicar modificações via CSS (variáveis ou filtros) de forma global.
- **UI/UX**:
    - [ ] Localizar o seletor próximo ao `ThemeToggle`.
    - [ ] Respeitar os padrões WCAG 2.1 AA de contraste.

**Implementação atual (widget UserWay)**: os recursos de alto contraste/filtros deste item são
fornecidos pelo widget UserWay (ferramentas de contraste/cor), carregado em todas as páginas via
`USERWAY_ACCOUNT_ID` — ver RF-27 e `specs/accessibility-userway-widget/`.

### US-020 – Recursos para Baixa Visão (Magnificação de Texto)
**GitHub Issue**: [#31](https://github.com/ifesserra-lab/horizon_dashboard/issues/31)

```yaml
id: US-020
milestone: R1
prioridade: Alta
tamanho: 3
origem: [RNF-02]
tags: [type:feature, area:frontend, component:accessibility]
```

#### Descrição
Como um usuário com baixa visão, quero poder aumentar o tamanho da fonte e o espaçamento entre linhas globalmente, para que eu possa ler o conteúdo confortavelmente sem depender apenas do zoom do navegador.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Adicionar opção "Aumentar Texto" ao menu de acessibilidade.
    - [ ] Implementar pelo menos 2 níveis de magnificação (Ex: 125%, 150%).
    - [ ] Persistir a escolha no `localStorage`.
- **UI/UX**:
    - [ ] Garantir que o layout não quebre ao aumentar a fonte (design responsivo).
    - [ ] Prover feedback visual no menu para a opção selecionada.

**Implementação atual (widget UserWay)**: a magnificação de texto / escala de fonte deste item é
fornecida pelas ferramentas de texto do widget UserWay — ver RF-27 e
`specs/accessibility-userway-widget/`.

### US-021 – Auditoria de Qualidade (Lighthouse)
**GitHub Issue**: [#31](https://github.com/ifesserra-lab/horizon_dashboard/issues/31)

```yaml
id: US-021
milestone: R1
prioridade: Média
tamanho: 2
origem: [RNF-07]
tags: [type:task, area:quality, component:audit]
```

#### Descrição
Como um gestor de qualidade, quero realizar uma auditoria Lighthouse em páginas chave para garantir que a performance, acessibilidade e SEO atendam aos padrões institucionais.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Gerar relatório Lighthouse para a Home e listagem de Projetos.
    - [ ] Identificar oportunidades de melhoria (Score < 90).
    - [ ] Documentar os resultados no walkthrough.

**Atualização (widget UserWay)**: a auditoria deve avaliar a integração do widget UserWay + o
`ThemeToggle` de 3 estados (Claro/Escuro/Auto) como solução de acessibilidade — ver RF-27 e
`specs/accessibility-userway-widget/`.

### US-022 – SEO Social (Open Graph Tags)
**GitHub Issue**: [#32](https://github.com/ifesserra-lab/horizon_dashboard/issues/32)

```yaml
id: US-022
milestone: R1
prioridade: Baixa
tamanho: 1
origem: [US-021 Audit]
tags: [type:feature, area:seo, component:meta]
```

#### Descrição
Como um produtor de conteúdo, quero que o portal tenha tags Open Graph para que, ao compartilhar links em redes sociais, o título, a descrição e uma imagem de pré-visualização sejam exibidos corretamente.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Adicionar tags `og:title`, `og:description`, `og:image` e `og:url` ao `Layout.astro`.
    - [ ] Adicionar tags do Twitter (Twitter Cards).
    - [ ] Garantir que o título da página seja usado dinamicamente na tag `og:title`.

### US-023 – Bugfix: Quebra de linha no Dashboard
**GitHub Issue**: [#33](https://github.com/ifesserra-lab/horizon_dashboard/issues/33)

```yaml
id: US-023
milestone: R1
prioridade: Critica
tamanho: 1
origem: [User Feedback]
tags: [type:bugfix, area:ui, component:home]
```

#### Descrição
A frase de boas-vindas no dashboard está sofrendo uma quebra de linha indesejada em resoluções padrão, o que compromete a harmonia visual.

#### Critérios de Aceitação
- [ ] Eliminar a quebra de linha indesejada em resoluções desktop.
- [ ] Manter a responsividade para telas menores.
- [ ] Usar `text-balance` ou ajuste de largura máxima para otimização tipográfica.

### US-030 – Painel de Acessibilidade Completo
**Origem**: Evolução de US-019 e US-020 baseada em design atualizado

```yaml
id: US-030
milestone: R1
prioridade: Alta
tamanho: 8
origem: [RF-27, RF-11, RNF-02]
tags: [type:feature, area:frontend, component:accessibility]
dependencies: [US-019, US-020]
```

#### Descrição
Como usuário com necessidades especiais (baixa visão, daltonismo, sensibilidade a movimento), quero acessar um painel de acessibilidade completo que permita personalizar minha experiência de navegação de forma integrada, para que eu possa consumir o conteúdo do portal de forma confortável e inclusiva.

#### Contexto
Esta user story consolida e estende os recursos de acessibilidade existentes (US-019 e US-020) em um painel unificado que segue o design fornecido na imagem de referência. O painel oferece controle granular sobre tema, contraste, tamanho da fonte e opções avançadas de acessibilidade.

#### Critérios de Aceitação
- **Tema (Seletornde 3 opções)**:
    - [x] Implementar botão "Claro" (Light mode)
    - [x] Implementar botão "Escuro" (Dark mode)
    - [ ] Implementar botão "Auto" (segue preferência do sistema via `prefers-color-scheme`)
    - [ ] Exibir ícones apropriados para cada modo (sol, lua, monitor)
    - [ ] Indicar visualmente o tema ativo com borda/background diferenciado

- **Contraste (3 níveis)**:
    - [x] "Normal" - contraste padrão atual
    - [x] "Alto" - evolução do high-contrast existente
    - [ ] "Máximo" - contraste extremo para WCAG AAA (preto puro #000 / branco puro #FFF)
    - [ ] Remover modo "Escala de Cinza" (não presente no novo design)
    - [ ] Indicar visualmente o nível ativo

- **Tamanho da Fonte (4 níveis)**:
    - [ ] "Pequena" (87.5% - novo)
    - [x] "Normal" (100% - renomear de "Base")
    - [x] "Grande" (125% - renomear de "Lg")
    - [ ] "Extra" (175% - estender de 150%)
    - [ ] Exibir exemplos visuais de tamanho (A, A+, etc.)

- **Opções Adicionais (Toggles)**:
    - [ ] **Reduzir Movimento**:
        - Toggle switch funcional
        - Descrição: "Minimiza animações e transições"
        - Aplicar classe `:root.reduce-motion` que desabilita animações
    - [ ] **Indicadores de Foco**:
        - Toggle switch funcional
        - Descrição: "Destaca elementos focados"
        - Aplicar classe `:root.enhanced-focus` com outline mais visível
    - [ ] **Otimizar para Leitor de Tela**:
        - Toggle switch funcional
        - Descrição: "Melhora compatibilidade com leitores de tela"
        - Aplicar classe `:root.screen-reader-optimized` que otimiza markup

- **Restaurar Padrões**:
    - [ ] Botão "Restaurar Padrões" no final do painel
    - [ ] Ao clicar, resetar todas as configurações para valores default
    - [ ] Fornecer feedback visual (toast ou animação) de reset bem-sucedido

- **Persistência e Performance**:
    - [ ] Todas as configurações persistidas em `localStorage`
    - [ ] Estado carregado antes do primeiro render (evitar FOUC)
    - [ ] Classes aplicadas no `:root` para afeta global

- **UI/UX**:
    - [ ] Painel visualmente idêntico ao design fornecido
    - [ ] Header "Acessibilidade" com botão de fechar (×)
    - [ ] Seções claramente delimitadas com títulos
    - [ ] Botões de toggle com feedback visual claro (ativo/inativo)
    - [ ] Design responsivo (mobile-first)
    - [ ] Acessível via teclado (Tab, Enter, ESC)
    - [ ] Conformidade WCAG 2.1 AA no próprio painel

- **Testes**:
    - [ ] Testes unitários para lógica de toggle e persistência
    - [ ] Testes de integração para carregamento de preferências
    - [ ] Auditoria Lighthouse (Accessibility score \u003e 95)
    - [ ] Teste manual com leitores de tela (NVDA/VoiceOver)

#### Notas Técnicas
- Refatorar completamente `src/components/AccessibilityToggle.astro`
- Atualizar `src/styles/global.css` com novos níveis de contraste e classes
- Atualizar `src/layouts/Layout.astro` inline script para carregar novas preferências
- Manter compatibilidade retroativa com localStorage keys existentes ou migrar


## Epic 5: Portal de Projetos (Release 1 Extension)
**Objetivo**: Centralizar a gestão e visualização dos projetos de pesquisa da instituição.

### US-016 – Catálogo de Projetos de Pesquisa
```yaml
id: US-016
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-25]
tags: [type:feature, area:frontend, component:projects]
```

#### Descrição
Implementar uma página para listagem de todos os projetos de pesquisa (iniciativas) da instituição, permitindo a descoberta de temas e parcerias.

#### Critérios de Aceitação
- **Funcional**:
    - [x] Visualização em Cards com Nome do Projeto, Status, Datas e Vínculos.
    - [x] Busca textual por Nome do Projeto.
    - [x] Filtro por Status (ativo/concluído).
- **UI/UX**:
    - [x] Design responsivo (Mobile/Desktop).
    - [x] Estilo premium com glassmorphism.
    - [x] Badge de Status colorido de acordo com o estado do projeto.

### US-017 – Detalhes do Projeto de Pesquisa
```yaml
id: US-017
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-26]
tags: [type:feature, area:frontend, component:projects]
```

#### Descrição
Página detalhada do projeto exibindo escopo, período de execução e status.

#### Critérios de Aceitação
- [x] Acessível via rota `/projects/[id]`.
- [x] Exibir nome, status (badge colorido), período e descrição.
- [x] Design consistente e responsivo.

### US-018 – Equipe nos Detalhes do Projeto
**GitHub Issue**: [#29](https://github.com/ifesserra-lab/horizon_dashboard/issues/29)

```yaml
id: US-018
milestone: R1
prioridade: Alta
tamanho: 3
origem: [RF-27]
tags: [type:feature, area:frontend, component:projects]
```

#### Descrição
Exibir a lista de pesquisadores e estudantes vinculados ao projeto.

### US-024 – Sincronização de Equipes
**GitHub Issue**: [#34](https://github.com/ifesserra-lab/horizon_dashboard/issues/34)

```yaml
id: US-024
milestone: R1
prioridade: Crítica
tamanho: 5
origem: [Bugfix]
tags: [type:fix, area:backend, component:projects]
```

### US-025 – Dashboard de Projetos (Busca)
```yaml
id: US-025
milestone: R1
prioridade: Alta
tamanho: 3
origem: [RF-28]
tags: [type:feature, area:frontend, component:projects]
```

### US-026 – Dashboard de Projetos (Indicadores)
```yaml
id: US-026
milestone: R1
prioridade: Alta
tamanho: 5
origem: [RF-29]
tags: [type:feature, area:frontend, component:projects]
```

### US-027 – Visualização por Abas
```yaml
id: US-027
milestone: R1
prioridade: Média
tamanho: 3
origem: [UX]
tags: [type:feature, area:ui, component:projects]
```

### US-028 – Evolução Temporal da Equipe
```yaml
id: US-028
milestone: R1
prioridade: Média
tamanho: 3
origem: [User Request]
tags: [type:feature, area:ui, component:projects]
```

### US-029 – Evolução dos Projetos (Início vs Conclusão)
```yaml
id: US-029
milestone: R1
prioridade: Alta
tamanho: 3
origem: [User Request]
tags: [type:feature, area:ui, component:projects]
```

### US-035 – Home Page Analytics
```yaml
id: US-035
milestone: R1
prioridade: Média
tamanho: 5
origem: [User Request]
tags: [type:feature, area:ui, component:home]
```

#### Descrição
Como gestor, quero visualizar gráficos de alto nível na Home Page sobre a evolução de Projetos (ativos/iniciados/concluídos) e distribuição de Grupos de Pesquisa, para ter uma visão macro do ecossistema de inovação da instituição.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Gráfico de Evolução de Projetos (Linha/Barra) usando dados do Mart.
    - [ ] Gráfico de Distribuição de Grupos de Pesquisa (Pizza/Donut) por Grande Área ou Campus.
    - [ ] Cards de estatísticas (já existentes) alinhados com os novos gráficos.
- **UI/UX**:
    - [ ] Manter o estilo premium (cards, glassmorphism, tipografia Outfit).
    - [ ] Charts interativos (Recharts/Apache ECharts ou similar).


## Epic 8: Dashboard de Produção Acadêmica (Release 1 Extension)
**Objetivo**: Visualizar a produção bibliográfica da instituição.

### US-031 – Dashboard de Publicações
```yaml
id: US-031
milestone: R1
prioridade: Alta
tamanho: 8
origem: [RF-28, RF-29]
tags: [type:feature, area:frontend, component:dashboard]
```

#### Descrição
Implementar um dashboard dedicado para visualização da produção acadêmica, exibindo métricas de quantidade por pesquisador e a evolução temporal das publicações.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Gráfico de Barras: Quantidade de Publicações por Pesquisador (Top 10/20).
    - [ ] Gráfico de Linha/Área: Evolução temporal (Quantidade por Ano).
    - [ ] Listagem tabular ou em cards das publicações (opcional para primeira versão, mas desejável).
    - [ ] Filtro por Intervalo de Anos.
- **UI/UX**:
    - [ ] Design consistente com os demais dashboards (Title, KPIs, Charts).
    - [ ] Tooltips interativos nos gráficos.

#### Refinamento entregue em 30/03/2026
- O filtro global de campus passou a usar `campus.id` como chave canônica em todas as páginas principais, com compatibilidade de leitura para valores legados em slug e nome.
- A página de publicações passou a usar `articles_canonical.campus.id/name` como fonte de verdade do campus do artigo.
- Cada publicação agora pertence a exatamente um campus canônico, sem perder o vínculo multiautor para métricas por pesquisador.

### US-036 – Página de Download de Dados
```yaml
id: US-036
milestone: R1
prioridade: Média
tamanho: 5
origem: [User Request]
tags: [type:feature, area:frontend, component:download]
```

#### Descrição
Criar uma página (`/download`) que permita a qualquer pessoa baixar os arquivos de dados brutos e processados (Canonical e Mart) que alimentam o dashboard. A página deve listar cada arquivo com uma explicação clara do seu conteúdo.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Listar arquivos de `src/data/canonical` e `src/data/mart`.
    - [ ] Exibir nome do arquivo, descrição do conteúdo e contagem de registros (se aplicável).
    - [ ] Botão de "Download" que baixa o arquivo JSON.
- **UI/UX**:
    - [ ] Design consistente com o restante da plataforma (Cards/Grid).
    - [ ] Explicações claras e amigáveis para cada dataset.

### US-038 – Ingestão de Projetos Lattes
```yaml
id: US-038
milestone: R2
prioridade: Alta
tamanho: 8
origem: [User Request, RF-02]
tags: [type:feature, area:backend, source:lattes]
```

#### Descrição
Implementar o pipeline de ingestão de projetos a partir do CV Lattes, abrangendo:
1.  **Projetos de Pesquisa**
2.  **Projetos de Extensão**
3.  **Projetos de Desenvolvimento**

Esses projetos devem ser normalizados e inseridos como iniciativas no banco de dados.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Parser extrai os 3 tipos de projetos do JSON do Lattes.
    - [ ] Mapeamento correto para entidade `Initiative`.
    - [ ] Tipos de Iniciativa criados/mapeados (Research, Extension, Development).
    - [ ] Link com o Pesquisador (Coordenador/Integrante).
- **Dados**:
    - [ ] `description`, `start_year`, `end_year` preenchidos.
    - [ ] `status` inferido (Active/Concluded).

### US-039 – Visualização de Projetos Lattes
```yaml
id: US-039
milestone: R2
prioridade: Alta
tamanho: 5
origem: [User Request]
tags: [type:feature, area:frontend]
dependencias: [US-038]
```

#### Descrição
Garantir que os projetos importados do Lattes sejam exibidos corretamente no perfil do pesquisador e na listagem geral.

#### Critérios de Aceitação
- [ ] Perfil do pesquisador lista projetos de Extensão e Desenvolvimento separadamente ou com labels claros.
- [ ] Filtros na página de projetos permitem selecionar "Extensão", "Desenvolvimento".

### US-040 – Listagem de Artigos Científicos do Pesquisador (Done na v2.0.0)
```yaml
id: US-040
milestone: R2
prioridade: Alta
tamanho: 5
origem: [RF-40]
tags: [type:feature, area:frontend, component:articles]
```

#### Descrição
Implementar a visualização de artigos científicos na página de detalhes do pesquisador, com suporte a scroll infinito (30 em 30) e busca textual por título, para lidar com grandes volumes de publicações.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Carregar artigos em lotes de 30 utilizando scroll infinito.
    - [ ] Permitir busca em tempo real por título do artigo.
    - [ ] Exibir metadados do artigo: Título, Ano, Journal/Conference, DOI (se disponível).
- **UI/UX**:
    - [ ] Notificar o usuário quando não houver resultados na busca.
    - [ ] Design responsivo e acessível.

### US-041 – Gráfico de Evolução de Publicações por Ano (Done na v2.0.0)
```yaml
id: US-041
milestone: R2
prioridade: Alta
tamanho: 5
origem: [RF-42]
tags: [type:feature, area:frontend, component:charts]
```

#### Descrição
Implementar gráficos de barras ou linha que mostrem a evolução temporal das publicações científicas do pesquisador, permitindo uma análise rápida da produtividade ao longo dos anos. O gráfico deve estar presente tanto na modal da listagem quanto na página de detalhes.

#### Critérios de Aceitação
- **Funcional**:
    - [ ] Gerar dados agregados de artigos por ano a partir do arquivo canônico.
    - [ ] Exibir gráfico interativo na página de detalhes do pesquisador.
    - [ ] Exibir gráfico na modal de artigos na listagem geral.
- **UI/UX**:
    - [ ] Cores consistentes com o design system da plataforma.
    - [ ] Tooltips com valores exatos ao passar o mouse.
