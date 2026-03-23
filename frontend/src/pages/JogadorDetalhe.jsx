import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_URL } from "../services/api"

function JogadorDetalhe() {

  const { id } = useParams()

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    let isMounted = true

    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/jogadores/${id}/detalhes`)
        const data = await res.json()

        if (isMounted) {
          setDados(data)
        }

      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }

  }, [id])

  if (loading) {
    return <p className="text-white">Carregando...</p>
  }

  if (!dados?.jogador) {
    return <p className="text-red-400">Jogador não encontrado</p>
  }

  const j = dados.jogador

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        {j.nickname}
      </h1>

      {/* =========================
          BLOCO LIGA
      ========================= */}
      <div className="mb-8 border border-slate-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-white">
          Torneios da Liga
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Vitórias</p>
            <p className="text-2xl font-bold text-green-400">
              {j.vitorias_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Derrotas</p>
            <p className="text-2xl font-bold text-red-400">
              {j.derrotas_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Empates</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.empates_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Pontos</p>
            <p className="text-2xl font-bold text-sky-400">
              {j.pontos_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Participações</p>
            <p className="text-2xl font-bold text-white">
              {j.participacoes_liga || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          BLOCO FORA DA LIGA
      ========================= */}
      <div className="mb-8 border border-slate-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-white">
          Torneios fora da Liga (Semanais/OTS/Konami)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Vitórias</p>
            <p className="text-2xl font-bold text-green-400">
              {j.vitorias_fora || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Derrotas</p>
            <p className="text-2xl font-bold text-red-400">
              {j.derrotas_fora || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Empates</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.empates_fora || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Participações</p>
            <p className="text-2xl font-bold text-white">
              {j.participacoes_fora || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          BLOCO GERAL
      ========================= */}
      <div className="mb-10 border border-slate-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-white">
          Geral
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Vitórias</p>
            <p className="text-2xl font-bold text-green-400">
              {j.vitorias_total || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Derrotas</p>
            <p className="text-2xl font-bold text-red-400">
              {j.derrotas_total || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Empates</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.empates_total || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          DECKS
      ========================= */}
      <h2 className="text-xl font-bold mb-4">
        Decks utilizados
      </h2>

      <div className="grid gap-3">

        {dados.decks.length === 0 && (
          <p className="text-slate-400">Nenhum deck registrado</p>
        )}

        {dados.decks.map((d, i) => {

          const total = Number(d.vitorias) + Number(d.derrotas)
          const winrate = total > 0
            ? ((d.vitorias / total) * 100).toFixed(1)
            : 0

          return (
            <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">

              <div>
                <div className="font-bold text-white">
                  {d.deck}
                </div>
                <div className="text-sm text-slate-400">
                  Usado {d.vezes_usado}x
                </div>
              </div>

              <div className="text-right">
                <div className="text-sky-400 font-bold">
                  {winrate}% WR
                </div>
                <div className="text-sm text-slate-300">
                  {d.vitorias}W / {d.derrotas}L
                </div>
              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}

export default JogadorDetalhe