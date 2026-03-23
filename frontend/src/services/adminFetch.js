import { API_URL } from "./api"

export async function fetchAdmin(url, options = {}) {
  const key = localStorage.getItem("admin_key")

  // 🔥 evita duplicação de baseURL
  const finalUrl = url.startsWith("http")
    ? url
    : `${API_URL || ""}${url}`

  try {
    const res = await fetch(finalUrl, {
      ...options,
      headers: {
        "x-admin-key": key,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    })

    // 🔐 auth inválida
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("admin_key")

      alert("Sessão expirada ou inválida")

      window.location.href = "/"
      return null
    }

    return res

  } catch (error) {
    console.error("Erro de conexão:", error)
    return null
  }
}