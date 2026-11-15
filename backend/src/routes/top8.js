import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

/*
==================================================
GET - Configuração atual do Top 8 (status, fase, pódio)
==================================================
*/
router.get('/config', async (req, res) => {
  try {
    const configResult = await pool.query(`
      select 
        c.id,
        c.ano,
        c.status,
        c.fase_atual,
        c.campeao_id,
        c.vice_id,
        c.terceiro_id,
        j1.nickname as campeao_nickname,
        j1.foto_url as campeao_foto,
        j2.nickname as vice_nickname,
        j2.foto_url as vice_foto,
        j3.nickname as terceiro_nickname,
        j3.foto_url as terceiro_foto
      from top8_config c
      left join jogador j1 on j1.id = c.campeao_id
      left join jogador j2 on j2.id = c.vice_id
      left join jogador j3 on j3.id = c.terceiro_id
      where c.ano = 2026
      limit 1
    `)

    if (configResult.rows.length === 0) {
      // Inserção padrão se não existir
      const inserted = await pool.query(`
        insert into top8_config (ano, status, fase_atual)
        values (2026, 'pendente', 'mural')
        returning *
      `)
      return res.json(inserted.rows[0])
    }

    res.json(configResult.rows[0])
  } catch (error) {
    console.error("Erro ao buscar config do Top 8:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
PUT - Atualizar Configuração do Top 8 (Admin)
==================================================
*/
router.put('/config', adminMiddleware, async (req, res) => {
  const { status, fase_atual, campeao_id, vice_id, terceiro_id } = req.body

  try {
    const result = await pool.query(`
      update top8_config
      set status = coalesce($1, status),
          fase_atual = coalesce($2, fase_atual),
          campeao_id = $3,
          vice_id = $4,
          terceiro_id = $5
      where ano = 2026
      returning *
    `, [status, fase_atual, campeao_id || null, vice_id || null, terceiro_id || null])

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar config do Top 8:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
GET - 8 Classificados da Fase Regular
==================================================
*/
router.get('/classificados', async (req, res) => {
  try {
    const result = await pool.query(`
      with top_ranking as (
        select 
          r.jogador_id,
          r.nickname,
          r.total_pontos,
          r.total_vitorias,
          r.total_derrotas,
          r.aproveitamento,
          r.titulos,
          r.tops,
          row_number() over (
            order by 
              r.total_pontos desc,
              r.total_vitorias desc,
              r.aproveitamento desc,
              r.total_derrotas asc,
              r.media_colocacao asc nulls last,
              r.participacoes desc
          ) as seed
        from public.ranking_geral r
        limit 8
      )
      select 
        tr.*,
        j.nome,
        j.foto_url,
        (
          select p.deck
          from participacao_torneio p
          where p.jogador_id = tr.jogador_id
            and p.deck is not null and p.deck <> ''
          group by p.deck
          order by count(*) desc, sum(p.vitorias) desc
          limit 1
        ) as deck_principal
      from top_ranking tr
      join jogador j on j.id = tr.jogador_id
      order by tr.seed asc
    `)

    res.json(result.rows)
  } catch (error) {
    console.error("Erro ao buscar classificados do Top 8:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
GET - Partidas e Classificação das 7 Rodadas do Top 8
==================================================
*/
router.get('/partidas', async (req, res) => {
  try {
    const partidasResult = await pool.query(`
      select 
        p.id,
        p.ano,
        p.rodada,
        p.jogador1_id,
        p.jogador2_id,
        p.vitorias_j1,
        p.vitorias_j2,
        p.empates,
        p.concluida,
        j1.nickname as jogador1_nickname,
        j1.foto_url as jogador1_foto,
        j2.nickname as jogador2_nickname,
        j2.foto_url as jogador2_foto
      from top8_partidas p
      left join jogador j1 on j1.id = p.jogador1_id
      left join jogador j2 on j2.id = p.jogador2_id
      where p.ano = 2026
      order by 
        case 
          when p.rodada = 'final' then 8
          when p.rodada = 'terceiro_lugar' then 9
          else cast(replace(p.rodada, 'rodada_', '') as int)
        end asc,
        p.id asc
    `)

    // Calcular tabela de classificação das 7 rodadas
    const tabelaMap = new Map()

    for (const p of partidasResult.rows) {
      if (p.rodada === 'final' || p.rodada === 'terceiro_lugar') continue

      // Iniciar jogador 1 se não existir
      if (p.jogador1_id && !tabelaMap.has(p.jogador1_id)) {
        tabelaMap.set(p.jogador1_id, {
          jogador_id: p.jogador1_id,
          nickname: p.jogador1_nickname,
          foto_url: p.jogador1_foto,
          jogos: 0,
          vitorias: 0,
          derrotas: 0,
          double_losses: 0,
          pontos: 0,
          sets_pro: 0,
          sets_contra: 0,
          saldo_sets: 0
        })
      }

      // Iniciar jogador 2 se não existir
      if (p.jogador2_id && !tabelaMap.has(p.jogador2_id)) {
        tabelaMap.set(p.jogador2_id, {
          jogador_id: p.jogador2_id,
          nickname: p.jogador2_nickname,
          foto_url: p.jogador2_foto,
          jogos: 0,
          vitorias: 0,
          derrotas: 0,
          double_losses: 0,
          pontos: 0,
          sets_pro: 0,
          sets_contra: 0,
          saldo_sets: 0
        })
      }

      if (p.concluida && p.jogador1_id && p.jogador2_id) {
        const j1 = tabelaMap.get(p.jogador1_id)
        const j2 = tabelaMap.get(p.jogador2_id)

        j1.jogos += 1
        j2.jogos += 1

        j1.sets_pro += p.vitorias_j1
        j1.sets_contra += p.vitorias_j2
        j2.sets_pro += p.vitorias_j2
        j2.sets_contra += p.vitorias_j1

        if (p.vitorias_j1 > p.vitorias_j2) {
          j1.vitorias += 1
          j1.pontos += 3
          j2.derrotas += 1
        } else if (p.vitorias_j2 > p.vitorias_j1) {
          j2.vitorias += 1
          j2.pontos += 3
          j1.derrotas += 1
        } else {
          // ⏱️ Regra oficial Yu-Gi-Oh! (KCGN / KDE):
          // Tempo esgotado sem 2 vitórias (ex: 1x1 ou 0x0) -> DOUBLE LOSS!
          // Ambos os duelistas recebem Derrota (+1 D) e 0 pontos na rodada.
          j1.derrotas += 1
          j2.derrotas += 1
          j1.double_losses += 1
          j2.double_losses += 1
        }

        j1.saldo_sets = j1.sets_pro - j1.sets_contra
        j2.saldo_sets = j2.sets_pro - j2.sets_contra
      }
    }

    const tabelaClassificacao = Array.from(tabelaMap.values()).sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos
      if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias
      if (b.saldo_sets !== a.saldo_sets) return b.saldo_sets - a.saldo_sets
      return b.sets_pro - a.sets_pro
    }).map((item, idx) => ({ ...item, posicao: idx + 1 }))

    res.json({
      partidas: partidasResult.rows,
      classificacao_top8: tabelaClassificacao
    })
  } catch (error) {
    console.error("Erro ao buscar partidas do Top 8:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
POST - Gerar Grade das 7 Rodadas do Round Robin (Admin)
==================================================
*/
router.post('/gerar-rodadas', adminMiddleware, async (req, res) => {
  const { jogadores_ids } = req.body

  try {
    let ids = jogadores_ids

    // Se não foi passada a lista de IDs, pega os 8 do ranking
    if (!ids || ids.length !== 8) {
      const topRanking = await pool.query(`
        select r.jogador_id
        from public.ranking_geral r
        order by 
          r.total_pontos desc,
          r.total_vitorias desc,
          r.aproveitamento desc,
          r.total_derrotas asc,
          r.media_colocacao asc nulls last,
          r.participacoes desc
        limit 8
      `)
      ids = topRanking.rows.map(r => r.jogador_id)
    }

    if (ids.length !== 8) {
      return res.status(400).json({ error: "É necessário exatamente 8 jogadores para o Top 8." })
    }

    // Limpar partidas anteriores do round-robin do ano
    await pool.query(`delete from top8_partidas where ano = 2026`)

    // Algoritmo clássico de Round Robin para 8 jogadores (Círculo com 1 fixo):
    // Jogadores indexados de 0 a 7
    const roundMatches = [
      // Rodada 1
      [[0, 7], [1, 6], [2, 5], [3, 4]],
      // Rodada 2
      [[0, 6], [7, 5], [1, 4], [2, 3]],
      // Rodada 3
      [[0, 5], [6, 4], [7, 3], [1, 2]],
      // Rodada 4
      [[0, 4], [5, 3], [6, 2], [7, 1]],
      // Rodada 5
      [[0, 3], [4, 2], [5, 1], [6, 7]],
      // Rodada 6
      [[0, 2], [3, 1], [4, 7], [5, 6]],
      // Rodada 7
      [[0, 1], [2, 7], [3, 6], [4, 5]]
    ]

    for (let r = 0; r < 7; r++) {
      const rodadaNome = `rodada_${r + 1}`
      const duelos = roundMatches[r]

      for (const [idx1, idx2] of duelos) {
        await pool.query(`
          insert into top8_partidas (ano, rodada, jogador1_id, jogador2_id, vitorias_j1, vitorias_j2, empates, concluida)
          values ($1, $2, $3, $4, 0, 0, 0, false)
        `, [2026, rodadaNome, ids[idx1], ids[idx2]])
      }
    }

    // Atualizar status para em_andamento e fase para rodada_1
    await pool.query(`
      update top8_config
      set status = 'em_andamento', fase_atual = 'rodada_1'
      where ano = 2026
    `)

    res.json({ message: "7 rodadas do Top 8 geradas com sucesso!" })
  } catch (error) {
    console.error("Erro ao gerar rodadas:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
POST - Lançar Partida do KCGN (Admin)
==================================================
*/
router.post('/partida', adminMiddleware, async (req, res) => {
  const { rodada, jogador1_id, jogador2_id, vitorias_j1, vitorias_j2, empates, concluida } = req.body

  if (!rodada || !jogador1_id || !jogador2_id) {
    return res.status(400).json({ error: "Rodada, Jogador 1 e Jogador 2 são obrigatórios." })
  }

  try {
    const result = await pool.query(`
      insert into top8_partidas (ano, rodada, jogador1_id, jogador2_id, vitorias_j1, vitorias_j2, empates, concluida)
      values (2026, $1, $2, $3, $4, $5, $6, $7)
      returning *
    `, [
      rodada,
      jogador1_id,
      jogador2_id,
      Number(vitorias_j1) || 0,
      Number(vitorias_j2) || 0,
      Number(empates) || 0,
      concluida !== undefined ? concluida : true
    ])

    // Se houver partida lançada, garante que o status está em_andamento
    await pool.query(`
      update top8_config
      set status = 'em_andamento'
      where ano = 2026 and status = 'pendente'
    `)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Erro ao lançar partida:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
PUT - Atualizar Resultado de uma Partida (Admin)
==================================================
*/
router.put('/partida/:id', adminMiddleware, async (req, res) => {
  const { vitorias_j1, vitorias_j2, empates, concluida } = req.body

  try {
    const result = await pool.query(`
      update top8_partidas
      set vitorias_j1 = coalesce($1, vitorias_j1),
          vitorias_j2 = coalesce($2, vitorias_j2),
          empates = coalesce($3, empates),
          concluida = coalesce($4, concluida)
      where id = $5
      returning *
    `, [vitorias_j1, vitorias_j2, empates, concluida, id])

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar partida:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
DELETE - Remover Partida Específica do Top 8 (Admin)
==================================================
*/
router.delete('/partida/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(`delete from top8_partidas where id = $1`, [id])
    res.json({ message: "Partida removida com sucesso." })
  } catch (error) {
    console.error("Erro ao remover partida:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
POST - Definir Finais (1ºx2º e 3ºx4º) (Admin)
==================================================
*/
router.post('/definir-finais', adminMiddleware, async (req, res) => {
  const { final_j1, final_j2, terceiro_j1, terceiro_j2 } = req.body

  try {
    // Remover finais antigas se houver
    await pool.query(`
      delete from top8_partidas 
      where ano = 2026 and rodada in ('final', 'terceiro_lugar')
    `)

    // Inserir Grande Final
    await pool.query(`
      insert into top8_partidas (ano, rodada, jogador1_id, jogador2_id, vitorias_j1, vitorias_j2, concluida)
      values (2026, 'final', $1, $2, 0, 0, false)
    `, [final_j1, final_j2])

    // Inserir Disputa de 3º Lugar
    await pool.query(`
      insert into top8_partidas (ano, rodada, jogador1_id, jogador2_id, vitorias_j1, vitorias_j2, concluida)
      values (2026, 'terceiro_lugar', $1, $2, 0, 0, false)
    `, [terceiro_j1, terceiro_j2])

    // Atualizar fase_atual para 'finais'
    await pool.query(`
      update top8_config
      set fase_atual = 'finais'
      where ano = 2026
    `)

    res.json({ message: "Confrontos finais do Top 8 definidos com sucesso!" })
  } catch (error) {
    console.error("Erro ao definir finais:", error)
    res.status(500).json({ error: error.message })
  }
})

/*
==================================================
DELETE - Resetar Partidas do Top 8 (Admin)
==================================================
*/
router.delete('/reset', adminMiddleware, async (req, res) => {
  try {
    await pool.query(`delete from top8_partidas where ano = 2026`)
    await pool.query(`
      update top8_config
      set status = 'pendente',
          fase_atual = 'mural',
          campeao_id = null,
          vice_id = null,
          terceiro_id = null
      where ano = 2026
    `)

    res.json({ message: "Top 8 resetado para o estado inicial (mural)." })
  } catch (error) {
    console.error("Erro ao resetar Top 8:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
