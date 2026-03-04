import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

/*
========================
GET - listar banlists
========================
*/
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      select *
      from banlist
      order by data_inicio desc nulls last, created_at desc
    `)

    res.json(result.rows)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

/*
========================
POST - criar banlist
========================
*/
router.post('/', adminMiddleware, async (req, res) => {
  const { nome, data_inicio } = req.body

  try {
    const result = await pool.query(
      `
      insert into banlist (nome, data_inicio)
      values ($1, $2)
      returning *
      `,
      [nome, data_inicio]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

/*
========================
PATCH - ativar banlist
========================
*/
router.patch('/:id/ativar', adminMiddleware, async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('begin')

    // Desativa todas
    await pool.query(`
      update banlist
      set ativa = false
    `)

    // Ativa a escolhida
    const result = await pool.query(
      `
      update banlist
      set ativa = true
      where id = $1
      returning *
      `,
      [id]
    )

    await pool.query('commit')

    res.json(result.rows[0])

  } catch (error) {
    await pool.query('rollback')
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

export default router