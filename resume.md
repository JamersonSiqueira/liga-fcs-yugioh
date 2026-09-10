# 🏆 Resume do Projeto — Liga FCS Yu-Gi-Oh

Este documento fornece um resumo detalhado e consolidado da arquitetura, funcionalidades, regras de negócio, APIs e estrutura do projeto **Liga FCS Yu-Gi-Oh**. Este arquivo foi gerado para servir como referência técnica oficial e base para futuras alterações e evoluções do sistema.

---

## 📌 1. Visão Geral do Sistema

A **Liga FCS Yu-Gi-Oh** é uma plataforma full-stack para gerenciamento de torneios competitivos, acompanhamento de ranking de jogadores, análises estatísticas de metagame e administração do circuito de partidas.

### 🛠️ Stack Tecnológica

| Camada | Tecnologias / Bibliotecas |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, React Router DOM, Recharts |
| **Backend** | Node.js, Express, CORS, dotenv, pg (PostgreSQL Client) |
| **Banco de Dados** | PostgreSQL (Hospedado no Supabase), Views SQL, Filtros Condicionais |
| **Hospedagem / Deploy** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ 2. Estrutura de Diretórios do Projeto

```text
liga-fcs-yugioh/
├── backend/
│   ├── src/
│   │   ├── db.js                 # Conexão com o pool de banco de dados PostgreSQL
│   │   ├── index.js              # Servidor Express, CORS e registro de rotas
│   │   ├── middleware/
│   │   │   └── admin.js          # Validação de segurança via header x-admin-key
│   │   └── routes/
│   │       ├── admin.js          # Rota de login admin e testes de status
│   │       ├── banlists.js       # Gestão e alternância de banlists ativas
│   │       ├── jogadores.js      # CRUD de jogadores e estatísticas detalhadas
│   │       ├── participacoes.js  # Registro de participações/resultados em torneios
│   │       ├── ranking.js        # Consulta à view ranking_geral
│   │       ├── stats.js          # Algoritmo do Meta Call (Tier List de Decks)
│   │       ├── tiposTorneio.js   # Gestão de formatos e modelos de pontuação
│   │       └── torneios.js       # Gestão de torneios e feed de próximos eventos
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Roteamento de páginas (React Router)
│   │   ├── components/           # Componentes reusáveis (RankingTable, Podium, Navbar, Footer, etc.)
│   │   │   └── admin/            # Formulários e modais administrativos
│   │   ├── pages/                # Telas (Ranking, MetaCall, Torneios, JogadorDetalhe, Admin, etc.)
│   │   └── services/             # Clientes de API (api.js e adminFetch.js)
└── README.md
```

---

## 🧠 3. Regras de Negócio e Algoritmos do Sistema

### 3.1. Classificação de Torneios (Liga vs. Fora da Liga)

Os torneios são classificados pelo tipo de torneio (`tipo_torneio.modelo_codigo`):

- **Liga (Impacta o Ranking Geral)**:
  - Modelo `WLD`: Vitória concede pontos conforme `pontuacao_vitoria` daquele tipo de torneio:
    - **Torneio Mensal**: **3 pontos** por vitória.
    - **Torneio Relâmpago**: **2 pontos** por vitória (`pontuacao_vitoria = 2`), com vitórias contabilizadas de forma separada no ranking (`vitorias_relampago`) e no perfil do duelista para não distorcer as métricas da liga principal.
  - Modelo `FIXO`: Pontuação atribuída manualmente (`pontuacao_final`).
- **Fora da Liga (Apenas Estatística Individual)**:
  - Modelo `SEM_RANKING`: Usado para semanais, torneios OTS ou eventos casuais. Não pontua para o Ranking Geral da Liga.

### 3.2. Critérios de Desempate do Ranking (`ranking_geral`)

A view SQL `ranking_geral` considera **apenas torneios com `entra_ranking = true`** e ordena os jogadores rigorosamente pelos seguintes critérios:

1. 🥇 **Total de Pontos (`total_pontos`)**: Soma ponderada de pontos obtidos na liga (Mensal $\times$ 3 + Relâmpago $\times$ 2) (`DESC`).
2. ⚔️ **Vitórias Mensais (`total_vitorias`)**: Soma de vitórias em torneios mensais da liga (`DESC`).
3. 📊 **Aproveitamento % (`aproveitamento`)**: $\frac{\text{Vitórias}}{\text{Vitórias} + \text{Derrotas}} \times 100$ (`DESC`).
4. 🛡️ **Menor Número de Derrotas (`total_derrotas`)**: Quantidade de derrotas na liga (`ASC`).
5. 🎯 **Média de Colocação (`media_colocacao`)**: Média aritmética das colocações (`ASC NULLS LAST`).
6. 🏁 **Participações (`participacoes`)**: Quantidade total de torneios disputados na liga (`DESC`).

### 3.3. Títulos e Tops

- **Título (🏆)**: Registrado quando a colocação do jogador no torneio for igual a `1` (`colocacao_manual = 1`).
- **Top Cut (🎯)**: Registrado quando a colocação for $\le 4$ (ou menor/igual ao limite `top_cut` configurado no torneio).

### 3.4. Algoritmo de Pontuação do Meta Call (Tier List)

O Meta Call calcula o desempenho competitivo de cada deck dentro de uma determinada banlist (apenas no formato `ADVANCED`) através da fórmula de **Score Composto**:

$$\text{Score} = (\text{Uso} \times 1) + (\text{Tops} \times 3) + (\text{Títulos} \times 5) + (\text{Winrate Percentual} \times 10)$$

Com base no Score ordenado decrescente, os decks são agrupados em Tiers:
- **Tier S**: 1º deck de maior score.
- **Tier A**: 2º e 3º decks.
- **Tier B**: 4º ao 6º decks.
- **Tier C**: Decks restantes.

---

## 📡 4. Mapeamento de Endpoints da API (Backend)

### 📊 Ranking (`/ranking`)
- `GET /ranking`: Retorna a tabela completa de classificação a partir da view `public.ranking_geral`.

### 👤 Jogadores (`/jogadores`)
- `GET /jogadores`: Lista resumida de todos os jogadores (ID, nickname, nome).
- `POST /jogadores` *(Admin)*: Cadastra um novo jogador.
- `PUT /jogadores/:id` *(Admin)*: Atualiza dados do jogador.
- `DELETE /jogadores/:id` *(Admin)*: Remove um jogador.
- `GET /jogadores/:id/detalhes`: Retorna o relatório completo de estatísticas do jogador:
  - Estatísticas segregadas: Liga, Fora da Liga e Geral.
  - Histórico de decks utilizados e seu respectivo Winrate.
  - Últimos 10 resultados para cálculo dinâmico de *Hot Streak*.

### 🏆 Torneios (`/torneios`)
- `GET /torneios`: Lista torneios filtrados por ano, tipo, banlist e se inclui futuros (`includeFuture=true`).
- `GET /torneios/next`: Retorna o próximo torneio agendado ($\ge \text{data atual}$).
- `GET /torneios/upcoming`: Retorna lista de todos os torneios futuros.
- `GET /torneios/:id/classificacao`: Retorna a classificação completa do torneio ordenando posições automáticas/manuais.
- `POST /torneios` *(Admin)*: Cria torneio vinculando automaticamente à banlist ativa.
- `PUT /torneios/:id` *(Admin)*: Edita dados de um torneio.
- `DELETE /torneios/:id` *(Admin)*: Remove um torneio.

### 🎮 Participações (`/participacoes`)
- `GET /participacoes`: Lista todas as participações de jogadores em torneios.
- `POST /participacoes` *(Admin)*: Inscreve um jogador em um torneio com seu deck, V/D/E e colocação manual.
- `PUT /participacoes/:id` *(Admin)*: Atualiza os dados de uma participação.
- `DELETE /participacoes/:id` *(Admin)*: Remove uma participação.

### 🚫 Banlists (`/banlists`)
- `GET /banlists`: Lista todas as banlists ordenadas por data de início.
- `POST /banlists` *(Admin)*: Cadastra nova banlist.
- `PATCH /banlists/:id/ativar` *(Admin)*: Transação SQL que desativa todas as banlists e ativa a banlist selecionada.

### ⚙️ Tipos de Torneio (`/tipotorneio`)
- `GET /tipotorneio`: Lista formatos de torneio e seus códigos de modelo (`WLD`, `FIXO`, `SEM_RANKING`).
- `POST /tipotorneio`, `PUT /tipotorneio/:id`, `DELETE /tipotorneio/:id` *(Admin)*: CRUD de tipos de torneio.

### 📈 Stats / Analytics (`/stats`)
- `GET /stats/banlist/:id`: Calcula estatísticas detalhadas de decks e resultados por jogador sob determinada banlist.

### 🔐 Admin (`/admin`)
- `POST /admin/login`: Valida a senha contra `process.env.ADMIN_SECRET`.
- `GET /admin/teste`, `GET /admin/status` *(Admin)*: Testes de conectividade e autorização admin.

---

## 💻 5. Funcionalidades e Interfaces Frontend

### 1. **Ranking Geral (`/`)**
- **Pódio**: Exibe em destaque visual os 3 primeiros colocados.
- **Tabela**: Exibe posições, pontuação, vitórias, derrotas, empates, aproveitamento, média de colocação e número de títulos/tops.
- **Modal de Regras**: Explica detalhadamente aos usuários os 6 critérios de desempate.

### 2. **Torneios (`/torneios` e `/torneios/:id`)**
- **Filtros por Ano, Formato e Banlist**: Permite explorar o histórico competitivo.
- **Detalhamento do Torneio**: Mostra o deck de cada participante, vitórias/derrotas e a colocação obtida.

### 3. **Meta Call / Metagame (`/meta`)**
- **Gráfico de Pizza (Recharts)**: Exibe a fatia de uso dos 5 decks mais populares na banlist selecionada.
- **Visão por Tier (S, A, B, C)**: Cards interativos com *Winrate*, quantidade de *players únicos*, *tops* e *títulos*.
- **Drilldown**: Expansão do card para visualizar os jogadores específicos que conquistaram posições com aquele deck.

### 4. **Página de Detalhes do Jogador (`/jogador/:id`)**
- **Hot Streak Widget**: Exibe selos dinâmicos (`🔥 ON FIRE - 2 TOPS`, `🔥🔥 HOT STREAK - 3 TOPS`, `🔥🔥🔥 DOMINANDO - 4 TOPS`) baseados no desempenho recente.
- **Módulo de Comparação X-vs-Y**: Permite selecionar qualquer outro duelista cadastrado e comparar lado a lado Vitórias, Derrotas, Winrate, Pontos da Liga, Títulos e Tops com realce em verde para quem leva vantagem na estatística.
- **Segmentação por Contexto**: Painéis organizados para Torneios da Liga, Torneios fora da Liga e Geral.
- **Winrate por Deck**: Lista de decks jogados com o aproveitamento individual.

### 5. **Banlists (`/banlists`)**
- Apresenta o histórico das banlists cadastradas no sistema com indicação visual da banlist atualmente ativa.

### 6. **Painel Administrativo (`/ajustes`)**
- **Autenticação**: Protegido por modal de senha administrativa mantida em `localStorage`.
- **Aba Jogadores**: Cadastro, alteração de nickname/nome e exclusão.
- **Aba Torneios**: Criação de torneios vinculados à banlist ativa, configuração de `top_cut` e tipo.
- **Aba Participações**: Lançamento de partidas por jogador e deck com validação de unicidade (`jogador_id` + `torneio_id`).
- **Aba Banlists**: Cadastro e ativação com 1 clique de banlists.

### 7. **Rodapé Global (Footer Widget)**
- Exibe automaticamente o banner inteligente do **Próximo Torneio** agendado, buscando dados em tempo real da rota `GET /torneios/next`.

---

## 🔐 6. Segurança e Autenticação Admin

O acesso às rotas administrativas do backend utiliza o middleware `adminMiddleware` em [`backend/src/middleware/admin.js`](file:///D:/GitHub/liga-fcs-yugioh/backend/src/middleware/admin.js).

- Requisições protegidas exigem o cabeçalho HTTP:
  ```http
  x-admin-key: <ADMIN_SECRET>
  ```
- O frontend envia essa chave através do utilitário `adminFetch.js`, garantindo que apenas usuários autenticados realizem alterações no banco de dados.

---

## 🚀 7. Diretrizes para Futuras Alterações e Modificações

Se você estiver planejando realizar alterações nesta codebase no futuro, siga estas diretrizes:

1. **Adicionar Novos Modelos de Pontuação de Torneio**:
   - Atualize os tipos na tabela `tipo_torneio`.
   - Caso crie um novo `modelo_codigo`, atualize o cálculo do `pontos_liga` na rota `backend/src/routes/jogadores.js` e na view `ranking_geral`.

2. **Alterar a View do Ranking (`ranking_geral`)**:
   - Ao alterar as colunas da view no PostgreSQL/Supabase, certifique-se de manter a compatibilidade de ordenação utilizada em `backend/src/routes/ranking.js`.

3. **Inclusão de Novos Métodos de Autenticação**:
   - Atualmente a autenticação admin utiliza chave simples via variável `ADMIN_SECRET`. Caso futuramente seja adotado JWT/Supabase Auth, substitua o `adminMiddleware` sem afetar as rotas de leitura pública.

4. **Testes Automatizados (Próximos Passos de QA)**:
   - Adicionar testes de integração (Supertest + Jest) para os endpoints de `/stats` e `/ranking`.
   - Adicionar testes E2E com Cypress para o fluxo de lançamento de participações no painel admin.

---

*Documento atualizado e sincronizado com o código-fonte em Agosto de 2026.*
