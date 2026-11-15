import { useEffect, useState } from "react"
import { getRanking } from "../services/api"
import Container from "../components/Container"
import RankingTable from "../components/RankingTable"
import Podium from "../components/Podium"
import Top8Showcase from "../components/Top8Showcase"

function Ranking() {
  const [ranking, setRanking] = useState([])
  const [showHelp, setShowHelp] = useState(false)
  const [showRegularTable, setShowRegularTable] = useState(true)

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

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Liga FCS Ranking
        </h1>

        <button
          onClick={() => setShowHelp(true)}
          className="text-sky-400 text-sm hover:text-sky-300 transition"
        >
          ℹ️ Critérios de desempate
        </button>

      </div>

      <p className="text-slate-400 mb-6">
        Ranking oficial dos duelistas da Liga FCS - Feira Championship Series
      </p>

      {/* 🔥 MURAL, RODADAS E FINAIS DO TOP 8 */}
      <Top8Showcase />

      {/* 📋 TABELA DA TEMPORADA REGULAR (COM TOGGLE) */}
      <div className="border-t border-slate-800/80 pt-8 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋 Classificação da Temporada Regular</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {ranking.length} duelistas
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pontuação acumulada ao longo de todos os torneios válidos da temporada
            </p>
          </div>

          <button
            onClick={() => setShowRegularTable(prev => !prev)}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
          >
            {showRegularTable ? "▲ Ocultar Classificação Geral" : "▼ Expandir Classificação Geral"}
          </button>
        </div>

        {showRegularTable && (
          <div className="space-y-6 animate-fadeIn">
            <Podium ranking={ranking} />
            <RankingTable ranking={ranking} />
          </div>
        )}
      </div>

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