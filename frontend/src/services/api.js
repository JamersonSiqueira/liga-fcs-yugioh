const API_URL = "http://localhost:3000"

export async function getRanking() {
  const response = await fetch(`${API_URL}/ranking`)
  return response.json()
}