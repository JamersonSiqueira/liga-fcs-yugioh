import express from 'express'
import { pool } from '../db.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// POST - criar torneio
router.post('/', adminMiddleware, async (req, res) => {
  const { nome, tipo_id, data_inicio, tem_top_cut, top_cut } = req.body

  try {
    if (!data_inicio) {
      return res.status(400).json({ error: 'data_inicio é obrigatória' })
    }

    // Derivar ano automaticamente da data_inicio
    const ano = new Date(data_inicio).getFullYear()

    if (!ano || isNaN(ano)) {
      return res.status(400).json({ error: 'data_inicio inválida' })
    }

    // 1️⃣ Buscar banlist ativa
    const banlistResult = await pool.query(`
      select id
      from banlist
      where ativa = true
      limit 1
    `)

    if (banlistResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Nenhuma banlist ativa definida.'
      })
    }

    const banlist_id = banlistResult.rows[0].id

    // 2️⃣ Criar torneio já vinculado à banlist ativa
    const result = await pool.query(
      `insert into torneio (nome, tipo_id, data_inicio, ano, banlist_id, tem_top_cut, top_cut)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *`,
      [nome, tipo_id, data_inicio, ano, banlist_id, tem_top_cut || false, top_cut || null]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})


// GET - classificação de um torneio
router.get('/:id/classificacao', async (req, res) => {
  const { id } = req.params

  try {

    const result = await pool.query(`
      select
        p.id,
        t.nome as torneio_nome,
        t.tem_top_cut,
        t.top_cut,

        j.id as jogador_id,
        j.nickname,
        p.deck,
        p.vitorias,
        p.derrotas,

        case
          when tt.modelo_codigo = 'WLD' then (p.vitorias * 3)
          when tt.modelo_codigo = 'FIXO' then coalesce(p.pontuacao_final, 0)
          when tt.modelo_codigo = 'SEM_RANKING' then (p.vitorias * 3)
          else 0
        end as pontuacao_final,

        row_number() over (
          order by
            p.colocacao_manual asc nulls last,
            case
              when tt.modelo_codigo = 'WLD' then (p.vitorias * 3)
              when tt.modelo_codigo = 'FIXO' then coalesce(p.pontuacao_final, 0)
              when tt.modelo_codigo = 'SEM_RANKING' then (p.vitorias * 3)
              else 0
            end desc
        ) as colocacao

      from participacao_torneio p
      join jogador j on j.id = p.jogador_id
      join torneio t on t.id = p.torneio_id
      join tipo_torneio tt on tt.id = t.tipo_id

      where p.torneio_id = $1
    `, [id])

    res.json(result.rows)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})


/*
========================
GET - listar torneios (com filtros)
========================
*/
router.get('/', async (req, res) => {
  const { ano, tipo_id, banlist_id } = req.query
  try {
    let query = `
      select
      t.id,
      t.nome,
      t.tipo_id,
      t.data_inicio,
      tt.nome as tipo_torneio,
      tt.modelo_codigo,
      b.nome as banlist,
      t.tem_top_cut,
      t.top_cut
      from torneio t
      left join tipo_torneio tt on tt.id = t.tipo_id
      left join banlist b on b.id = t.banlist_id
    `

    const conditions = []
    const values = []

    // 🔹 Filtro por ano
    if (ano) {
      values.push(Number(ano))
      conditions.push(`t.ano = $${values.length}`)
    }

    // 🔹 Filtro por tipo
    if (tipo_id) {
      if (!isUUID(tipo_id)) {
        return res.status(400).json({ error: 'tipo_id inválido' })
      }

      values.push(tipo_id)
      conditions.push(`t.tipo_id = $${values.length}`)
    }

    // 🔹 Filtro por banlist
    if (banlist_id) {
      if (!isUUID(banlist_id)) {
        return res.status(400).json({ error: 'banlist_id inválido' })
      }

      values.push(banlist_id)
      conditions.push(`t.banlist_id = $${values.length}`)
    }

    if (conditions.length > 0) {
      query += ` where ` + conditions.join(' and ')
    }

    query += ` order by t.data_inicio desc`

    const result = await pool.query(query, values)

    res.json(result.rows)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
})

/*
========================
PUT - editar torneio
========================
*/
router.put('/:id', adminMiddleware, async (req, res) => {

  const { id } = req.params
  const { nome, tipo_id, data_inicio, tem_top_cut, top_cut } = req.body

  try {

    const ano = new Date(data_inicio).getFullYear()

    const result = await pool.query(`
      update torneio
      set nome = $1,
          tipo_id = $2,
          data_inicio = $3,
          ano = $4,
          tem_top_cut = $5,
          top_cut = $6
      where id = $7
      returning *
    `, [nome, tipo_id, data_inicio, ano, id])

    res.json(result.rows[0])

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})

/*
========================
DELETE - remover torneio
========================
*/
router.delete('/:id', adminMiddleware, async (req, res) => {

  const { id } = req.params

  try {

    await pool.query(`
      delete from torneio
      where id = $1
    `, [id])

    res.json({ message: "Torneio removido com sucesso" })

  } catch (error) {

    console.log(error)
    res.status(500).json({ error: error.message })

  }

})


export default router