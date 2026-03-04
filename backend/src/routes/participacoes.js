import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

// POST - criar participação
router.post('/', adminMiddleware, async (req, res) => {
  const {
    jogador_id,
    torneio_id,
    vitorias,
    derrotas,
    deck
  } = req.body

  try {
    const result = await pool.query(
      `insert into participacao_torneio
       (jogador_id, torneio_id, vitorias, derrotas, deck)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [jogador_id, torneio_id, vitorias, derrotas, deck]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

export default router