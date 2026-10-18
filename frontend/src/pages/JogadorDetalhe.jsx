import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { API_URL } from "../services/api"

function JogadorDetalhe() {

  const { id } = useParams()

  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroTorneios, setFiltroTorneios] = useState("todos")

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
          🔥 HISTÓRICO DE TORNEIOS (LIGA VS OFF-LIGA)
      ========================= */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📅 Histórico de Torneios
            </h2>
            <p className="text-sm text-slate-400">
              Desempenho torneio a torneio, divididos entre Liga FCS e Off-Liga
            </p>
          </div>

          {/* ABAS DE FILTRO */}
          <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFiltroTorneios("todos")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                filtroTorneios === "todos"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Todos ({(dados.historico_torneios || []).length})
            </button>
            <button
              onClick={() => setFiltroTorneios("liga")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                filtroTorneios === "liga"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              🏆 Liga ({(dados.historico_torneios || []).filter(t => t.is_liga).length})
            </button>
            <button
              onClick={() => setFiltroTorneios("off")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                filtroTorneios === "off"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              ⚔️ Off-Liga ({(dados.historico_torneios || []).filter(t => !t.is_liga).length})
            </button>
          </div>
        </div>

        {/* LISTAGEM DE TORNEIOS */}
        {(() => {
          const torneiosFiltrados = (dados.historico_torneios || []).filter(t => {
            if (filtroTorneios === "liga") return t.is_liga
            if (filtroTorneios === "off") return !t.is_liga
            return true
          })

          if (torneiosFiltrados.length === 0) {
            return (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                Nenhum torneio registrado nesta categoria.
              </div>
            )
          }

          return (
            <div className="grid gap-3">
              {torneiosFiltrados.map((t, idx) => {
                const dataFormatada = t.data_inicio
                  ? new Date(t.data_inicio).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                  : "-"

                return (
                  <div
                    key={t.torneio_id || idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* INFO PRINCIPAL: NOME, DATA E TIPO */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {t.is_liga ? (
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-base">
                            🏆
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-base">
                            ⚔️
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/torneios/${t.torneio_id}`}
                            className="font-bold text-white hover:text-sky-400 transition"
                          >
                            {t.torneio_nome}
                          </Link>

                          {t.is_liga ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {t.tipo_torneio || "Liga FCS"}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Off-Liga
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                          <span>📅 {dataFormatada}</span>
                          {t.deck && (
                            <span className="text-slate-300 font-medium">
                              🃏 {t.deck}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESEMPENHO: PLACAR, COLOCAÇÃO E PONTOS */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      {/* V / D */}
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          <span className="text-green-400">{t.vitorias}V</span>
                          <span className="text-slate-500 mx-1">-</span>
                          <span className="text-red-400">{t.derrotas}D</span>
                          {Number(t.empates) > 0 && (
                            <span className="text-yellow-400 ml-1">({t.empates}E)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t.is_liga ? `+${t.pontos_ganhos || 0} pts` : "Fora da Liga"}
                        </div>
                      </div>

                      {/* BADGE DE COLOCAÇÃO */}
                      <div className="min-w-[95px] text-center">
                        {t.colocacao_manual === 1 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm">
                            🥇 Campeão
                          </span>
                        ) : t.colocacao_manual && t.colocacao_manual <= 4 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            🎯 Top {t.colocacao_manual}
                          </span>
                        ) : t.colocacao_manual ? (
                          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {t.colocacao_manual}º Lugar
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
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