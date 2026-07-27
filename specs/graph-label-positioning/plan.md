# Plano de Implementação Técnica: Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos

> **Recurso**: Posicionamento Dinâmico e Prevenção de Colisão das Labels dos Grafos  
> **Fase SpecKit**: `/speckit.plan`  
> **Especificação de Referência**: [specs/graph-label-positioning/spec.md](file:///home/rafael/horizon_dashboard_h/specs/graph-label-positioning/spec.md)  
> **Constituição do Projeto**: [.agent/constitution.md](file:///home/rafael/horizon_dashboard_h/.agent/constitution.md)

---

## 1. Arquitetura da Solução

A solução para a prevenção de colisão e posicionamento dinâmico de labels será implementada em dois níveis: um **utilitário centralizado de layout e colisão 2D**, e as **adaptações específicas de renderização** para SVG (Grafo de Pesquisadores) e Canvas 2D (Grafo de Grupos de Pesquisa).

```mermaid
flowchart TD
    A[Dados dos Nós & Posições 2D] --> B[Utilitário Central de Layout: graphLabelLayout.ts]
    B --> C[Passo 1: Cálculo Angular Radial\nDetermina quadrantes & textAnchor inicial]
    C --> D[Passo 2: Estimativa de Bounding Box AABB\n(Largura/Altura por caractere & medida de texto)]
    D --> E[Passo 3: Algoritmo de Resolução de Colisão\nDeslocamento iterativo anti-sobreposição]
    E --> F1[PersonInteractionGraph.astro\nRenderização SVG & Halo de Leitura]
    E --> F2[ResearchGroupInteractionGraph.astro\nRenderização Canvas 2D & Pílula Translucida]
```

---

## 2. Detalhamento Algorítmico (Engine de Posicionamento)

### 2.1. Passo 1: Posicionamento Base Orientado por Vetor Angular
Em vez de ancorar os textos sempre à direita ou abaixo do nó com offset estático, calculamos o vetor do centro geométrico do grafo até o nó $(x_n, y_n)$:

$$\theta = \operatorname{atan2}(y_n - y_c, x_n - x_c)$$

Com base no ângulo $\theta$, definimos a direção do rótulo para que ele se projete **para fora da área do nó**:

* **Quadrante Direito ($-\pi/4 \le \theta < \pi/4$)**:
  * Ancoragem: `textAnchor = "start"` / `textAlign = "left"`
  * Deslocamento: $X_{label} = x_n + R_{nó} + \text{gap}$
* **Quadrante Inferior ($\pi/4 \le \theta < 3\pi/4$)**:
  * Ancoragem: `textAnchor = "middle"` / `textAlign = "center"`
  * Deslocamento: $Y_{label} = y_n + R_{nó} + \text{gap} + \text{fontSize}$
* **Quadrante Esquerdo ($3\pi/4 \le \theta \le \pi$ ou $-\pi \le \theta < -3\pi/4$)**:
  * Ancoragem: `textAnchor = "end"` / `textAlign = "right"`
  * Deslocamento: $X_{label} = x_n - R_{nó} - \text{gap}$
* **Quadrante Superior ($-3\pi/4 \le \theta < -\pi/4$)**:
  * Ancoragem: `textAnchor = "middle"` / `textAlign = "center"`
  * Deslocamento: $Y_{label} = y_n - R_{nó} - \text{gap}$

> [!NOTE]
> Essa lógica resolve imediatamente o **problema crítico nos nós do lado esquerdo do grafo**, fazendo com que a label se expanda para a esquerda fora do nó em vez de invadi-lo.

---

### 2.2. Passo 2: Cálculo de Caixas Delimitadoras (AABB - Axis-Aligned Bounding Box)
Para cada label $i$, construímos o seu retângulo de colisão $B_i = (x_{min}, y_{min}, x_{max}, y_{max})$ considerando:
* Posição $(x, y)$ calculada no Passo 1.
* Largura estimada $W_i$ (calculada via `measureText` no Canvas ou multiplicador preciso de caracteres no SVG).
* Altura $H_i$ baseada no tamanho da fonte (`fontSize + padding`).
* Raio do próprio nó para evitar que a label de *outro* nó invada a bolinha.

---

### 2.3. Passo 3: Algoritmo de Resolução de Colisão (Bounding Box N-Body Repulsion / Grid Shift)
Para grafos densos onde múltiplos nós ficam próximos:
1. Ordenamos os nós por **prioridade visual**:
   - 1º Prioridade: Nó em foco/selecionado (`isFocus` ou `isSelected`)
   - 2º Prioridade: Nó sob hover (`isHovered`)
   - 3º Prioridade: Grau de conexão / peso das arestas
   - 4º Prioridade: Posição original no layout
2. Iteramos sobre as labels em ordem de prioridade.
3. Se $B_j$ colidir com $B_i$ já posicionado (onde $i$ tem maior prioridade):
   - Testamos posições alternativas em leque angular (ex: $\pm 30^\circ$, $\pm 60^\circ$ ou deslocamento vertical de linha).
   - O algoritmo escolhe a primeira posição sem colisão que mantenha a menor distância da posição ideal.
   - Limite de iterações por frame: Máximo 3 tentativas por nó para garantir execução $< 2\text{ms}$ e manter 60 FPS.

---

## 3. Adaptações Específicas nos Componentes

### 3.1. `PersonInteractionGraph.astro` (Grafo SVG do Pesquisador)

* **Novo Utilitário**: Importar e utilizar a lógica de layout de labels antes de renderizar os elementos `<text>` do SVG.
* **Efeito "Text Halo" (Contraste Visual)**:
  * Para evitar legibilidade ruim sobre arestas escuras ou coloridas, as labels `<text>` no SVG receberão um atributo `stroke` simulando contorno suave (`stroke="#ffffff"` / `stroke-width="3.5px"` / `paint-order="stroke fill"`) ou um retângulo `<rect>` semi-transparente por trás.
* **Ajuste de Atributos SVG**:
  * Aplicação dinâmica de `x`, `y`, e `text-anchor="start" | "end" | "middle"`.

### 3.2. `ResearchGroupInteractionGraph.astro` (Grafo Canvas do Grupo de Pesquisa)

* **Integração no Loop de Renderização (`requestAnimationFrame`)**:
  * Atualizar a função interna de desenho de rótulos (`drawNodeLabels`).
  * Utilizar `context.measureText(label)` para calcular a caixa delimitadora exata do fundo da pílula (`drawRoundedRect`).
  * Aplicar o novo algoritmo de posicionamento radial e prevenção de colisão antes do desenho.
* **Pílulas de Texto Glassmorphic**:
  * Fundo suavizado `hexToRgba("#ffffff", opacity)` com borda sutil `hexToRgba("#cbd5e1", opacity)` garantindo excelente visibilidade sobre qualquer fundo de tela.

---

## 4. Estrutura de Arquivos Modificados / Criados

```
src/
├── utils/
│   └── graphLabelLayout.ts      # [NOVO] Algoritmo puro de posicionamento angular & resolução de colisões
├── components/
│   ├── researchers/
│   │   └── PersonInteractionGraph.astro  # [MODIFICADO] Atualização do layout SVG & text-anchor dinâmico
│   └── groups/
│       └── ResearchGroupInteractionGraph.astro # [MODIFICADO] Atualização da renderização Canvas & colisão
tests/
└── unit/
    └── graphLabelLayout.test.ts # [NOVO] Testes unitários do algoritmo de colisão
```

---

## 5. Plano de Validação e Testes (TDD / QA)

### 5.1. Testes Automatizados (Vitest)
Criar `tests/unit/graphLabelLayout.test.ts` cobrindo:
1. **Posicionamento Angular**:
   - Nó no quadrante esquerdo ($x < center$) deve retornar `textAnchor: "end"` e deslocamento negativo no X.
   - Nó no quadrante direito ($x > center$) deve retornar `textAnchor: "start"` e deslocamento positivo no X.
2. **Prevenção de Colisão**:
   - Duas labels concorrentes na mesma coordenada devem ser deslocadas verticalmente/angularmente sem se sobrepor.
3. **Respeito à Prioridade**:
   - O nó focal/selecionado não deve ter sua posição alterada por nós periféricos secundários.

### 5.2. Verificação de Performance
- Medição do tempo de execução de `calculateLabelPlacements()` com 50+ nós (meta: $< 2\text{ms}$).
- Verificação de renderização fluida no Canvas durante ações de arrastar (*pan*) e zoom (*scale*).

### 5.3. Verificação Manual e Visual (UX)
- Inspecionar grafos de pesquisadores com muitos vínculos na UI.
- Validar se nós do lado esquerdo do grafo estão com os textos totalmente legíveis e externos à bolinha do nó.
- Garantir comportamento responsivo em telas pequenas ($375\text{px}$).

---

## 6. Próximos Passos e Status de Aprovação

- [x] **Fase `/speckit.specify`**: `specs/graph-label-positioning/spec.md` gerado.
- [x] **Fase `/speckit.plan`**: `specs/graph-label-positioning/plan.md` elaborado.
- [ ] **Próxima Ação**: Aguardar confirmação do usuário para iniciar o TDD e a implementação do código (`Fase de Execução`).
