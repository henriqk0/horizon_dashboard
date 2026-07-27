# Especificação de Requisitos: Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos

Esta especificação define os requisitos funcionais e comportamentais para o **Posicionamento Dinâmico e Prevenção de Colisão das Labels (nomes) nos Grafos de Interação** do Horizon Dashboard. 

Este documento foca exclusivamente no **O QUÊ** e no **PORQUÊ** desta melhoria, servindo como contrato de qualidade visual e experiência do usuário (UX), sem determinar implementações técnicas ou fórmulas matemáticas.

---

## 1. Contexto e Justificativa (O PORQUÊ)

Nos grafos de interação (tanto de Pesquisadores quanto de Grupos de Pesquisa), os rótulos de texto (*labels*) contendo os nomes dos pesquisadores e integrantes possuem atualmente uma ancoragem estática. 

Isso resulta nos seguintes problemas críticos de UX:
1. **Invasão dos Nós Visualmente**: Os textos são desenhados diretamente sobre ou dentro do espaço circular das bolinhas (nós), encobrindo a cor do nó, o estado do elemento e prejudicando a leitura do nome.
2. **Sobreposição Entre Rótulos (Texto sobre Texto)**: Em regiões com concentração de nós (especialmente em agrupamentos ou clusters densos), as labels se cruzam e empilham umas sobre as outras, tornando o texto completamente ilegível.
3. **Problema Crítico no Lado Esquerdo do Grafo**: Nós localizados à esquerda da tela mantêm a mesma ancoragem estática à direita do nó, fazendo com que o texto invada a área central do nó ou saia dos limites visuais de leitura esperados em telas menores.

A correção deste comportamento é fundamental para que o Horizon Dashboard ofereça uma experiência de análise de redes limpa, intuitiva e acessível, onde a identificação dos atores da rede seja imediata e sem esforço visual.

---

## 2. Atores

* **Gestores Acadêmicos e Coordenadores**: Navegam nos grafos para mapear a rede de colaboração de pesquisadores e grupos, necessitando identificar nomes de relance.
* **Pesquisadores e Professores**: Exploram suas próprias conexões e grupos de pesquisa, buscando identificar parceiros de publicação e orientação de forma clara.
* **Estudantes e Visitantes Gerais**: Exploram o dashboard interativamente para conhecer a produção científica da instituição, demandando uma interface legível e moderna.

---

## 3. User Stories (Histórias de Usuário)

### US-1: Leitura Clara e Sem Obstrução dos Nomes
> **Como** usuário navegando pelo grafo de interações,  
> **Quero** visualizar os nomes dos pesquisadores posicionados fora da área circular dos nós,  
> **Para que** eu possa ler a identificação de cada pessoa sem que o texto cubra a bolinha do nó ou oculte sua cor e estado visual.

### US-2: Prevenção Ativa de Colisão Entre Textos
> **Como** usuário analisando um grupo de pesquisa com muitos integrantes próximos,  
> **Quero** que as labels de texto não se sobreponham umas às outras,  
> **Para que** a visualização permaneça limpa e legível mesmo em áreas com alta densidade de conexões.

### US-3: Leitura Adequada em Nós do Lado Esquerdo e Bordas
> **Como** usuário observando nós posicionados no lado esquerdo ou nas extremidades do painel do grafo,  
> **Quero** que a orientação do texto se ajuste dinamicamente conforme a posição do nó,  
> **Para que** os nomes sempre apontem para áreas livres e não fiquem cortados ou invadam o próprio nó.

### US-4: Manutenção da Legibilidade Durante Interações de Hover e Zoom
> **Como** usuário interagindo com o grafo (passando o mouse ou aplicando zoom),  
> **Quero** que os nomes mantenham seu posicionamento claro e desobstruído durante o movimento,  
> **Para que** minha experiência de exploração seja fluida e sem oscilações visuais incômodas.

---

## 4. Critérios de Aceitação (O QUÊ)

### CA-1: Deslocamento Inteligente e Margem de Respiro do Nó
* **Dado** que um nó do grafo possui um rótulo de texto visível,
* **Quando** o nó é renderizado na tela,
* **Então** o texto do nome DEVE ser posicionado totalmente fora da circunferência do nó, mantendo um espaçamento visual confortável (margem de respiro) para que o texto nunca encoste ou cruze o contorno da bolinha.

### CA-2: Prevenção de Colisão Texto-Texto (Não Sobreposição)
* **Dado** que dois ou mais nós estão posicionados próximos uns dos outros,
* **Quando** suas labels são exibidas simultaneamente,
* **Então** os textos NÃO PODEM se cruzar ou se empilhar diretamente.
* **E** a interface DEVE reorientar ou ajustar o alinhamento de cada label para garantir que todos os nomes visíveis permaneçam legíveis individualmente.

### CA-3: Ajuste Dinâmico de Orientação por Quadrante
* **Dado** um nó posicionado no lado esquerdo do grafo,
* **Quando** sua label for renderizada,
* **Então** o alinhamento do texto DEVE se ajustar (ex: alinhando-se à esquerda do nó ou direcionando-se para o espaço externo) para que o texto não avance sobre o nó nem se confunda com conexões centrais.
* **Dado** um nó nas bordas superiores, inferiores ou direitas,
* **Quando** sua label for renderizada,
* **Então** o texto DEVE automaticamente escolher a direção oposta ao centro ou a direção de menor ocupação visual.

### CA-4: Comportamento Durante Foco e Seleção (Hover/Highlight)
* **Dado** que o usuário passa o ponteiro do mouse sobre um nó ou o seleciona,
* **Quando** o nó selecionado e seus vizinhos forem destacados,
* **Então** as labels dos nós em destaque DEVEM receber prioridade máxima de leitura, permanecendo 100% visíveis e sem sofrer oclusão por labels secundárias.

### CA-5: Acessibilidade e Contraste Visual
* **Dado** que as labels de texto são desenhadas sobre o fundo do grafo ou sobre linhas de conexão,
* **Quando** o texto for exibido em temas claros ou escuros,
* **Então** o texto DEVE possuir contraste visual suficiente (ex: contorno claro/escuro ou fundo suavizado) para garantir leitura limpa sobre qualquer tipo de fundo ou passagem de arestas.
* **E** o conteúdo textual de cada rótulo DEVE ser perfeitamente exposto para tecnologias assistivas (leitores de tela).

### CA-6: Estabilidade Visual e Desempenho Percebido
* **Dado** que o usuário realiza ações de pan (arrastar) ou zoom no grafo,
* **Quando** o grafo é movimentado,
* **Então** o reposicionamento das labels DEVE ser suave e contínuo, sem tremor (*flicker*), pulos visuais bruscos ou travamentos na navegação.

---

## 5. Casos Limite (Edge Cases)

1. **Nomes Extensos ou Compostos**: Nomes muito longos (ex: "Alexandre Henriques de Oliveira Castro") devem manter alinhamento inteligente ou truncamento gracioso com indicador visual sem causar colisões em cadeia com nós vizinhos.
2. **Superaglomerados (Clusters com Alta Densidade)**: Em clusters onde seja matematicamente impossível exibir todas as labels sem colisão técnica, o sistema deve priorizar a exibição das labels dos nós de maior relevância ou dos nós sob interação do usuário.
3. **Dispositivos Móveis e Telas Pequenas**: O posicionamento dinâmico deve respeitar os limites do contêiner em telas pequenas para evitar que o texto seja cortado nas extremidades da tela.

---

## 6. Próximos Passos (Workflow SpecKit)

- **Fase Atual**: `/speckit.specify` concluído com a criação deste documento.
- **Aguardando**: Aprovação do usuário para avançar para a próxima etapa (`/speckit.clarify` para esclarecer pontos de ambiguidade ou `/speckit.plan` para o plano técnico de execução).
