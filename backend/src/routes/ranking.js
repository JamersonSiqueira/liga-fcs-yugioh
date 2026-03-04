import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      select *
      from public.ranking_geral
      order by 
        total_pontos desc,
        total_vitorias desc,
        aproveitamento desc,
        total_derrotas asc,
        participacoes desc;
    `)

    res.json(result.rows)

  } catch (error) {
    console.log("ERRO COMPLETO:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router