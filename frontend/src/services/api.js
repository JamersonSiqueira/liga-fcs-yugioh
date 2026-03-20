export const API_URL = import.meta.env.VITE_API_URL

export async function getRanking() {
  const response = await fetch(`${API_URL}/ranking`)
  return response.json()
}