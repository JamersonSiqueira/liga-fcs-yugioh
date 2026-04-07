# 🏆 Liga FCS Yu-Gi-Oh — Plataforma de Gestão Competitiva

A **Liga FCS Yu-Gi-Oh** é uma plataforma full-stack para gerenciamento de torneios, ranking de jogadores e análise de performance competitiva baseada em dados reais.

O sistema foi projetado para simular um ambiente competitivo completo, com regras customizáveis, estatísticas detalhadas e visão analítica do metagame.

---

## 🚀 Visão do Projeto

Mais do que um CRUD, este projeto evoluiu para um **sistema analítico competitivo**, com foco em:

- 📊 Ranking confiável e automatizado
- 🧠 Regras de negócio robustas (liga vs não liga)
- 📈 Análise de desempenho individual e coletivo
- 🎮 Simulação de cenário competitivo real

---

## ✨ Principais Funcionalidades

### 🧑 Jogadores
- Cadastro, edição e listagem
- Página de detalhes com:
  - Estatísticas separadas por:
    - Liga
    - Fora da liga
    - Geral
  - Comparação entre jogadores
  - Streak de performance (🔥 hot streak)
  - Histórico recente
  - Decks utilizados com winrate

---

### 🏆 Torneios
- Criação com vínculo automático à banlist ativa
- Suporte a múltiplos formatos:
  - Liga (entra no ranking)
  - Sem ranking (OTS, semanais, etc.)
- Estrutura preparada para:
  - Sistema suíço
  - Top cut (Top 4 / Top 8)

---

### 🎮 Participações
- Registro completo por jogador:
  - Deck utilizado
  - Vitórias / derrotas / empates
  - Pontuação final
  - Colocação manual (opcional)

💡 Caso não informada, a colocação é calculada automaticamente.

---

### 📊 Ranking (Core do Sistema)

- Baseado em **view SQL (`ranking_geral`)**
- Considera apenas torneios válidos para liga
- Critérios de desempate:

1. Pontuação total  
2. Vitórias  
3. Aproveitamento (%)  
4. Menor número de derrotas  
5. Média de colocação  
6. Participações  

🏅 Exibe:
- Títulos (🏆)
- Tops (🥉 — Top 4)

---

### 📈 Meta Call (Análise de Metagame)

Sistema analítico que permite:

- Identificar decks mais utilizados
- Calcular winrate real
- Medir consistência competitiva
- Gerar **tier list automática**

---

## 🧠 Regras de Negócio (Diferencial)

### ✔ Separação clara de contexto:
- **Liga:** impacta ranking
- **Fora da liga:** apenas estatística

### ✔ Tops padronizados:
- Top = colocação ≤ 4

### ✔ Títulos:
- Colocação = 1

### ✔ Pontuação:
- `WLD` → vitórias × peso
- `FIXO` → valor definido manualmente

---

## 🏗️ Arquitetura

### 🔹 Frontend
- React + Vite
- TailwindCSS

### 🔹 Backend
- Node.js + Express
- API REST

### 🔹 Banco de Dados
- PostgreSQL (Supabase)
- Uso de:
  - Views (`ranking_geral`)
  - Queries analíticas
  - Filtros condicionais (`FILTER`)

### 🔹 Deploy
- Frontend: Vercel
- Backend: Render

---

## 🤖 Desenvolvimento com IA (Vibe Coding)

Este projeto foi desenvolvido com apoio intensivo de IA, utilizando uma abordagem de **Vibe Coding**.

### 🔧 A IA foi usada para:
- Geração de código
- Estruturação de componentes
- Criação de queries SQL
- Sugestões arquiteturais

### 🎯 Responsabilidade humana:
- Definição das regras de negócio
- Validação de cenários reais
- Identificação de inconsistências
- Refinamento da UX
- Garantia de integridade dos dados

💡 A IA atuou como acelerador — não como decisora.

---

## 🧪 Qualidade & Testes (QA)

O projeto segue uma abordagem orientada a qualidade, com foco em:

### ✔ Validação de regras críticas:
- Cálculo de ranking
- Pontuação por tipo de torneio
- Contagem de tops e títulos

### ✔ Cenários cobertos:
- Jogadores sem participação
- Torneios fora da liga
- Colocação manual vs automática
- Edge cases de pontuação

### 🔜 Evolução planejada:
- Testes automatizados (Jest + Supertest)
- Testes de integração (API)
- Testes E2E (Cypress)
- Massa de dados controlada (seed)

## 💡 Conclusão

A **Liga FCS** evoluiu de um sistema CRUD para uma **plataforma analítica competitiva**, com foco em consistência de dados, regras claras e visão estratégica do jogo.

Este projeto demonstra:

- Capacidade de modelagem de sistemas reais
- Domínio de lógica de negócio
- Evolução para pensamento orientado a qualidade (QA)

---

## 👤 Autor

Desenvolvido por um profissional com experiência em:

- QA (Quality Assurance)
- Automação de testes
- Desenvolvimento full-stack

---