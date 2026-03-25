import { useState } from "react"
import logo from "../../assets/admin.png"

import AdminJogadoresManager from "../../components/admin/AdminJogadoresManager.jsx"
import AdminTorneiosManager from "../../components/admin/AdminTorneiosManager"
import AdminParticipacoesManager from "../../components/admin/AdminParticipacoesManager"
import AdminBanlistManager from "../../components/admin/AdminBanlistManager"

function AdminPanel() {

  const [aba, setAba] = useState("jogadores")
  const [logado, setLogado] = useState(() => {
  return !!localStorage.getItem("admin_key")
})
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")


async function handleLogin() {
  if (!senha) {
    setErro("Digite a senha")
    return
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ senha })
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.error || "Erro ao logar")
      return
    }

    localStorage.setItem("admin_key", senha)
    setLogado(true)
    setErro("")

  } catch (err) {
    setErro("Erro de conexão com servidor: "+err)
  }
}

  function handleLogout() {
    localStorage.removeItem("admin_key")
    setLogado(false)
    setSenha("")
  }

  function renderConteudo() {

    if (aba === "jogadores") {
      return <AdminJogadoresManager />
    }

    if (aba === "torneios") {
      return <AdminTorneiosManager />
    }

    if (aba === "participacoes") {
      return <AdminParticipacoesManager />
    }

    if (aba === "banlists") {
      return <AdminBanlistManager />
    }

  }

  // 🔐 TELA DE LOGIN
  if (!logado) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-sm text-center">

          {/* LOGO */}
          <img
            src={logo}
            alt="Logo"
            className="h-64 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold mb-4">
            EPA, TA ACHANDO QUE TÁ AONDE?
          </h2>

          <input
            type="password"
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white mb-3"
          />

          {erro && (
            <p className="text-red-400 text-sm mb-2">
              {erro}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-sky-600 hover:bg-sky-500 transition text-white py-2 rounded"
          >
            Entrar
          </button>

        </div>

      </div>
    )
  }

  // 🔥 PAINEL NORMAL
  return (

    <div className="max-w-5xl mx-auto p-6 grid gap-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold text-white">
          Painel Administrativo
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Sair
        </button>

      </div>

      <div className="flex gap-2 flex-wrap">

        <button
          onClick={() => setAba("jogadores")}
          className={`px-4 py-2 rounded ${
            aba === "jogadores"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Jogadores
        </button>

        <button
          onClick={() => setAba("torneios")}
          className={`px-4 py-2 rounded ${
            aba === "torneios"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Torneios
        </button>

        <button
          onClick={() => setAba("participacoes")}
          className={`px-4 py-2 rounded ${
            aba === "participacoes"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Participações
        </button>

        <button
          onClick={() => setAba("banlists")}
          className={`px-4 py-2 rounded ${
            aba === "banlists"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Banlists
        </button>

      </div>

      <div>
        {renderConteudo()}
      </div>

    </div>

  )

}

export default AdminPanel