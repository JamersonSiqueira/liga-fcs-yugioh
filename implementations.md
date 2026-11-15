# 🚀 Implementações Futuras e Arquitetura da Liga FCS Yu-Gi-Oh

Este documento serve como guia técnico oficial para o desenvolvimento das próximas fases do projeto **Liga FCS Yu-Gi-Oh**. Cada seção foi projetada para ser implementada em branches separadas, respeitando a estabilidade do banco de dados e a experiência competitiva dos jogadores.

---


## 📌 Roteiro de Implementações Futuras

---

### 1. ~~Perfil do Jogador: Histórico de Torneios (Liga vs Off-Liga)~~ ✅ [CONCLUÍDO - v1.5 Giant Rex]
> **Status:** ✅ Concluído e implementado na versão 1.5 - Giant Rex.

#### Objetivo Concluído
Permite que qualquer visitante clique em um duelista e visualize a lista completa de todos os torneios disputados com abas interativas (`Todos`, `🏆 Liga`, `⚔️ Off-Liga`), badges de colocação (🥇 Campeão, 🎯 Top Cut), deck usado, placar de vitórias/derrotas e pontos somados.

#### Backend (`/jogadores/:id/detalhes`)
* Consulta segura (apenas `SELECT`):
  ```sql
  select
    t.id as torneio_id,
    t.nome as torneio_nome,
    t.data_inicio,
    tt.nome as tipo_torneio,
    tt.modelo_codigo,
    (tt.modelo_codigo <> 'SEM_RANKING') as is_liga,
    p.deck,
    p.vitorias,
    p.derrotas,
    coalesce(p.empates, 0) as empates,
    p.colocacao_manual,
    case
      when tt.modelo_codigo = 'WLD' then (p.vitorias * coalesce(tt.pontuacao_vitoria, 3))
      when tt.modelo_codigo = 'FIXO' then coalesce(p.pontuacao_final, 0)
      else 0
    end as pontos_ganhos
  from participacao_torneio p
  join torneio t on t.id = p.torneio_id
  join tipo_torneio tt on tt.id = t.tipo_id
  where p.jogador_id = $1
  order by t.data_inicio desc;
  ```

#### Frontend (`JogadorDetalhe.jsx`)
* **Filtros por Aba:** `[ Todos ]` `[ 🏆 Torneios da Liga ]` `[ ⚔️ Off-Liga ]`
* **Cards / Linhas Informativas:**
  * Nome do torneio e data;
  * Deck utilizado;
  * Placar da partida (ex: `3V - 1D`);
  * Badges de destaque: 🥇 Campeão (se colocação = 1), 🎯 Top Cut (se colocação $\le 4$), ou colocação ordinal;
  * Pontos somados para a corrida da liga (`+9 pts`, etc.).

---

### 2. ~~O Torneio do Top 8 (Playoffs da Liga) e Gerenciamento de Fotos~~ ✅ [CONCLUÍDO - Playoffs 2026]
> **Status:** ✅ Concluído e implementado na branch `feature/top8-highlight`.

#### Objetivo Concluído
Implementação do sistema completo de Playoffs da Liga FCS para a elite dos 8 melhores duelistas da temporada regular, integrando o lançamento de resultados manuais gerados pelo software oficial da Konami (**KCGN**), respeito à regra de tempo e *Double Loss*, mural holográfico, finais diretas, pódio oficial e gerenciador administrativo de fotos dos duelistas com compressão via Canvas no navegador.

#### 1. Banco de Dados e Storage (Supabase)
* **Coluna de Foto:** `ALTER TABLE jogador ADD COLUMN IF NOT EXISTS foto_url text;`
* **Tabela de Configuração:**
  ```sql
  CREATE TABLE IF NOT EXISTS top8_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ano int NOT NULL UNIQUE DEFAULT 2026,
    status varchar(20) NOT NULL DEFAULT 'pendente', -- 'pendente', 'em_andamento', 'concluido'
    fase_atual varchar(30) DEFAULT 'mural',          -- 'mural', 'rodadas', 'finais', 'finalizado'
    campeao_id uuid REFERENCES jogador(id),
    vice_id uuid REFERENCES jogador(id),
    terceiro_id uuid REFERENCES jogador(id)
  );
  ```
* **Tabela de Confrontos:**
  ```sql
  CREATE TABLE IF NOT EXISTS top8_partidas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ano int NOT NULL DEFAULT 2026,
    rodada varchar(30) NOT NULL, -- 'rodada_1' a 'rodada_7', 'final', 'terceiro_lugar'
    jogador1_id uuid REFERENCES jogador(id) ON DELETE CASCADE,
    jogador2_id uuid REFERENCES jogador(id) ON DELETE CASCADE,
    vitorias_j1 int DEFAULT 0,
    vitorias_j2 int DEFAULT 0,
    empates int DEFAULT 0,
    concluida boolean DEFAULT false,
    created_at timestamp DEFAULT now()
  );
  ```
* **Supabase Storage:** Bucket público `jogadores` para servir avatares em alta performance com persistência garantida.

#### 2. Backend (`backend/src/routes/top8.js` e `backend/src/index.js`)
* **Rotas Disponibilizadas em `/top8`:**
  * `GET /top8/config`: Status, fase ativa de exibição e dados do pódio com fotos e nicknames.
  * `PUT /top8/config`: Atualização administrativa de fase (`mural`, `rodadas`, `finais`, `finalizado`) e pódio.
  * `GET /top8/classificados`: Os 8 primeiros da temporada regular com *Seed #1 a #8*, foto, deck mais frequente, winrate e número de tops.
  * `GET /top8/partidas`: Confrontos das 7 rodadas e finais, além da tabela calculada dinamicamente.
  * `POST /top8/partida` e `PUT /top8/partida/:id`: Lançamento e edição dos placares do KCGN.
  * `DELETE /top8/partida/:id`: Remoção de partidas.
* **Regra de Tempo Oficial do Yu-Gi-Oh! (KCGN / KDE Tournament Policy):**
  * Quando o tempo de 50 minutos encerra sem um vencedor de 2 games (ex: `1x0` ou `1x1` no tempo), a partida é computada como **Double Loss (Dupla Derrota)**.
  * Ambos os duelistas recebem **+1 Derrota**, **0 pontos** e contabilizam na coluna `DL`.
* **Uploads e Payload:** Configurado `express.json({ limit: '15mb' })` no Express para receber uploads com folga.

#### 3. Gerenciador de Fotos dos Duelistas (`AdminJogadoresManager.jsx`)
* **Filtros de Exibição:** `[ Todos ]`, `[ 📸 Com Foto ]` e `[ 👤 Sem Foto ]` com busca textual em tempo real.
* **Compressão no Navegador (HTML5 Canvas):** Imagens redimensionadas para max 450px e convertidas para JPEG 0.85 (~35KB), gerando redução de mais de 97% de peso antes de enviar ao backend/Supabase.
* **Modal de Upload com Métricas Reais:** Exibe o tamanho original, o tamanho comprimido e a porcentagem exata de economia antes de confirmar.

#### 4. Painel de Controle do Top 8 (`AdminTop8Manager.jsx`)
* **Nova Aba no Painel Admin (`/ajustes`):** Gestão visual dedicada aos playoffs.
* **Lançamento Manual do KCGN:** Lançador rodada por rodada (Rodadas 1 a 7, Grande Final e Disputa de 3º).
* **Alerta Inteligente de Double Loss:** Detecta placares de empate ou tempo e avisa o organizador que ambos receberão derrota.
* **Controle de Exibição:** Alterne entre Mural, 7 Rodadas, Finais e Pódio Oficial com um clique.

#### 5. Apresentação Pública de Elite (`Top8Showcase.jsx` e `Ranking.jsx`)
* **Mural Holográfico dos 8 Classificados:** Cards estilo eSports com bordas gradiente anime, avatar/foto, deck, seed e estatísticas.
* **Tabela Responsiva das 7 Rodadas:** 
  * Totalmente otimizada para mobile com `min-w-[620px]` e scroll suave sem esmagar colunas.
  * Coluna padronizada **`DL` (Double Loss)** com largura fixa (`w-12 text-center` e container `w-6 h-5`), eliminando desvios e ziguezagues visuais.
  * Dica visual de navegação horizontal no smartphone.
* **Cards de Confronto que Nunca Quebram:**
  * Placar central com `shrink-0 whitespace-nowrap min-w-[56px] tabular-nums` que impede quebras de linha verticais no mobile.
  * Truncamento inteligente de nomes compridos (`truncate min-w-0`).
  * Badge destacada para partidas que terminaram em Double Loss por tempo.
* **Finais Decisivas e Pódio:** Grande Final dourada (1º x 2º), Disputa de 3º Lugar e Pódio com troféu, coroa e animações sutis.
* **Privacidade dos Critérios Técnicos:** Nenhuma menção a KCGN ou siglas internas visível para os duelistas; apenas a ordem oficial limpa e elegante.
* **Temporada Regular Retrátil:** A classificação da fase de grupos fica logo abaixo com botão expansível/colapsável.

---

### 3. Hall da Fama e Ligas Anteriores (Histórico Manual)
> **Branch Sugerida:** `feature/hall-da-fama`

#### Objetivo
Dar crédito e registrar os campeões de edições passadas (ex: 2024, 2025 ou torneios históricos) sem a necessidade de cadastrar todas as rodadas antigas do passado.

#### Estrutura Técnica
* **Tabela no Supabase:**
  ```sql
  create table if not exists hall_da_fama (
    id uuid default gen_random_uuid() primary key,
    ano int not null,
    edicao_nome text not null,
    campeao_nome text not null,
    campeao_deck text,
    vice_nome text,
    vice_deck text,
    terceiro_nome text,
    terceiro_deck text,
    descricao text,
    foto_url text,
    created_at timestamp default now()
  );
  ```
* **Painel Admin:** Tela simplificada para adicionar, editar ou remover registros do Hall da Fama.
* **Página Pública (`/hall-da-fama`):** Timeline ou galeria de honra com cards dos campeões de cada temporada.

---

### 4. Preparação para a Temporada 2027 (Múltiplas Ligas)
> **Branch Sugerida:** `feature/temporadas-historico`

#### Estrutura Técnica
* **Aproveitamento da coluna `ano`:** A tabela `torneio` já armazena `ano`.
* **Filtros por Temporada na API:**
  * `GET /ranking?ano=2027`
  * `GET /torneios?ano=2027`
  * `GET /stats?ano=2027`
* **Dropdown no Header do Frontend:**
  * Seletor de Temporada ativo:
    * Ao selecionar **2026**: Exibe o Top 8 finalizado, pódio e classificação congelada daquele ano.
    * Ao selecionar **2027**: Exibe a nova temporada ativa zerada.
* **Filtro no Admin:**
  * O painel administrativo terá filtro por ano nas abas de Torneios e Participações para evitar sobrecarga visual de anos anteriores.
