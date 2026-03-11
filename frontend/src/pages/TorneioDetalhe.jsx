import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function TorneioDetalhe() {

  const { id } = useParams()

  const [classificacao, setClassificacao] = useState([])
  const [torneioNome, setTorneioNome] = useState("")

  useEffect(() => {

    fetch(`http://localhost:3000/torneios/${id}/classificacao`)
      .then(res => res.json())
      .then(data => {

        setClassificacao(data)

        if (data.length > 0) {
          setTorneioNome(data[0].torneio_nome)
        }

      })
      .catch(err => console.log(err))

  }, [id])

  // TOP 3 jogadores apenas
  const podium = classificacao.slice(0, 3)
  
  const deckStats = {}

  classificacao.forEach(player => {

  const deck = player.deck || "Não informado"

  if (!deckStats[deck]) {
    deckStats[deck] = 0
  }

  deckStats[deck]++

})

    const deckRanking = Object.entries(deckStats)
    .sort((a, b) => b[1] - a[1])

  return (

    <div>

      <h1 className="text-3xl font-bold text-white mb-6">
        {torneioNome}
      </h1>


      {/* PODIUM */}

      {podium.length > 0 && (

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
                  {player.nickname}
                </div>

                <div className="text-sm text-sky-400">
                  {player.deck}
                </div>

              </div>

            )

          })}

        </div>

      )}


      {/* TABELA */}

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
                  {player.colocacao}
                </td>

                <td className="p-3 text-white">
                  {player.nickname}
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

      
        {/* META DO TORNEIO */}

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

          <tr
            key={deck}
            className="border-t border-slate-800 hover:bg-slate-800"
          >

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