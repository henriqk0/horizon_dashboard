# SI.1 – Especificação dos Requisitos do Software
**Projeto:** Horizon Dashboard
**Versão:** 1.0
**Data:** 06/01/2026
**Responsável:** Antigravity (Senior Analyst)

---

## 1. Objetivo do Documento
Registrar os requisitos funcionais e não funcionais do sistema Horizon Dashboard, focando na visualização de dados acadêmicos.

---

## 2. Escopo do Sistema
O **Horizon Dashboard** é uma interface de visualização que automatiza a apresentação de informações de pesquisa e extensão.

- **Entrada**: Arquivos JSON Canônicos (initiatives, researchers, groups).
- **Saída**: Dashboard Web Responsivo e Acessível.

---

## 3. Stakeholders
| Nome / Papel | Interesse | Responsabilidade |
|---------------|-----------|------------------|
| **Product Owner** | Priorização das fontes | Validar dados extraídos |
| **Gestores (Campus)** | Relatórios gerenciais | Definir métricas de sucesso |
| **Pesquisadores** | Visibilidade do perfil | Validar precisão dos dados |

---

## 4. Requisitos Funcionais (RF)

| ID | Requisito | Critério de Aceitação | Origem |
|----|-----------|------------------------|--------|
| **RF-01** | O sistema deve exibir dados de projetos de pesquisa. | Projetos exibidos no Dashboard com metadados completos. | PM1.3 (R1) |
| **RF-02** | O sistema deve extrair dados curriculares da Plataforma Lattes. | Perfil, formação e produções carregadas para pesquisadores listados. | PM1.3 (R2) |
| **RF-04** | O sistema deve extrair dados de execução (Projetos/Bolsas/Compras) da FAPES. | Dados financeiros e de bolsistas vinculados persistidos. | PM1.3 (R3) |
| **RF-05** | O sistema deve coletar metadados do Google Scholar. | Citações e índice-h atualizados. | PM1.3 (R4) |
| **RF-06** | O sistema deve normalizar nomes de autores e instituições. | Entidades duplicadas fundidas (Merge) em ID único. | Arq. |
| **RF-07** | O sistema deve exportar dados de grupos de pesquisa de uma Unidade Organizacional para JSON. | Arquivo JSON gerado seguindo schema do ResearchGroup. | User Req. |
| **RF-08** | O sistema deve exportar dados canônicos (Organização, Campus, Áreas) para arquivos JSON separados. | Arquivos `organizations.json`, `campuses.json`, `knowledge_areas.json` gerados. | User Req. |
| **RF-09** | O sistema deve extrair e atualizar dados de grupos de pesquisa do CNPq DGP (identificação, linhas de pesquisa, membros). | Dados do grupo (espelho), membros e **linhas de pesquisa (mapeadas para Áreas do Conhecimento)** atualizados no banco de dados via `dgp_cnpq_lib`. | User Req. |
| **RF-10** | O sistema deve identificar e exibir membros egressos dos grupos de pesquisa, registrando corretamente as datas de início e fim de participação. | Membros egressos identificados e datas de participação (início/fim) visíveis. | User Req. |
| **RF-11** | O Dashboard deve ser acessível e seguir as diretrizes WCAG 2.1 Nível AA. | Contraste adequado, navegação por teclado e compatibilidade com leitores de tela verificados. | UX Design |
| **RF-12** | O sistema deve possuir alto desempenho de carregamento (Lighthouse > 90). | LCP < 2.5s e TBT < 200ms em conexões 4G estáveis. | UX Design |
| **RF-13** | O sistema deve oferecer visualizações de dados segmentadas por perfil (Personas). | Dashboards específicos para Gestores (macros) e Pesquisadores (detalhados). | Data Analyst |
| **RF-14** | O sistema deve permitir busca e filtragem em tempo real nas listagens de grupos e áreas de conhecimento. | Pesquisa por nome, campus, área e grupos vinculados funcionando em tempo real. | User Req. |
| **RF-15** | O sistema deve possuir fluxo de CI/CD para deploy no GitHub Pages. | Build e push automatizados para a branch de produção via GitHub Actions. | User Req. |
| **RF-16** | O Dashboard deve consumir dados dos arquivos JSON canônicos (`research_groups_canonical.json`). | Dashboard exibindo dados reais em vez de mocks. | User Req. |
| **RF-17** | O Dashboard deve lidar com a ausência de nomes curtos (`short_name`) nos grupos. | Fallback visual (ex: primeira letra do nome completo) implementado nos ícones. | User Req. |
| **RF-18** | O Dashboard deve exibir uma página dedicada para 'Áreas de Conhecimento'. | Dashboard exibindo resumo por área e vinculação direta com os grupos de pesquisa. | User Req. |
| **RF-19** | O sistema deve exibir o gráfico "Top 10 Áreas de Conhecimento" na home e na página de áreas. | Dashboard | Alta |
| **RF-20** | O sistema deve listar os grupos de pesquisa em ordem alfabética e exibir a sigla (short_name) no avatar quando disponível. | Catálogo de Grupos | Média |
| RF-21 | O sistema deve manter consistência visual nos ícones de navegação e dashboard para as Áreas de Conhecimento. | UI Consistency | Baixa |
| **RF-22** | O sistema deve exibir, no detalhamento do grupo de pesquisa, a lista de membros separada por função: Pesquisadores, Estudantes e Técnicos. | Detalhamento de Grupo | Alta |
| **RF-23** | O sistema deve identificar visualmente os membros egressos (ex-membros com data de término preenchida) no detalhamento do grupo de pesquisa. | Detalhamento de Grupo | Média |
| **RF-24** | O sistema deve permitir a separação estrutural de membros ativos e egressos em sub-listas dentro de suas funções (Pesquisadores e Estudantes). | Detalhamento de Grupo | Alta |
| **RF-25** | O sistema deve exibir uma página dedicada para "Projetos de Pesquisa", listando todos os projetos e permitindo a busca/filtragem. | Catálogo de Projetos | Alta |
| **RF-26** | O sistema deve permitir a visualização detalhada de um "Projeto de Pesquisa", exibindo todas as informações disponíveis (equipe, datas, descrição, status). | Detalhamento de Projeto | Alta |
| **RF-27** | O sistema deve oferecer um conjunto completo de ferramentas de acessibilidade (contraste, escalas de fonte, cursor ampliado, leitor de tela, redução de movimento, estrutura de página etc.) por meio do widget UserWay carregado no `<head>` de todas as páginas (conta `USERWAY_ACCOUNT_ID`), mantendo o seletor de tema (Claro/Escuro/Auto) no `ThemeToggle`. | Acessibilidade | Crítica |
| **RF-28** | O sistema deve exibir um Dashboard de Publicações contendo a quantidade de publicações por pesquisador e a evolução temporal das publicações. | Dashboard de Publicações | Alta |
| **RF-29** | O Dashboard de Publicações deve permitir a filtragem por Intervalo de anos e Tipo de Publicação. | Dashboard de Publicações | Média |
| **RF-30** | O sistema deve exibir uma página dedicada para "Pesquisadores", permitindo busca textual por nome e filtros (se aplicável). | Listagem de Pesquisadores | Alta |
| **RF-31** | O sistema deve exibir uma página de detalhes do pesquisador, mostrando suas iniciativas, grupos de pesquisa e áreas de conhecimento. | Detalhes do Pesquisador | Alta |
| **RF-32** | O sistema deve exibir um gráfico de barras com a quantidade de pesquisadores por Área de Conhecimento (Top 10 ou Geral). | Analytics de Pesquisadores | Média |
| **RF-33** | O sistema deve exibir um ranking (Top 10) das Linhas de Pesquisa com maior número de pesquisadores vinculados. | Analytics de Pesquisadores | Média |
| **RF-34** | O sistema deve exibir métricas de distribuição de pesquisadores por Papel em Iniciativas (Coordenador vs Pesquisador). | Analytics de Pesquisadores | Média |
| **RF-35** | O sistema deve exibir um histograma de engajamento (distribuição de pesquisadores por quantidade de iniciativas ativas). | Analytics de Pesquisadores | Média |
| **RF-36** | O sistema deve exibir o Top 5 Grupos de Pesquisa com maior número de membros. | Analytics de Pesquisadores | Média |
| **RF-38** | O sistema deve exibir um gráfico de "Investimento em Bolsas" calculado pela soma anual dos valores das bolsas ativas. | Dashboard de Orientações | Alta |
| **RF-39** | A página de perfil do pesquisador deve consumir dados exclusivamente de `researchers_canonical.json`, eliminando dependências de arquivos Lattes externos e utilities de carregamento legados. | Data Refactor | Alta |
| **RF-40** | O sistema deve listar artigos científicos na página de pesquisadores com scroll infinito e busca. | Artigos exibidos em lotes de 30 com carregamento sob demanda e filtro de busca. | User Req. |
| **RF-41** | O sistema deve permitir a carga de artigos científicos via Lattes JSON para o arquivo canônico. | Ingestão de artigos implementada nos pipelines de dados. | User Req. |
| **RF-42** | O sistema deve exibir um gráfico de publicações por ano na listagem e no detalhe do pesquisador. | Gráfico de barras ou linha mostrando a evolução temporal das publicações. | User Req. |
| **RF-43** | O sistema deve exibir um gráfico de barras com a quantidade de "Projetos por Ano" no perfil do pesquisador. | Visualização temporal de iniciativas ativas/concluídas. | User Req. |
| **RF-44** | O sistema deve exibir um gráfico de barras com a quantidade de "Orientações por Ano" no perfil do pesquisador. | Visualização temporal de orientações em andamento/concluídas. | User Req. |
| **RF-45** | O sistema deve exibir KPIs (Cards) sumarizando o total de Artigos, Orientações e Projetos no perfil do pesquisador. | 3 Cards com ícones e valores numéricos (Badges). | User Req. |
| **RF-46** | O sistema deve permitir a visualização segmentada de "Orientações por Ano" por Tipo de Orientação no perfil do pesquisador. | Gráfico de barras segmentado mostrando a distribuição de tipos por ano. | User Req. |
| **RF-47** | O sistema deve exibir os valores numéricos (totais e/ou parciais) nas barras do gráfico de orientações. | Rótulos de dados visíveis no gráfico de barras. | User Req. |
| **RF-48** | O sistema deve permitir a busca e o carregamento via scroll infinito para a lista de "Projetos e Iniciativas" no perfil do pesquisador. | Listagem dinâmica com busca por termo e carregamento sob demanda. | User Req. |


---

## 5. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição | Restrição Técnica |
|----|------------|-----------|-------------------|
| **RNF-01** | Idempotência | Re-execução de pipelines não deve duplicar dados. | `UPSERT` obrigatório. |
| **RNF-02** | Resiliência | Pipelines devem suportar falhas de rede (retries). | Prefect Retries. |
| **RNF-03** | Arquitetura | Código desacoplado seguindo Clean/Hexagonal Arch. | Modules `etl`, `core`. |
| **RNF-04** | Stack | Astro, Tailwind, Node.js, JSON (Source). | PM1.0 |
| **RNF-05** | Qualidade | Cobertura de testes em lógicas de transformação. | Pytest, TDD. |
| **RNF-06** | Observabilidade | Todas as ações do sistema devem gerar logs estruturados. | Loguru/Prefect Logger. |

---

## 6. Restrições
- Rate Limits do Google Scholar e Lattes (cnpq).
- Acesso à VPN institucional pode ser necessário para SigPesq (a confirmar).
