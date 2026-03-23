import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { API_URL } from "../services/api"

function TorneioDetalhe() {

  const { id } = useParams()

  const [classificacao, setClassificacao] = useState([])
  const [torneioNome, setTorneioNome] = useState("")
  const [temTopCut, setTemTopCut] = useState(false)
  const [topCutQtd, setTopCutQtd] = useState(0)

  useEffect(() => {

    let active = true

    async function carregar() {

      try {

        const res = await fetch(`${API_URL}/torneios/${id}/classificacao`)
        const data = await res.json()

        if (!active) return

        if (!Array.isArray(data)) {
          console.error("Erro na resposta da API:", data)
          setClassificacao([])
          return
        }

        setClassificacao(data)

        if (data.length > 0) {
          setTorneioNome(data[0].torneio_nome || "Torneio")
          setTemTopCut(data[0].tem_top_cut)
          setTopCutQtd(data[0].top_cut || 0)
        }

      } catch (err) {
        console.log(err)
        setClassificacao([])
      }

    }

    carregar()

    return () => {
      active = false
    }

  }, [id])

  // 🔹 TOP CUT
  const topCut = temTopCut ? classificacao.slice(0, topCutQtd) : []

  // 🔹 PÓDIO (fallback ou opcional)
  const podium = classificacao.slice(0, 3)

  // 🔹 META DECK
  const deckStats = {}

  classificacao.forEach(player => {
    const deck = player.deck || "Não informado"
    deckStats[deck] = (deckStats[deck] || 0) + 1
  })

  const deckRanking = Object.entries(deckStats)
    .sort((a, b) => b[1] - a[1])

  return (

    <div>

      <h1 className="text-3xl font-bold text-white mb-6">
        {torneioNome}
      </h1>

      {/* =========================
          TOP CUT
      ========================= */}
      {temTopCut && topCut.length > 0 && (

        <div className="mb-10">

  <h2 className="text-2xl font-bold text-white mb-4">
    Top {topCutQtd}
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">

    {topCut.map((player, index) => {

      let badge = `#${index + 1}`
      let border = "border-sky-500"
      let bg = "bg-slate-900"
      let text = "text-sky-400"

      if (index === 0) {
        badge = "🥇 Campeão"
        border = "border-yellow-400"
        bg = "bg-yellow-500/10"
        text = "text-yellow-300"
      }

      if (index === 1) {
        badge = "🥈 Vice"
        border = "border-slate-300"
        bg = "bg-slate-400/10"
        text = "text-slate-200"
      }

      if (index === 2) {
        badge = "🥉 3º Lugar"
        border = "border-orange-400"
        bg = "bg-orange-500/10"
        text = "text-orange-300"
      }

      if (index === 3) {
        badge = "🔷 Top 4"
        border = "border-sky-500"
        bg = "bg-sky-500/10"
        text = "text-sky-300"
      }

      return (
        <div
          key={player.jogador_id}
          className={`${bg} border ${border} rounded-xl p-4 transition hover:scale-105`}
        >

          {/* BADGE */}
          <div className={`text-sm font-bold mb-2 ${text}`}>
            {badge}
          </div>

          {/* NOME */}
          <div className="text-white font-semibold">
            <Link
              to={`/jogador/${player.jogador_id}`}
              className="hover:text-sky-400"
            >
              {player.nickname}
            </Link>
          </div>

          {/* DECK */}
          <div className="text-sm text-sky-400">
            {player.deck}
          </div>

          {/* SCORE */}
          <div className="text-xs text-slate-400 mt-1">
            {player.vitorias}W / {player.derrotas}L
          </div>

        </div>
      )

    })}

  </div>

</div>

      )}

      {/* =========================
          PÓDIO (SÓ SE NÃO TIVER TOP CUT)
      ========================= */}
      {!temTopCut && podium.length > 0 && (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">

          {podium.map((player, index) => {

            let medal = "🥇"
            let border = "border-yellow-400"

            if (index === 1) {
              medal = "🥈"
              border = "border-slate-400"
            }

            if (index === 2) {
              medal = "🥉"
              border = "border-orange-400"
            }

            return (

              <div
                key={player.jogador_id}
                className={`bg-slate-900 border ${border} rounded-xl p-4`}
              >

                <div className="text-3xl mb-2">
                  {medal}
                </div>

                <div className="text-lg font-semibold text-white">
                  <Link
                    to={`/jogador/${player.jogador_id}`}
                    className="hover:text-sky-400"
                  >
                    {player.nickname}
                  </Link>
                </div>

                <div className="text-sm text-sky-400">
                  {player.deck}
                </div>

              </div>

            )

          })}

        </div>

      )}

      {/* =========================
          TABELA
      ========================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Jogador</th>
              <th className="p-3 text-left">Deck</th>
              <th className="p-3 text-right">Pts</th>
              <th className="p-3 text-right">W</th>
              <th className="p-3 text-right">L</th>
            </tr>
          </thead>

          <tbody>

            {classificacao.map(player => (

              <tr
                key={player.jogador_id}
                className="border-t border-slate-800 hover:bg-slate-800"
              >

                <td className="p-3 font-bold text-slate-300">
                  {player.colocacao}°
                </td>

                <td className="p-3 text-white">
                  <Link
                    to={`/jogador/${player.jogador_id}`}
                    className="hover:text-sky-400 font-semibold"
                  >
                    {player.nickname}
                  </Link>
                </td>

                <td className="p-3 text-slate-400">
                  {player.deck}
                </td>

                <td className="p-3 text-right text-sky-400 font-bold">
                  {player.pontuacao_final}
                </td>

                <td className="p-3 text-right">
                  {player.vitorias}
                </td>

                <td className="p-3 text-right">
                  {player.derrotas}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* =========================
          META
      ========================= */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold text-white mb-4">
          Meta do Torneio
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-3 text-left">Deck</th>
                <th className="p-3 text-right">Jogadores</th>
              </tr>
            </thead>

            <tbody>

              {deckRanking.map(([deck, total]) => (

                <tr key={deck} className="border-t border-slate-800">

                  <td className="p-3 text-white">
                    {deck}
                  </td>

                  <td className="p-3 text-right text-sky-400 font-bold">
                    {total}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default TorneioDetalhe