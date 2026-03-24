# 🏆 Liga FCS Yu-Gi-Oh — Plataforma de Gestão Competitiva

Bem-vindo à **Liga FCS Yu-Gi-Oh**, uma plataforma completa para gerenciamento de torneios, ranking de jogadores e análise competitiva para entusiastas do jogo Yu-Gi-Oh!

Este projeto foi desenvolvido para demonstrar habilidades em desenvolvimento **full-stack moderno**, incluindo frontend, backend e modelagem de dados voltada para cenários reais competitivos.

---

## 🚀 Sobre o Projeto

A plataforma permite:

- Organizar e gerenciar torneios de forma simples
- Registrar participações com decks e resultados
- Gerar ranking automaticamente
- Trabalhar com diferentes tipos de torneio
- Visualizar banlists oficiais atualizadas
- Analisar o **metagame competitivo (Meta Call)**

💡 **Diferencial:** Sistema completo com visão competitiva real, incluindo **tier list automática baseada em dados**.

---

## 🤖 Desenvolvimento com IA (Vibe Coding)

Este projeto foi desenvolvido **100% com auxílio de Inteligência Artificial**, utilizando uma abordagem conhecida como **Vibe Coding**.

### 🧠 Como funciona:

- A IA foi utilizada para:
  - Geração de código (frontend e backend)
  - Estruturação de componentes
  - Sugestões de arquitetura
  - Criação de queries e regras de negócio

- O desenvolvimento foi guiado por um profissional com experiência em:
  - **QA (Quality Assurance)**
  - **Desenvolvimento**

### 🎯 Papel do desenvolvedor:

- Definição de regras de negócio
- Validação de cenários reais
- Identificação e correção de bugs
- Testes funcionais e lógicos
- Refinamento da experiência do usuário
- Garantia de consistência dos dados

💡 Em vez de apenas gerar código, a IA foi utilizada como uma **ferramenta de aceleração**, enquanto o controle de qualidade, lógica e direção do sistema foram conduzidos manualmente.

---

## 🏗️ Arquitetura

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (Supabase)
- **Deploy:**
  - Frontend: Vercel
  - Backend: Render

---

## 🎮 Funcionalidades

### 🧑 Jogadores
- Criar jogador
- Listar jogadores
- Editar dados

---

### 🏆 Torneios
- Criar torneio (com banlist ativa automática)
- Editar e remover torneios
- Filtros por:
  - Ano
  - Tipo
  - Banlist
- Visualização de classificação automática

---

### 🎮 Participações
- Criar participação
- Editar resultados
- Remover participação
- Controle de duplicidade por jogador/torneio
- Registro de:
  - Deck utilizado
  - Vitórias / Derrotas
  - Pontuação final
  - Colocação manual (opcional)

💡 Caso a colocação manual não seja informada, o sistema calcula automaticamente via ranking.

---

### 📊 Ranking
- Ranking geral automático
- Baseado em regras do tipo de torneio
- Estatísticas:
  - Pontos
  - Vitórias
  - Derrotas
  - Aproveitamento (winrate)

---

## 🧾 Tipos de Torneio

| Tipo | Regra |
|------|------|
| WLD | Vitórias × pontuação |
| FIXO | Pontuação manual |
| SEM_RANKING | Não entra no ranking |

💡 Torneios como OTS Konami entram como **SEM_RANKING**, mas ainda contam para estatísticas e metagame.

---

## 📜 Banlists

- Criar e listar banlists
- Apenas uma pode estar ativa
- Vinculação automática ao criar torneios

Exibe:
- Nome da carta
- Status (Forbidden / Limited / Semi-Limited)
- Imagem

---

## 📈 Meta Call (Análise de Metagame)

O sistema possui uma página dedicada ao **Meta Call**, responsável por analisar o desempenho dos decks.

### 🔍 O que é exibido:

- Popularidade dos decks (gráfico)
- Winrate (%)
- Quantidade de jogadores únicos
- Tops e títulos
- Lista completa de resultados por deck

---

### 🧠 Cálculo da Tier List

Os decks são classificados automaticamente com base em um **score ponderado**:
