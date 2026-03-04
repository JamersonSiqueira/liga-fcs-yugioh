import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

// POST - criar jogador
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

export default router