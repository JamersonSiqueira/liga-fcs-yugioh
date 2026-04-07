import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      select
        id,
        nickname,
        nome
      from jogador
      order by nickname
    `)

    res.json(result.rows)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', adminMiddleware, async (req, res) => {
  const { nickname, nome } = req.body

  try {
    const result = await pool.query(
      `insert into jogador (nickname, nome)
       values ($1, $2)
       returning *`,
      [nickname, nome]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params
  const { nickname, nome } = req.body

  try {
    const result = await pool.query(`
      update jogador
      set nickname = $1,
          nome = $2
      where id = $3
      returning *
    `, [nickname, nome, id])

    res.json(result.rows[0])

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(`
      delete from jogador
      where id = $1
    `, [id])

    res.json({ message: "Jogador removido com sucesso" })

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id/detalhes', async (req, res) => {
  const { id } = req.params

  try {

    const stats = await pool.query(`
      select
        j.id,
        j.nickname,

        -- 🔹 LIGA
        sum(p.vitorias) filter (where tt.modelo_codigo <> 'SEM_RANKING') as vitorias_liga,
        sum(p.derrotas) filter (where tt.modelo_codigo <> 'SEM_RANKING') as derrotas_liga,
        sum(p.empates) filter (where tt.modelo_codigo <> 'SEM_RANKING') as empates_liga,

        sum(
          case
            when tt.modelo_codigo = 'WLD' then p.vitorias * 3
            when tt.modelo_codigo = 'FIXO' then coalesce(p.pontuacao_final, 0)
            else 0
          end
        ) filter (where tt.modelo_codigo <> 'SEM_RANKING') as pontos_liga,

        count(*) filter (where tt.modelo_codigo <> 'SEM_RANKING') as participacoes_liga,

        -- 🏆 TITULOS LIGA
        count(*) filter (
          where tt.modelo_codigo <> 'SEM_RANKING'
          and p.colocacao_manual = 1
        ) as titulos_liga,

        -- 🎯 TOPS LIGA
        count(*) filter (
          where tt.modelo_codigo <> 'SEM_RANKING'
          and p.colocacao_manual is not null
          and p.colocacao_manual <= 4
        ) as tops_liga,

        -- 🔹 FORA DA LIGA
        sum(p.vitorias) filter (where tt.modelo_codigo = 'SEM_RANKING') as vitorias_fora,
        sum(p.derrotas) filter (where tt.modelo_codigo = 'SEM_RANKING') as derrotas_fora,
        sum(p.empates) filter (where tt.modelo_codigo = 'SEM_RANKING') as empates_fora,

        count(*) filter (where tt.modelo_codigo = 'SEM_RANKING') as participacoes_fora,

        -- 🏆 TITULOS FORA
        count(*) filter (
          where tt.modelo_codigo = 'SEM_RANKING'
          and p.colocacao_manual = 1
        ) as titulos_fora,

        -- 🎯 TOPS FORA
        count(*) filter (
          where tt.modelo_codigo = 'SEM_RANKING'
          and p.colocacao_manual is not null
          and p.colocacao_manual <= 4
        ) as tops_fora,

        -- 🔹 GERAL
        coalesce(sum(p.vitorias), 0) as vitorias_total,
        coalesce(sum(p.derrotas), 0) as derrotas_total,
        coalesce(sum(p.empates), 0) as empates_total,

        -- 🏆 TOTAL
        count(*) filter (where p.colocacao_manual = 1) as titulos,

        -- 🎯 TOTAL
        count(*) filter (
          where p.colocacao_manual is not null
          and p.colocacao_manual <= 4
        ) as tops

      from jogador j
      left join participacao_torneio p on p.jogador_id = j.id
      left join torneio t on t.id = p.torneio_id
      left join tipo_torneio tt on tt.id = t.tipo_id

      where j.id = $1
      group by j.id
    `, [id])

    const decks = await pool.query(`
      select
        p.deck,
        count(*) as vezes_usado,
        sum(p.vitorias) as vitorias,
        sum(p.derrotas) as derrotas
      from participacao_torneio p
      where p.jogador_id = $1
        and p.deck is not null
        and p.deck <> ''
      group by p.deck
      order by vezes_usado desc
    `, [id])

    const ultimosResultados = await pool.query(`
        select
          t.data_inicio,
          p.colocacao_manual
        from participacao_torneio p
        join torneio t on t.id = p.torneio_id
        where p.jogador_id = $1
          and p.colocacao_manual is not null
        order by t.data_inicio desc
        limit 10
    `, [id])

    res.json({
      jogador: stats.rows[0] || null,
      decks: decks.rows,
      ultimos_resultados: ultimosResultados.rows
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

export default router