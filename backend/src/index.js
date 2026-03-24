import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import jogadoresRoutes from './routes/jogadores.js'
import torneiosRoutes from './routes/torneios.js'
import participacoesRoutes from './routes/participacoes.js'
import banlistsRoutes from './routes/banlists.js'
import rankingRoutes from './routes/ranking.js'
import tiposTorneioRoutes from './routes/tiposTorneio.js'
import adminRoutes from './routes/admin.js'
import statsRoutes from './routes/stats.js'

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://liga-fcs-yugioh.vercel.app/"
]

app.use(cors({
  origin: "*"
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Base da API do Yugioh')
})

app.use('/ranking', rankingRoutes)
app.use('/jogadores', jogadoresRoutes)
app.use('/torneios', torneiosRoutes)
app.use('/participacoes', participacoesRoutes)
app.use('/banlists', banlistsRoutes)
app.use('/tipotorneio',tiposTorneioRoutes)
app.use('/stats', statsRoutes)
app.use('/admin', adminRoutes)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})