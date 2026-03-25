import express from 'express'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

/*
========================
GET - testar acesso admin
========================
*/
router.get('/teste', adminMiddleware, (req, res) => {
  res.json({
    status: 'ok',
    mensagem: 'Acesso admin autorizado'
  })
})

/*
========================
GET - status da API
========================
*/
router.get('/status', adminMiddleware, (req, res) => {
  res.json({
    api: 'FCS League API',
    admin: true,
    status: 'operacional',
    timestamp: new Date()
  })
})

/*
========================
POST - login admin
========================
*/
router.post('/login', (req, res) => {
  const { senha } = req.body

  if (!senha) {
    return res.status(400).json({ error: "Senha obrigatória" })
  }

  if (senha !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Senha inválida" })
  }

  res.json({
    status: "ok",
    message: "Login autorizado"
  })
})

export default router