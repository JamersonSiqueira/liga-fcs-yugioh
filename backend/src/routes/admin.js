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

export default router