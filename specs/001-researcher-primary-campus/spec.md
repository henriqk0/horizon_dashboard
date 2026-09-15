# Feature Specification: Exibição e Filtragem por Campus Principal em Pesquisadores

**Feature Branch**: `001-researcher-primary-campus`

**Created**: 2026-09-15

**Status**: Ready

**Input**: User description: "Especificação Técnica: Exibição e Filtragem por Campus Principal em Pesquisadores"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização Exclusiva do Campus Principal no Card (Priority: P1)

Como usuário ou gestor acadêmico navegando pela lista de pesquisadores no Horizon Dashboard, quero que cada card de pesquisador exiba apenas o campus principal de lotação institucional dele, para que eu identifique com clareza e precisão a qual unidade do Ifes aquele profissional está formalmente vinculado, sem confusão gerada por múltiplos campi de grupos de pesquisa dos quais ele apenas colaborou.

**Why this priority**: É a alteração visual mais direta e perceptível solicitada pelo usuário. Elimina a poluição visual dos cards (badges como `[Campus A] [Campus B] [+N]`) e estabelece a representação correta da unidade do pesquisador.

**Independent Test**: Pode ser testado abrindo a página `/researchers` e inspecionando pesquisadores que participam de múltiplos grupos de pesquisa (ex.: "Maria Alice Veiga Ferreira De Souza" ou "Luciano Lessa Lorenzoni"). Cada card deve exibir unicamente a pílula do seu campus de lotação ("Vitória"), sem nenhum indicador numérico adicional (`+N`).

**Acceptance Scenarios**:

1. **Given** um pesquisador cadastrado com lotação no campus "Vitória" e que colabora em grupos de pesquisa nos campi "Vitória", "Cefor" e "Cariacica", **When** o usuário visualiza o card desse pesquisador na lista de pesquisadores, **Then** o card exibe unicamente a pílula com o nome "Vitória".
2. **Given** qualquer card de pesquisador renderizado na tela `/researchers`, **When** o card for apresentado na grade, **Then** não deve conter nenhum indicador de excesso/overflow de campi (como `+1` ou `+2`).

---

### User Story 2 - Filtragem e Busca Estrita pelo Campus Principal (Priority: P2)

Como usuário filtrando a aba de pesquisadores por campus (seja via dropdown global ou busca), quero que a listagem de pesquisadores filtre estritamente com base no campus principal de lotação, para que ao selecionar uma determinada unidade eu veja apenas os pesquisadores que realmente pertencem àquele campus.

**Why this priority**: Garante consistência entre a visualização do card e o comportamento do filtro, evitando falsos positivos na pesquisa (pesquisadores alheios ao campus aparecendo nos resultados).

**Independent Test**: Selecionar um campus específico no filtro (ex.: "Cariacica") e verificar que pesquisadores lotados em outro campus (ex.: "Vitória") não aparecem na listagem, mesmo que façam parte de grupos sediados em Cariacica.

**Acceptance Scenarios**:

1. **Given** que o usuário selecionou o campus "Cariacica" no seletor de campus, **When** a lista de pesquisadores é filtrada, **Then** apenas pesquisadores cujo campus principal seja "Cariacica" são exibidos.
2. **Given** que o usuário pesquisou pelo nome de um pesquisador no campo de busca com um campus ativo, **When** o pesquisador procurado não pertence ao campus ativo, **Then** ele não é exibido nos resultados.
3. **Given** que o usuário limpou o filtro de campus, **When** a listagem é redefinida, **Then** todos os pesquisadores com seus respectivos campi principais voltam a ser exibidos.

---

### User Story 3 - Métricas e Visões de Campus sem Duplicidade Estatística (Priority: P3)

Como gestor institucional acompanhando os painéis e gráficos analíticos de pesquisadores por campus, quero que a contagem de pesquisadores de cada unidade considere apenas os profissionais efetivamente lotados nela, para que os indicadores (total de pesquisadores, doutores, mestres, artigos) não contenham duplicações infladas decorrentes de participações intercampi em grupos de pesquisa.

**Why this priority**: Confere precisão aos dados institucionais consolidados nas visões analíticas por campus (`campusResearcherViews`).

**Independent Test**: Comparar a soma de pesquisadores entre as visões individuais de todos os campi e verificar que nenhum pesquisador é contabilizado duplamente em duas unidades distintas.

**Acceptance Scenarios**:

1. **Given** um pesquisador lotado em "Vitória", **When** a visão estatística do campus "Vitória" é carregada, **Then** ele é contabilizado nos indicadores deste campus.
2. **Given** o mesmo pesquisador lotado em "Vitória", **When** a visão estatística do campus "Cariacica" ou "Cefor" é carregada, **Then** ele não é contabilizado nos indicadores destes campi.

---

### Edge Cases

- **Pesquisador sem campus institucional preenchido**: Se um registro de pesquisador não possuir o atributo `campus` informado nos dados canônicos (ocorrência residual de 11 pesquisadores sem grupos no dataset), o sistema deve tratar com fallback gracioso:
  - Não deve exibir pílula de campus no card.
  - Não deve lançar exceções ou quebrar a renderização da grade.
  - O pesquisador deve continuar visível e pesquisável pelo nome na visão global ("Todos os Campi").
- **Campus não cadastrado na lista canônica**: Se o campus informado no registro não for reconhecido, o sistema trata a informação de maneira resiliente sem corromper o índice de busca.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tipagem de domínio do pesquisador (`Researcher` em `src/types/researchers.ts`) DEVE declarar formalmente o campo `campus?: { id: string | number; name: string } | null;`.
- **FR-002**: O módulo de resolução de dados institucionais (`src/lib/tenant-data.ts`) DEVE priorizar o campo `researcher.campus` para definir o campus oficial do pesquisador, retornando uma lista com apenas o ID do campus principal quando este existir.
- **FR-003**: O módulo de construção do card (`src/lib/researcher-card-markup.ts`) DEVE associar ao card apenas o campus principal do pesquisador (`campusIds` e `campusNames`), renderizando uma única pílula visual referente a esse campus.
- **FR-004**: O elemento HTML do card DEVE conter no atributo `data-campus-ids` estritamente o identificador do campus principal, garantindo que o mecanismo client-side de filtragem por campus avalie apenas esse vínculo.
- **FR-005**: A geração das visões e coleções por campus (`buildCampusResearcherViews` em `src/lib/researcher-collections.ts`) DEVE agrupar cada pesquisador única e exclusivamente no seu campus principal.
- **FR-006**: A busca textual por nome de pesquisador DEVE continuar funcionando de maneira combinada e harmoniosa com a filtragem por campus principal.
- **FR-007**: Para registros de pesquisadores sem campus atribuído, o sistema DEVE degradar graciosamente sem emitir erros no console nem falhas em tempo de compilação ou execução.

### Key Entities

- **Pesquisador (Researcher)**: Entidade acadêmica do Ifes. Possui identificador, nome, titulação, produção acadêmica e vínculo institucional (`campus`), além de coleções de iniciativas e grupos de pesquisa nos quais atua.
- **Campus (CampusRecord)**: Unidade física/institucional do Ifes (ex.: Alegre, Cariacica, Serra, Vila Velha, Vitória). Possui identificador único, nome oficial e slug.
- **ResearcherCardView**: Modelo de visualização intermediário desacoplado dos componentes visuais, responsável por transportar as propriedades formatadas para a renderização do card e os metadados de filtragem rápida no cliente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cards de pesquisadores exibidos na página `/researchers` apresentam no máximo uma pílula de campus (zero ocorrências de pílulas adicionais ou contadores `+N`).
- **SC-002**: 100% dos 560 pesquisadores que participam de grupos em múltiplos campi são filtrados e exibidos unicamente no seu respectivo campus de lotação.
- **SC-003**: Nenhuma duplicação de pesquisadores entre visões agregadas de campus (`campusResearcherViews`), assegurando que cada pesquisador seja computado exatamente uma vez entre as unidades.
- **SC-004**: A suíte de testes automatizados do projeto valida via testes de unidade em `tests/` a extração estrita do campus principal e o contrato de dados do card.

## Assumptions

- O campo `campus` presente no arquivo canônico `src/data/researchers_only_canonical.json` representa a unidade de lotação institucional oficial do pesquisador no Ifes.
- Os arquivos de dados sob `src/data/` são artefatos externos somente leitura; nenhuma alteração manual direta será realizada nos arquivos JSON.
- A alteração aplica-se com foco primário na aba `/researchers`. Demais entidades (como projetos ou orientações com múltiplos participantes de diferentes campi) continuam mantendo suas respectivas regras de abrangência institucional sem quebra de compatibilidade.
