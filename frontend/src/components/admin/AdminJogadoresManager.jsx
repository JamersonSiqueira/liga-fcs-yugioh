import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function AdminJogadoresManager() {

  const [jogadores, setJogadores] = useState([])

  const [nickname, setNickname] = useState("")
  const [nome, setNome] = useState("")

  const [editandoId, setEditandoId] = useState(null)

  async function carregarJogadores() {

    const res = await fetch(`${API_URL}/jogadores`)
    const data = await res.json()

    setJogadores(data)

  }

    useEffect(() => {

    async function carregar() {

    const res = await fetch(`${API_URL}/jogadores`)
    const data = await res.json()

    setJogadores(data)

    }

    carregar()

    }, [])


  async function salvarJogador() {

    if (!nickname) {
      alert("Nickname é obrigatório")
      return
    }

    let url = `${API_URL}/jogadores`
    let method = "POST"

    if (editandoId) {
      url = `${API_URL}/jogadores/${editandoId}`
      method = "PUT"
    }

    const res = await fetchAdmin(url, {
      method,
      body: JSON.stringify({
        nickname,
        nome
      })
    })

    if (res && res.ok) {

      setNickname("")
      setNome("")
      setEditandoId(null)

      carregarJogadores()

    }

  }

  function editarJogador(j) {

    setEditandoId(j.id)
    setNickname(j.nickname)
    setNome(j.nome || "")

  }

  async function deletarJogador(id) {

    if (!confirm("Deseja remover este jogador?")) return

    const res = await fetchAdmin(
      `${API_URL}/jogadores/${id}`,
      {
        method: "DELETE"
      }
    )

    if (res && res.ok) {
      carregarJogadores()
    }

  }

  function cancelarEdicao() {

    setEditandoId(null)
    setNickname("")
    setNome("")

  }

  return (

    <div className="grid gap-6">

      {/* FORM */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl text-white font-bold mb-4">

          {editandoId ? "Editar Jogador" : "Criar Jogador"}

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
            onClick={salvarJogador}
            className="bg-sky-600 hover:bg-sky-500 text-white py-2 rounded"
          >
            {editandoId ? "Salvar Alterações" : "Criar Jogador"}
          </button>

          {editandoId && (

            <button
              onClick={cancelarEdicao}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
            >
              Cancelar edição
            </button>

          )}

        </div>

      </div>


      {/* LISTA */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h2 className="text-xl text-white font-bold mb-4">
          Jogadores cadastrados
        </h2>

        <div className="grid gap-2">

          {jogadores.map(j => (

            <div
              key={j.id}
              className="flex justify-between items-center bg-slate-800 p-3 rounded"
            >

              <div className="text-white">

                <div className="font-semibold">
                  {j.nickname}
                </div>

                <div className="text-sm text-slate-400">
                  {j.nome}
                </div>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => editarJogador(j)}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => deletarJogador(j.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
                >
                  Deletar
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}

export default AdminJogadoresManager