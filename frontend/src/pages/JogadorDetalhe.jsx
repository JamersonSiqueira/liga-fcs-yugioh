import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API_URL } from "../services/api"

function JogadorDetalhe() {

  const { id } = useParams()

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔥 COMPARAÇÃO
  const [jogadores, setJogadores] = useState([])
  const [jogadorComparado, setJogadorComparado] = useState("")
  const [dadosComparado, setDadosComparado] = useState(null)

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

  // 🔥 lista jogadores
  useEffect(() => {
    async function fetchJogadores() {
      try {
        const res = await fetch(`${API_URL}/jogadores`)
        const data = await res.json()

        setJogadores(data.filter(j => j.id !== id))
      } catch (err) {
        console.error(err)
      }
    }

    fetchJogadores()
  }, [id])

  // 🔥 dados comparado
  useEffect(() => {
    if (!jogadorComparado) return

    async function fetchComparado() {
      try {
        const res = await fetch(`${API_URL}/jogadores/${jogadorComparado}/detalhes`)
        const data = await res.json()
        setDadosComparado(data.jogador)
      } catch (err) {
        console.error(err)
      }
    }

    fetchComparado()
  }, [jogadorComparado])

  if (loading) {
    return <p className="text-white">Carregando...</p>
  }

  if (!dados?.jogador) {
    return <p className="text-red-400">Jogador não encontrado</p>
  }

  const j = dados.jogador

  // 🔥 streak
  const resultados = dados.ultimos_resultados || []

  function calcularStreakTop() {
    let streak = 0

    for (let r of resultados) {
      if (r.colocacao_manual <= 4) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  function getFireStatus() {
    const streak = calcularStreakTop()

    if (streak >= 4) return "🔥🔥🔥 DOMINANDO - 4 TOPS SEGUIDOS"
    if (streak >= 3) return "🔥🔥 HOT STREAK - 3 TOPS SEGUIDOS"
    if (streak >= 2) return "🔥 ON FIRE - 2 TOPS SEGUIDOS"
    return null
  }

  function getWinrate(v, d) {
    const total = Number(v) + Number(d)
    if (total === 0) return 0
    return (v / total) * 100
  }

  function getBetter(a, b) {
    const nA = Number(a)
    const nB = Number(b)

    if (nA > nB) return "text-green-400"
    if (nA < nB) return "text-red-400"
    return "text-slate-300"
  }

  const fireStatus = getFireStatus()

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        {j.nickname}

        {fireStatus && (
          <span className="text-sm bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
            {fireStatus}
          </span>
        )}
      </h1>

      {/* =========================
          🔥 COMPARATIVO
      ========================= */}
      <div className="mb-8 border border-purple-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-purple-400">
          Comparar com outro jogador
        </h2>

        <select
          className="w-full mb-4 p-2 rounded bg-slate-800 border border-slate-700"
          value={jogadorComparado}
          onChange={(e) => setJogadorComparado(e.target.value)}
        >
          <option value="">Selecione um jogador...</option>
          {jogadores.map(jg => (
            <option key={jg.id} value={jg.id}>
              {jg.nickname}
            </option>
          ))}
        </select>

        {jogadorComparado && (
          <button
            onClick={() => {
              setJogadorComparado("")
              setDadosComparado(null)
            }}
            className="mb-4 text-sm text-red-400 hover:text-red-300"
          >
            Limpar comparação
          </button>
        )}

        {dadosComparado && (
          <div className="grid grid-cols-3 gap-4 text-center items-center">

            <div></div>
            <div className="font-bold">{j.nickname}</div>
            <div className="font-bold text-purple-400">
              {dadosComparado.nickname}
            </div>

            <div className="text-slate-400">Vitórias (Mensal)</div>
            <div className={getBetter(j.vitorias_liga, dadosComparado.vitorias_liga)}>
              {j.vitorias_liga || 0}
            </div>
            <div className={getBetter(dadosComparado.vitorias_liga, j.vitorias_liga)}>
              {dadosComparado.vitorias_liga || 0}
            </div>

            <div className="text-slate-400">Vitórias Relâmpago ⚡</div>
            <div className={getBetter(j.vitorias_relampago, dadosComparado.vitorias_relampago)}>
              {j.vitorias_relampago || 0}
            </div>
            <div className={getBetter(dadosComparado.vitorias_relampago, j.vitorias_relampago)}>
              {dadosComparado.vitorias_relampago || 0}
            </div>

            <div className="text-slate-400">Derrotas</div>
            <div className={getBetter(dadosComparado.derrotas_total, j.derrotas_total)}>
              {j.derrotas_total || 0}
            </div>
            <div className={getBetter(j.derrotas_total, dadosComparado.derrotas_total)}>
              {dadosComparado.derrotas_total || 0}
            </div>

            <div className="text-slate-400">Winrate</div>
            <div className={getBetter(
              getWinrate(j.vitorias_total, j.derrotas_total),
              getWinrate(dadosComparado.vitorias_total, dadosComparado.derrotas_total)
            )}>
              {getWinrate(j.vitorias_total, j.derrotas_total).toFixed(1)}%
            </div>
            <div className={getBetter(
              getWinrate(dadosComparado.vitorias_total, dadosComparado.derrotas_total),
              getWinrate(j.vitorias_total, j.derrotas_total)
            )}>
              {getWinrate(dadosComparado.vitorias_total, dadosComparado.derrotas_total).toFixed(1)}%
            </div>

            <div className="text-slate-400">Pontos Liga</div>
            <div className={getBetter(j.pontos_liga, dadosComparado.pontos_liga)}>
              {j.pontos_liga || 0}
            </div>
            <div className={getBetter(dadosComparado.pontos_liga, j.pontos_liga)}>
              {dadosComparado.pontos_liga || 0}
            </div>

            <div className="text-slate-400">Títulos</div>
            <div className={getBetter(j.titulos, dadosComparado.titulos)}>
              {j.titulos || 0}
            </div>
            <div className={getBetter(dadosComparado.titulos, j.titulos)}>
              {dadosComparado.titulos || 0}
            </div>

            <div className="text-slate-400">Tops</div>
            <div className={getBetter(j.tops, dadosComparado.tops)}>
              {j.tops || 0}
            </div>
            <div className={getBetter(dadosComparado.tops, j.tops)}>
              {dadosComparado.tops || 0}
            </div>

          </div>
        )}

      </div>

      {/* =========================
          BLOCO LIGA
      ========================= */}
      <div className="mb-8 border border-slate-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-white flex items-center justify-between">
          <span>Torneios da Liga</span>
          <span className="text-xs font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Mensais + Relâmpagos
          </span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Vitórias (Mensal)</p>
            <p className="text-2xl font-bold text-green-400">
              {j.vitorias_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-amber-400 flex items-center gap-1">⚡ Vitórias Relâmpago</p>
            <p className="text-2xl font-bold text-amber-400">
              {j.vitorias_relampago || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Derrotas (Mensal)</p>
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
            <p className="text-sm text-slate-400">Pontos Liga</p>
            <p className="text-2xl font-bold text-sky-400">
              {j.pontos_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400">Participações</p>
            <p className="text-2xl font-bold text-white">
              {(Number(j.participacoes_liga) || 0) + (Number(j.participacoes_relampago) || 0)}
            </p>
          </div>
          <div className="bg-slate-900 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🏆 Títulos</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.titulos_liga || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-sky-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🎯 Tops</p>
            <p className="text-2xl font-bold text-sky-400">
              {j.tops_liga || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          BLOCO FORA DA LIGA (INTACTO)
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
          <div className="bg-slate-900 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🏆 Títulos</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.titulos_fora || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-sky-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🎯 Tops</p>
            <p className="text-2xl font-bold text-sky-400">
              {j.tops_fora || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          BLOCO GERAL (INTACTO)
      ========================= */}
      <div className="mb-10 border border-slate-800 rounded-xl p-5 bg-slate-900/50">

        <h2 className="text-xl font-bold mb-4 text-white">
          Geral
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

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

          <div className="bg-slate-900 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🏆 Títulos</p>
            <p className="text-2xl font-bold text-yellow-400">
              {j.titulos || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-sky-500/30 rounded-lg p-4">
            <p className="text-sm text-slate-400">🎯 Tops</p>
            <p className="text-2xl font-bold text-sky-400">
              {j.tops || 0}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          DECKS (INTACTO)
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