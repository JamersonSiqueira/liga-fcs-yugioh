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

/*
========================
POST - Upload de Foto de Jogador
========================
*/
router.post('/upload-foto', adminMiddleware, async (req, res) => {
  const { imagemBase64, filename } = req.body

  if (!imagemBase64) {
    return res.status(400).json({ error: "Nenhuma imagem fornecida" })
  }

  try {
    const ext = filename ? filename.split('.').pop() : 'jpg'
    const cleanBase64 = imagemBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(cleanBase64, 'base64')
    const finalName = `jogador_${Date.now()}.${ext}`

    // Tentar upload para o Supabase Storage APENAS se configurado via variáveis de ambiente
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY

    if (supabaseUrl && serviceKey) {
      try {
        const storageUrl = `${supabaseUrl}/storage/v1/object/jogadores/${finalName}`
        const storageRes = await fetch(storageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': `image/${ext === 'png' ? 'png' : 'jpeg'}`,
            'Authorization': `Bearer ${serviceKey}`
          },
          body: buffer
        })

        if (storageRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/jogadores/${finalName}`
          return res.json({ url: publicUrl })
        }
      } catch (e) {
        console.warn("Storage upload fallback:", e.message)
      }
    }

    // Fallback seguro: armazena a imagem comprimida (~35KB) diretamente em base64/dataURI
    const mimeType = imagemBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${cleanBase64}`
    res.json({ url: dataUri })

  } catch (error) {
    console.error("Erro no upload de foto:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router