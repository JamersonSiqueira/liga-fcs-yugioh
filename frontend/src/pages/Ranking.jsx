import { useEffect, useState } from "react"
import { getRanking } from "../services/api"
import Container from "../components/Container"
import RankingTable from "../components/RankingTable"
import Podium from "../components/Podium"

function Ranking() {
  const [ranking, setRanking] = useState([])
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const data = await getRanking()
      setRanking(data)
    }

    fetchData()
  }, [])

  return (
    <Container>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">

        <h1 className="text-3xl font-bold text-white">
          Liga FCS Ranking
        </h1>

        <button
          onClick={() => setShowHelp(true)}
          className="text-sky-400 text-sm"
        >
          ℹ️ Critérios de desempate
        </button>

      </div>

      <p className="text-slate-400 mb-6">
        Ranking geral dos duelistas da Liga FCS - Feira Championship Series
      </p>

      <Podium ranking={ranking} />
      <RankingTable ranking={ranking} />

      {/* MODAL HELP */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-slate-900 p-6 rounded-xl max-w-lg w-full">

            <h2 className="text-xl font-bold mb-4">
              Como o Ranking é calculado
            </h2>

            <p className="text-sm text-slate-300 mb-3">
              O ranking geral respeita os seguintes critérios de desempate:
            </p>

            <ul className="text-sm text-slate-300 space-y-1 mb-4">
              <li>1° Pontuação total</li>
              <li>2° Vitórias em Torneios Mensais</li>
              <li>3° Aproveitamento (%)</li>
              <li>4° Menor número de derrotas</li>
              <li>5° Performance média em colocações</li>
              <li>6° Participações</li>
            </ul>

            <div className="text-sm text-slate-300 mb-4 space-y-2">

              <p>
                <strong>Performance média:</strong> é a média das posições finais
                dos jogadores nos torneios.
              </p>

              <p className="text-slate-400">
                Exemplo: um jogador que ficou em 3º e 5º lugar terá média 4.0,
                ficando à frente de alguém com média maior.
              </p>

              <p>
                Quanto <strong>menor</strong> a média, melhor o desempenho.
              </p>

            </div>

            <p className="text-sm text-slate-400 mb-4">
              Apenas torneios válidos para ranking são considerados (Torneios Mensais com 3 pts por vitória e Torneios Relâmpago com 2 pts por vitória).
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="bg-sky-600 px-4 py-2 rounded"
            >
              Fechar
            </button>

          </div>

        </div>
      )}

    </Container>
  )
}

export default Ranking