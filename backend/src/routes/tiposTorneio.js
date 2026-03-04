import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

// LISTAR (pode deixar público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM tipo_torneio
      ORDER BY nome
    `)

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// CRIAR (ADMIN)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { nome, modelo_codigo } = req.body

    const result = await pool.query(`
      INSERT INTO tipo_torneio (nome, modelo_codigo)
      VALUES ($1, $2)
      RETURNING *
    `, [nome, modelo_codigo])

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// UPDATE (ADMIN)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { nome, modelo_codigo } = req.body

    const result = await pool.query(`
      UPDATE tipo_torneio
      SET nome = $1,
          modelo_codigo = $2
      WHERE id = $3
      RETURNING *
    `, [nome, modelo_codigo, id])

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


// DELETE (ADMIN)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(`
      DELETE FROM tipo_torneio
      WHERE id = $1
    `, [id])

    res.json({ message: 'Tipo removido com sucesso' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router