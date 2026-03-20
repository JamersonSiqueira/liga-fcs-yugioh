import { useState } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function AdminJogador() {

  const [nickname, setNickname] = useState("")
  const [nome, setNome] = useState("")

  async function criarJogador() {

    const res = await fetchAdmin(
      `${API_URL}/jogadores`,
      {
        method: "POST",
        body: JSON.stringify({
          nickname,
          nome
        })
      }
    )

    if (res && res.ok) {

      alert("Jogador criado!")

      setNickname("")
      setNome("")

    }

  }

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h2 className="text-xl text-white font-bold mb-4">
        Criar Jogador
      </h2>

      <div className="grid gap-3">

        <input
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <input
          placeholder="Nome real"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <button
          onClick={criarJogador}
          className="bg-sky-600 hover:bg-sky-500 text-white py-2 rounded"
        >
          Criar Jogador
        </button>

      </div>

    </div>

  )

}

export default AdminJogador