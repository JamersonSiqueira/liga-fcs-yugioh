import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

/*
========================
GET - listar jogadores
========================
*/
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

/*
========================
POST - criar jogador
========================
*/
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

/*
========================
PUT - editar jogador
========================
*/
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

/*
========================
DELETE - remover jogador
========================
*/
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

export default router
