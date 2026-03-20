import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function AdminParticipacao() {

  const [jogador, setJogador] = useState("")
  const [torneio, setTorneio] = useState("")
  const [deck, setDeck] = useState("")
  const [vitorias, setVitorias] = useState("")
  const [derrotas, setDerrotas] = useState("")

  const [jogadores, setJogadores] = useState([])
  const [torneios, setTorneios] = useState([])

  useEffect(() => {

    fetch(`${API_URL}/jogadores`)
      .then(res => res.json())
      .then(data => setJogadores(data))

    fetch(`${API_URL}/torneios`)
      .then(res => res.json())
      .then(data => setTorneios(data))

  }, [])

  async function criarParticipacao() {

    const res = await fetchAdmin(
      `${API_URL}/participacoes`,
      {
        method: "POST",
        body: JSON.stringify({
          jogador_id: jogador,
          torneio_id: torneio,
          vitorias: Number(vitorias),
          derrotas: Number(derrotas),
          deck
        })
      }
    )

    if (res && res.ok) {

      alert("Participação registrada!")

      setDeck("")
      setVitorias("")
      setDerrotas("")

    }

  }

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h2 className="text-xl text-white font-bold mb-4">
        Registrar Participação
      </h2>

      <div className="grid gap-3">

        <select
          value={jogador}
          onChange={(e) => setJogador(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          <option value="">Jogador</option>

          {jogadores.map(j => (
            <option key={j.id} value={j.id}>
              {j.nickname}
            </option>
          ))}

        </select>

        <select
          value={torneio}
          onChange={(e) => setTorneio(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          <option value="">Torneio</option>

          {torneios.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}

        </select>

        <input
          placeholder="Deck usado"
          value={deck}
          onChange={(e) => setDeck(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <input
          type="number"
          placeholder="Vitórias"
          value={vitorias}
          onChange={(e) => setVitorias(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <input
          type="number"
          placeholder="Derrotas"
          value={derrotas}
          onChange={(e) => setDerrotas(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <button
          onClick={criarParticipacao}
          className="bg-sky-600 hover:bg-sky-500 text-white py-2 rounded"
        >
          Registrar Participação
        </button>

      </div>

    </div>

  )

}

export default AdminParticipacao