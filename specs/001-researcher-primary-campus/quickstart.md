# Quickstart & Validation Guide: Exibição e Filtragem por Campus Principal em Pesquisadores

**Feature**: `001-researcher-primary-campus`  
**Date**: 2026-09-15  
**Spec**: [spec.md](./spec.md) | **Contracts**: [contracts/researcher-card-contract.md](./contracts/researcher-card-contract.md)

---

## 1. Pré-requisitos e Configuração

Certifique-se de estar na raiz do projeto e com as dependências instaladas:
```bash
node -v # Node >= 20
npm install
```

---

## 2. Cenários de Validação Automatizada (Vitest)

Execute a suíte de testes unitários que valida a resolução de campus e os contratos do card:

```bash
# Executa os testes unitários relevantes
npx vitest run tests/campus-filter.test.ts
```

### Casos de Teste Chave Validados:
1. **Priorização de Campus Principal**:
   - Um pesquisador com `campus = { id: 2, name: "Vitória" }` e grupos em múltiplos campi deve retornar exatamente `["2"]` ao chamar `getResearcherCampusIds(researcher)`.
2. **Ausência de Badges de Overflow**:
   - O markup retornado por `renderResearcherCardMarkup` para um pesquisador com múltiplos grupos históricos deve conter apenas 1 pílula do campus Vitória e zero instâncias de `+1` ou `+2`.
3. **Disjunção entre Visões de Campus**:
   - `buildCampusResearcherViews(researchers)` deve retornar conjuntos disjuntos entre campi (interseção vazia).

---

## 3. Validação Manual na Interface (Navegador)

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse a página de pesquisadores em `http://localhost:4321/horizon_dashboard/researchers` (ou porta configurada).

### Cenário A: Card com Campus Principal Único
1. Na barra de busca de pesquisadores, pesquise por `Maria Alice Veiga Ferreira De Souza`.
2. **Resultado Esperado:** O card de Maria Alice deve exibir exclusivamente a pílula verde `Vitória`. Nenhum badge `+1` ou `Cefor` deve aparecer no card.

### Cenário B: Filtragem por Campus
1. No seletor global de campus no topo da página, selecione o campus `Cariacica`.
2. No campo de busca, digite `Maria Alice`.
3. **Resultado Esperado:** A lista exibe o estado vazio (*"Nenhum pesquisador encontrado"*), pois o campus principal de Maria Alice é Vitória, mesmo ela colaborando em grupo de Cariacica.
4. Mude o seletor global de campus para `Vitória`.
5. **Resultado Esperado:** Maria Alice aparece imediatamente na listagem com seu card exibindo `Vitória`.

### Cenário C: Indicadores de Visão de Campus
1. Observe a contagem de pesquisadores nos cards de KPI ao alternar entre os campi no seletor global.
2. **Resultado Esperado:** As contagens refletem a quantidade de pesquisadores efetivamente lotados em cada unidade, sem duplicações intercampi.

---

## 4. Validação de Build e Lint

Valide a integridade estática e compilação de todo o projeto:
```bash
npm run lint:eslint
npm run build
```
Ambos os comandos devem concluir com código de saída 0 (sem erros de lint ou build).
