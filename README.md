# 🏆 Liga FCS Yu-Gi-Oh — Plataforma de Gestão Competitiva

Bem-vindo à **Liga FCS Yu-Gi-Oh**, uma plataforma completa para gerenciamento de torneios, ranking de jogadores e análise competitiva para entusiastas do jogo Yu-Gi-Oh!

Este projeto foi desenvolvido para demonstrar habilidades em desenvolvimento **full-stack moderno**, incluindo frontend, backend e integração com APIs externas.

---

## 🚀 Sobre o Projeto

A plataforma permite:

- Organizar e gerenciar torneios de forma simples
- Registrar participações com decks e resultados
- Gerar ranking automaticamente
- Trabalhar com diferentes tipos de torneio
- Visualizar banlists oficiais atualizadas

💡 **Diferencial:** Sistema completo online com backend e frontend integrados.

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
- Visualização de classificação

---

### 🎮 Participações
- Criar participação
- Editar resultados
- Remover participação
- Controle de duplicidade por jogador/torneio
- Registro de:
  - Deck
  - Vitórias
  - Derrotas
  - Pontuação final

---

### 📊 Ranking
- Ranking geral automático
- Baseado em regras de tipo de torneio
- Estatísticas:
  - Pontos
  - Vitórias
  - Derrotas
  - Aproveitamento

---

## 🧾 Tipos de Torneio

| Tipo | Regra |
|------|------|
| WLD | Vitórias × pontuação |
| FIXO | Pontuação manual |
| SEM_RANKING | Não entra no ranking |

💡 Torneios como OTS Konami entram como **SEM_RANKING**.

---

## 📜 Banlists

- Criar e listar banlists
- Ativar apenas uma por vez
- Integração com API externa para exibição da banlist atual

Exibe:
- Nome da carta
- Status (Forbidden / Limited / Semi-Limited)
- Imagem

---

## 🖥️ Admin Panel

Interface administrativa com:

- Gerenciamento completo:
  - Jogadores
  - Torneios
  - Participações
  - Banlists
- Navegação por abas
- Acesso protegido por chave

---

## 🔐 Segurança

- Rotas protegidas por middleware
- Validação de dados no backend
- Controle de duplicidade
- Validação de inputs no frontend

---

## 📡 Integrações

- API externa de banlist de Yu-Gi-Oh

---

## 🛠️ Como rodar localmente

### Backend

```bash
npm install
npm start