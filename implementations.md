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

### 2. O Torneio do Top 8 (Playoffs da Liga)
> **Branch Sugerida:** `feature/top8-showcase`

#### Formato de Disputa
1. **Fase de Pontos (Round Robin - 7 Rodadas):**
   * Os 8 classificados jogam todos contra todos ao longo de 7 rodadas.
   * Tabela exclusiva com vitórias, derrotas e desempates do Top 8.
2. **Finais Diretas:**
   * **Grande Final (🏆):** 1º Colocado da fase de 7 rodadas vs 2º Colocado.
   * **Disputa de 3º Lugar (🥉):** 3º Colocado vs 4º Colocado.
3. **Pódio Final:**
   * Destaque comemorativo para Campeão, Vice e 3º Colocado.

#### Upload de Fotos dos Duelistas
* **Armazenamento:** Utilizar o **Supabase Storage** (bucket público `jogadores`), já que o disco do Render é volátil.
* **Painel Admin:** Campo de upload na aba de Jogadores que faz o upload do arquivo para o bucket e salva a URL pública no campo `foto_url` da tabela `jogador`.
* **Fallback:** Caso o duelista não possua foto, exibir card com avatar padrão temático de Yu-Gi-Oh.

#### Apresentação Visual no Site
* **Mural dos 8 Classificados:** Cards estilizados no topo da tela com foto, deck e seed (#1 ao #8).
* **Quadro de Resultados:** Visual das 7 rodadas e os confrontos finais.
* **Tabela Regular:** A tabela de pontos do ano fica abaixo do Top 8, colapsada com botão de expandir (*"Ver Classificação da Temporada Regular"*).

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
