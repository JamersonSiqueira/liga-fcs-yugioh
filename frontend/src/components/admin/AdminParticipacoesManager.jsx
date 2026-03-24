import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"

function AdminParticipacoesManager() {

  const [torneios, setTorneios] = useState([])
  const [jogadores, setJogadores] = useState([])
  const [participacoes, setParticipacoes] = useState([])

  const [torneioSelecionado, setTorneioSelecionado] = useState("")
  const [jogador, setJogador] = useState("")
  const [deck, setDeck] = useState("")
  const [vitorias, setVitorias] = useState(0)
  const [derrotas, setDerrotas] = useState(0)
  const [colocacaoManual, setColocacaoManual] = useState("")

  const [editandoId, setEditandoId] = useState(null)

  useEffect(() => {

    let active = true

    async function load() {

      const resTorneios = await fetchAdmin("/torneios")
      const resJogadores = await fetchAdmin("/jogadores")

      if (!active) return

      if (resTorneios && resTorneios.ok) {
        const data = await resTorneios.json()
        if (active) setTorneios(data)
      }

      if (resJogadores && resJogadores.ok) {
        const data = await resJogadores.json()
        if (active) setJogadores(data)
      }

    }

    load()

    return () => {
      active = false
    }

  }, [])

  useEffect(() => {

    let active = true

    async function loadParticipacoes() {

      if (!torneioSelecionado) {
        setParticipacoes([])
        return
      }

      const res = await fetchAdmin(
        `/torneios/${torneioSelecionado}/classificacao`
      )

      if (!res || !res.ok || !active) return

      const data = await res.json()
      if (active) setParticipacoes(data)
    }

    loadParticipacoes()

    return () => {
      active = false
    }

  }, [torneioSelecionado])

  function limparFormulario() {
    setJogador("")
    setDeck("")
    setVitorias(0)
    setDerrotas(0)
    setColocacaoManual("")
    setEditandoId(null)
  }

  async function salvarParticipacao() {

    if (!torneioSelecionado) {
      alert("Selecione um torneio")
      return
    }

    if (!jogador) {
      alert("Selecione um jogador")
      return
    }

    const body = {
      jogador_id: jogador,
      torneio_id: torneioSelecionado,
      vitorias: Number(vitorias),
      derrotas: Number(derrotas),
      deck,
      colocacao_manual: colocacaoManual ? Number(colocacaoManual) : null
    }

    let res

    if (editandoId !== null) {
      res = await fetchAdmin(`/participacoes/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
    } else {
      res = await fetchAdmin("/participacoes", {
        method: "POST",
        body: JSON.stringify(body)
      })
    }

    if (!res) return

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Erro ao salvar participação")
      return
    }

    limparFormulario()

    const reload = await fetchAdmin(
      `/torneios/${torneioSelecionado}/classificacao`
    )

    if (reload && reload.ok) {
      const data = await reload.json()
      setParticipacoes(data)
    }
  }

  function editarParticipacao(p) {
    setEditandoId(p.id)
    setJogador(p.jogador_id)
    setDeck(p.deck)
    setVitorias(p.vitorias)
    setDerrotas(p.derrotas)
    setColocacaoManual(p.colocacao_manual || "")
  }

  async function deletarParticipacao(id) {

    if (!confirm("Deseja deletar esta participação?")) return

    const res = await fetchAdmin(`/participacoes/${id}`, {
      method: "DELETE"
    })

    if (!res) return

    if (!res.ok) {
      alert("Erro ao deletar")
      return
    }

    const reload = await fetchAdmin(
      `/torneios/${torneioSelecionado}/classificacao`
    )

    if (reload && reload.ok) {
      const data = await reload.json()
      setParticipacoes(data)
    }
  }

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h2 className="text-xl text-white font-bold mb-4">
        Gerenciar Participações
      </h2>

      <div className="grid gap-3 mb-6">

        <select
          value={torneioSelecionado}
          onChange={(e) => setTorneioSelecionado(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          <option value="">Selecione um torneio</option>
          {torneios.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        <select
          value={jogador}
          onChange={(e) => setJogador(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          <option value="">Selecione um jogador</option>
          {jogadores.map(j => (
            <option key={j.id} value={j.id}>
              {j.nickname}
            </option>
          ))}
        </select>

        <input
          placeholder="Deck"
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

        <input
          type="number"
          placeholder="Colocação manual (opcional)"
          value={colocacaoManual}
          onChange={(e) => setColocacaoManual(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <div className="flex gap-2">

          <button
            onClick={salvarParticipacao}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded"
          >
            {editandoId !== null ? "Salvar edição" : "Adicionar participação"}
          </button>

          {editandoId !== null && (
            <button
              onClick={limparFormulario}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-white text-left">

          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th>Jogador</th>
              <th>Deck</th>
              <th>Vitórias</th>
              <th>Derrotas</th>
              <th>Pontos</th>
              <th>Colocação</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {participacoes.map(p => (
              <tr key={p.id} className="border-b border-slate-800">
                <td>{p.nickname}</td>
                <td>{p.deck}</td>
                <td>{p.vitorias}</td>
                <td>{p.derrotas}</td>
                <td>{p.pontuacao_final}</td>
                <td>{p.colocacao || "-"}</td>

                <td className="flex gap-2">
                  <button
                    onClick={() => editarParticipacao(p)}
                    className="text-yellow-400"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deletarParticipacao(p.id)}
                    className="text-red-400"
                  >
                    Deletar
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>

  )
}

export default AdminParticipacoesManager