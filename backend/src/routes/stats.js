import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.get('/banlist/:id', async (req, res) => {

  const { id } = req.params

  try {

    // =========================
    // 🔹 BASE CONSOLIDADA
    // =========================
    const decksQuery = await pool.query(`
      with base as (
        select
          p.deck,

          count(*) as uso,

          count(distinct p.jogador_id) as players_unicos,

          sum(p.vitorias) as vitorias,
          sum(p.derrotas) as derrotas,

          count(*) filter (
            where p.colocacao_manual is not null
            and p.colocacao_manual <= coalesce(t.top_cut, 4)
          ) as top_cut,

          count(*) filter (
            where p.colocacao_manual = 1
          ) as titulos

        from participacao_torneio p
        join torneio t on t.id = p.torneio_id
        join tipo_torneio tt on tt.id = t.tipo_id

        where t.banlist_id = $1
          and tt.formato_codigo = 'ADVANCED'

        group by p.deck
      )

      select
        deck,
        uso,
        players_unicos,
        vitorias,
        derrotas,
        top_cut,
        titulos,

        case
          when (vitorias + derrotas) > 0 then
            round((vitorias::decimal / (vitorias + derrotas)) * 100, 2)
          else 0
        end as winrate,

        (
          uso * 1 +
          top_cut * 3 +
          titulos * 5 +
          (
            case
              when (vitorias + derrotas) > 0 then
                (vitorias::decimal / (vitorias + derrotas)) * 10
              else 0
            end
          )
        ) as score

      from base
      order by score desc
    `, [id])


    // =========================
    // 🔹 RESULTADOS COMPLETOS (COM RANKING REAL)
    // =========================
    const resultadosQuery = await pool.query(`
      with ranking as (
        select
          p.deck,
          p.jogador_id,
          j.nickname,
          t.nome as torneio_nome,
          p.colocacao_manual,

          row_number() over (
            partition by p.torneio_id
            order by p.pontuacao_final desc
          ) as colocacao_auto

        from participacao_torneio p
        join torneio t on t.id = p.torneio_id
        join jogador j on j.id = p.jogador_id
        join tipo_torneio tt on tt.id = t.tipo_id

        where t.banlist_id = $1
          and tt.formato_codigo = 'ADVANCED'
      )

      select
        deck,
        nickname,
        torneio_nome,
        coalesce(colocacao_manual, colocacao_auto) as colocacao

      from ranking
      order by deck asc, colocacao asc
    `, [id])


    res.json({
      decks: decksQuery.rows,
      resultados: resultadosQuery.rows
    })

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})

export default router