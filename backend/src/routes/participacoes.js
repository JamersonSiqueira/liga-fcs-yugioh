import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

/*
========================
GET - listar participações
========================
*/
router.get('/', async (req, res) => {

  try {

    const result = await pool.query(`
      select
        p.id,
        j.nickname,
        j.id as jogador_id,
        t.nome as torneio,
        t.id as torneio_id,
        p.vitorias,
        p.derrotas,
        p.deck,
        p.colocacao_manual
      from participacao_torneio p
      join jogador j on j.id = p.jogador_id
      join torneio t on t.id = p.torneio_id
      order by t.data_inicio desc
    `)

    res.json(result.rows)

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})

/*
========================
POST - criar participação
========================
*/
router.post('/', adminMiddleware, async (req, res) => {

  const {
    jogador_id,
    torneio_id,
    vitorias,
    derrotas,
    deck,
    colocacao_manual
  } = req.body

  try {

    const result = await pool.query(
      `insert into participacao_torneio
       (jogador_id, torneio_id, vitorias, derrotas, deck, colocacao_manual)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [jogador_id, torneio_id, vitorias, derrotas, deck, colocacao_manual || null]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {

    console.log(error)

    if (error.code === '23505') {
      return res.status(409).json({
        error: "Este jogador já está inscrito neste torneio"
      })
    }

    res.status(500).json({ error: error.message })

  }

})

/*
========================
PUT - editar participação
========================
*/
router.put('/:id', adminMiddleware, async (req, res) => {

  const { id } = req.params
  const { vitorias, derrotas, deck, colocacao_manual } = req.body

  try {

    const result = await pool.query(`
      update participacao_torneio
      set vitorias = $1,
          derrotas = $2,
          deck = $3,
          colocacao_manual = $4
      where id = $5
      returning *
    `, [vitorias, derrotas, deck, colocacao_manual || null, id])

    res.json(result.rows[0])

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})

/*
========================
DELETE - remover participação
========================
*/
router.delete('/:id', adminMiddleware, async (req, res) => {

  const { id } = req.params

  try {

    await pool.query(`
      delete from participacao_torneio
      where id = $1
    `, [id])

    res.json({ message: "Participação removida" })

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})

export default router