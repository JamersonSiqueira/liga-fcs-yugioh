import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()

app.use(cors())
app.use(express.json())

// Rota teste
app.get('/', (req, res) => {
  res.send('Base da API do Yugioh')
})

/*
========================
RANKING GERAL
========================
*/
app.get('/ranking', async (req, res) => {
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

/*
========================
LISTAR JOGADORES
========================
*/
app.get('/jogadores', async (req, res) => {
  try {
    const result = await pool.query(`
      select * from jogador
      order by nickname
    `)

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/*
========================
LISTAR TORNEIOS
========================
*/
app.get('/torneios', async (req, res) => {
  try {
    const result = await pool.query(`
      select * from torneio
      order by data_inicio desc
    `)

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})