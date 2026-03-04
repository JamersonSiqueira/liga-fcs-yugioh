export function adminMiddleware(req, res, next) {
  const adminKey = req.headers['x-admin-key']

  if (!adminKey) {
    return res.status(401).json({ error: 'Chave admin não enviada' })
  }

  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Chave admin inválida' })
  }

  next()
}