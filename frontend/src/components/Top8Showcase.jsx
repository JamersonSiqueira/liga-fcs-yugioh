import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../services/api"

function Top8Showcase() {
  const [config, setConfig] = useState(null)
  const [classificados, setClassificados] = useState([])
  const [partidas, setPartidas] = useState([])
  const [tabelaTop8, setTabelaTop8] = useState([])
  const [rodadaFiltro, setRodadaFiltro] = useState("rodada_1")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [resConfig, resClassificados, resPartidas] = await Promise.all([
          fetch(`${API_URL}/top8/config`),
          fetch(`${API_URL}/top8/classificados`),
          fetch(`${API_URL}/top8/partidas`)
        ])

        if (resConfig.ok) setConfig(await resConfig.json())
        if (resClassificados.ok) setClassificados(await resClassificados.json())
        if (resPartidas.ok) {
          const data = await resPartidas.json()
          setPartidas(data.partidas || [])
          setTabelaTop8(data.classificacao_top8 || [])
        }
      } catch (err) {
        console.error("Erro ao carregar Top 8 showcase:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading || !config || classificados.length === 0) {
    return null
  }

  const partidaFinal = partidas.find(p => p.rodada === "final")
  const partidaTerceiro = partidas.find(p => p.rodada === "terceiro_lugar")
  const fase = config.fase_atual || "mural"

  return (
    <div className="mb-10 space-y-8">

      {/* =========================================================
          👑 PÓDIO OFICIAL (QUANDO O TOP 8 ESTIVER FINALIZADO)
      ========================================================= */}
      {fase === "finalizado" && config.campeao_id && (
        <div className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          <span className="inline-block text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
            Temporada 2026 • Playoffs Concluídos
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight">
            👑 Pódio dos Campeões do Top 8
          </h2>

          <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto">
            {/* 🥈 2º LUGAR */}
            {config.vice_id && (
              <div className="order-2 md:order-1 flex-1 w-full bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col items-center">
                <span className="text-3xl mb-2">🥈</span>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Vice-Campeão</span>
                <div className="my-3 relative">
                  {config.vice_foto ? (
                    <img src={config.vice_foto} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-slate-400 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl">👤</div>
                  )}
                </div>
                <Link to={`/jogador/${config.vice_id}`} className="font-bold text-lg text-white hover:text-sky-400 transition">
                  {config.vice_nickname}
                </Link>
              </div>
            )}

            {/* 🥇 1º LUGAR (DESTAQUE MÁXIMO) */}
            <div className="order-1 md:order-2 flex-1 w-full bg-gradient-to-b from-amber-500/20 to-slate-800/90 border-2 border-amber-400 rounded-2xl p-6 flex flex-col items-center shadow-xl scale-105 z-10">
              <span className="text-5xl mb-2 animate-bounce">🏆</span>
              <span className="text-xs uppercase tracking-widest font-black text-amber-300 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-400/40">
                Grande Campeão
              </span>
              <div className="my-3 relative">
                {config.campeao_foto ? (
                  <img src={config.campeao_foto} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-2xl" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-amber-950 flex items-center justify-center text-4xl border-4 border-amber-400">👤</div>
                )}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow">
                  1º LUGAR
                </span>
              </div>
              <Link to={`/jogador/${config.campeao_id}`} className="font-extrabold text-2xl text-white hover:text-amber-300 transition">
                {config.campeao_nickname}
              </Link>
            </div>

            {/* 🥉 3º LUGAR */}
            {config.terceiro_id && (
              <div className="order-3 flex-1 w-full bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col items-center">
                <span className="text-3xl mb-2">🥉</span>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-600/80">3º Colocado</span>
                <div className="my-3 relative">
                  {config.terceiro_foto ? (
                    <img src={config.terceiro_foto} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-amber-700 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl">👤</div>
                  )}
                </div>
                <Link to={`/jogador/${config.terceiro_id}`} className="font-bold text-lg text-white hover:text-sky-400 transition">
                  {config.terceiro_nickname}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          ⭐ MURAL DOS 8 CLASSIFICADOS (CARDS ESPORTS / CARDS ANIME)
      ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Mural dos 8 Classificados • Playoffs 2026
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Os 8 duelistas de elite que garantiram vaga direta na decisão da Liga FCS
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Fase de Elite (7 Rodadas + Finais)
          </span>
        </div>

        {/* GRID DOS 8 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classificados.map((c) => (
            <Link
              key={c.jogador_id}
              to={`/jogador/${c.jogador_id}`}
              className="group bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700/80 hover:border-amber-400/60 rounded-xl p-4 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* SEED BADGE */}
              <div className="absolute top-2.5 left-2.5 bg-slate-900/90 border border-amber-400/40 text-amber-300 text-[11px] font-black px-2 py-0.5 rounded-full shadow">
                #{c.seed}
              </div>

              {/* FOTO COM MOLDURA HOLOGRÁFICA */}
              <div className="my-2 relative">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-sky-400 to-purple-500 group-hover:rotate-6 transition duration-300">
                  {c.foto_url ? (
                    <img
                      src={c.foto_url}
                      alt={c.nickname}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl text-slate-400">
                      🃏
                    </div>
                  )}
                </div>
              </div>

              {/* NICKNAME */}
              <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition truncate max-w-full">
                {c.nickname}
              </h3>

              {/* DECK PRINCIPAL */}
              <div className="mt-1.5 text-center max-w-full px-1">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Deck mais utilizado
                </span>
                <span
                  title={c.deck_principal || "Deck não registrado"}
                  className="text-xs text-sky-400 font-bold truncate max-w-full inline-flex items-center justify-center gap-1 mt-0.5"
                >
                  <span>🃏</span>
                  <span className="truncate">{c.deck_principal || "Não registrado"}</span>
                </span>
              </div>

              {/* STATS DA FASE REGULAR */}
              <div className="mt-3 pt-3 border-t border-slate-700/60 w-full flex justify-around text-center text-xs">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Pontos</span>
                  <span className="font-extrabold text-amber-400 text-sm">{c.total_pontos}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Winrate</span>
                  <span className="font-bold text-green-400 text-sm">{c.aproveitamento}%</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Tops</span>
                  <span className="font-bold text-sky-300 text-sm">{c.tops}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================
          ⚔️ FINAIS DO TOP 8 (GRANDE FINAL & 3º LUGAR)
      ========================================================= */}
      {(fase === "finais" || fase === "finalizado" || partidaFinal) && partidaFinal && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="text-center max-w-md mx-auto mb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Confrontos Decisivos
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-2">
              Finais do Top 8
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GRANDE FINAL */}
            <div className="bg-gradient-to-b from-amber-500/15 via-slate-850 to-slate-900 border-2 border-amber-400/50 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-amber-300 tracking-wider flex items-center gap-1.5">
                  🏆 GRANDE FINAL • VALENDO O TÍTULO
                </span>
                {partidaFinal.concluida ? (
                  <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">Encerrada</span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold animate-pulse">A Decidir</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                {/* JOGADOR 1 */}
                <div className="flex-1 flex flex-col items-center text-center">
                  {partidaFinal.jogador1_foto ? (
                    <img src={partidaFinal.jogador1_foto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mb-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl mb-1">👤</div>
                  )}
                  <span className="font-bold text-white text-sm">{partidaFinal.jogador1_nickname || "1º Colocado"}</span>
                </div>

                {/* PLACAR */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white">{partidaFinal.vitorias_j1}</span>
                  <span className="text-slate-500 font-bold text-lg">x</span>
                  <span className="text-3xl font-black text-white">{partidaFinal.vitorias_j2}</span>
                </div>

                {/* JOGADOR 2 */}
                <div className="flex-1 flex flex-col items-center text-center">
                  {partidaFinal.jogador2_foto ? (
                    <img src={partidaFinal.jogador2_foto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mb-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl mb-1">👤</div>
                  )}
                  <span className="font-bold text-white text-sm">{partidaFinal.jogador2_nickname || "2º Colocado"}</span>
                </div>
              </div>
            </div>

            {/* DISPUTA DE 3º LUGAR */}
            {partidaTerceiro && (
              <div className="bg-slate-850 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-sky-300 tracking-wider flex items-center gap-1.5">
                    🥉 DISPUTA DE 3º LUGAR
                  </span>
                  {partidaTerceiro.concluida ? (
                    <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">Encerrada</span>
                  ) : (
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">A Decidir</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                  {/* JOGADOR 1 */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    {partidaTerceiro.jogador1_foto ? (
                      <img src={partidaTerceiro.jogador1_foto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-500 mb-1" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl mb-1">👤</div>
                    )}
                    <span className="font-bold text-white text-sm">{partidaTerceiro.jogador1_nickname || "3º Colocado"}</span>
                  </div>

                  {/* PLACAR */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white">{partidaTerceiro.vitorias_j1}</span>
                    <span className="text-slate-500 font-bold">x</span>
                    <span className="text-2xl font-black text-white">{partidaTerceiro.vitorias_j2}</span>
                  </div>

                  {/* JOGADOR 2 */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    {partidaTerceiro.jogador2_foto ? (
                      <img src={partidaTerceiro.jogador2_foto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-500 mb-1" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-xl mb-1">👤</div>
                    )}
                    <span className="font-bold text-white text-sm">{partidaTerceiro.jogador2_nickname || "4º Colocado"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          📊 TABELA E CONFRONTOS DAS 7 RODADAS (ROUND ROBIN)
      ========================================================= */}
      {tabelaTop8.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                ⚔️ Tabela da Fase de 7 Rodadas (Todos contra Todos)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                1º e 2º avançam para a Grande Final • 3º e 4º disputam o 3º lugar
              </p>
            </div>
          </div>

          {/* DICA DE SCROLL PARA MOBILE */}
          <div className="sm:hidden flex items-center justify-between text-[11px] text-sky-400/80 bg-sky-950/30 border border-sky-500/20 px-2.5 py-1.5 rounded-lg mb-3">
            <span>👉 Deslize horizontalmente para ver a tabela completa</span>
            <span className="font-bold">↔️</span>
          </div>

          {/* TABELA DE CLASSIFICAÇÃO INTERNA DO TOP 8 */}
          <div className="overflow-x-auto mb-4 border border-slate-800/80 rounded-xl">
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="text-xs uppercase text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="w-12 text-center py-3">Pos</th>
                  <th className="min-w-[150px]">Duelista</th>
                  <th className="w-14 text-center whitespace-nowrap">Jogos</th>
                  <th className="w-10 text-center">V</th>
                  <th className="w-10 text-center">D</th>
                  <th className="w-12 text-center" title="Dupla Derrota por Tempo Esgotado">DL</th>
                  <th className="w-14 text-center whitespace-nowrap">Saldo</th>
                  <th className="w-16 text-center whitespace-nowrap">Pontos</th>
                  <th className="w-32 text-center whitespace-nowrap">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tabelaTop8.map((j) => (
                  <tr key={j.jogador_id} className="hover:bg-slate-800/30 transition">
                    <td className="w-12 text-center py-2.5 font-bold text-amber-400">{j.posicao}º</td>
                    <td className="min-w-[150px] font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {j.foto_url ? (
                          <img src={j.foto_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] shrink-0">👤</div>
                        )}
                        <Link to={`/jogador/${j.jogador_id}`} className="hover:text-sky-400 transition truncate">
                          {j.nickname}
                        </Link>
                      </div>
                    </td>
                    <td className="w-14 text-center text-slate-300 whitespace-nowrap font-mono text-xs">{j.jogos}/7</td>
                    <td className="w-10 text-center font-bold text-green-400">{j.vitorias}</td>
                    <td className="w-10 text-center text-red-400">{j.derrotas}</td>
                    
                    {/* COLUNA DL COM LARGURA E CENTRO PADRONIZADOS */}
                    <td className="w-12 text-center">
                      {j.double_losses > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                          {j.double_losses}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-5 text-slate-600 font-mono">-</span>
                      )}
                    </td>

                    <td className="w-14 text-center text-slate-300 whitespace-nowrap font-mono text-xs">{j.saldo_sets > 0 ? `+${j.saldo_sets}` : j.saldo_sets}</td>
                    <td className="w-16 text-center font-extrabold text-white text-base">{j.pontos}</td>
                    
                    <td className="w-32 text-center whitespace-nowrap">
                      {j.posicao <= 2 ? (
                        <span className="inline-block text-[11px] font-bold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
                          🏆 Grande Final
                        </span>
                      ) : j.posicao <= 4 ? (
                        <span className="inline-block text-[11px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                          🥉 Disputa 3º
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Eliminado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-850/80 p-2.5 rounded-lg border border-slate-800 mb-8">
            <span className="text-amber-400 text-sm">⏱️</span>
            <span>
              <strong className="text-slate-300">Regra de Tempo de Partida:</strong> Ao término dos 50 minutos de rodada sem um duelista atingir 2 vitórias, ambos recebem <strong className="text-red-400">Derrota (Double Loss)</strong> e 0 pontos. Nas Finais não há limite de tempo.
            </span>
          </div>

          {/* VISUALIZADOR DAS RODADAS */}
          <div className="border-t border-slate-800 pt-6">
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <span>Confrontos das Rodadas:</span>
            </h4>

            <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <button
                  key={num}
                  onClick={() => setRodadaFiltro(`rodada_${num}`)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    rodadaFiltro === `rodada_${num}`
                      ? "bg-sky-600 text-white shadow"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Rodada {num}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {partidas
                .filter(p => p.rodada === rodadaFiltro)
                .map((p) => {
                  const isDoubleLoss = p.concluida && p.vitorias_j1 === p.vitorias_j2
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl p-2.5 sm:p-3 flex flex-col justify-between transition ${
                        isDoubleLoss
                          ? "bg-gradient-to-r from-red-950/30 via-slate-850 to-red-950/30 border-2 border-red-500/50 shadow-md"
                          : "bg-slate-800/60 border border-slate-700/60"
                      }`}
                    >
                      {isDoubleLoss && (
                        <div className="flex flex-wrap items-center justify-between pb-1.5 mb-2 border-b border-red-500/20 text-[10px] gap-1">
                          <span className="font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1">
                            ⏱️ DOUBLE LOSS • TEMPO ESGOTADO
                          </span>
                          <span className="text-slate-400 font-medium">Ambos recebem derrota (0 pts)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                        {/* DUELISTA 1 */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
                          <span className={`font-semibold text-xs sm:text-sm truncate text-right ${isDoubleLoss ? "text-slate-400" : "text-white"}`}>
                            {p.jogador1_nickname}
                          </span>
                          {p.jogador1_foto ? (
                            <img src={p.jogador1_foto} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] shrink-0">👤</div>
                          )}
                        </div>

                        {/* PLACAR CENTRALIZADO QUE NUNCA QUEBRA */}
                        <div className="px-1 sm:px-2 shrink-0">
                          <span className={`inline-flex items-center justify-center min-w-[56px] sm:min-w-[68px] px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm font-black whitespace-nowrap tabular-nums shadow-inner ${
                            isDoubleLoss
                              ? "bg-red-950/90 text-red-300 border-red-500/60"
                              : "bg-slate-900 text-white border-slate-700"
                          }`}>
                            {p.concluida ? `${p.vitorias_j1} x ${p.vitorias_j2}` : "vs"}
                          </span>
                        </div>

                        {/* DUELISTA 2 */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-start min-w-0">
                          {p.jogador2_foto ? (
                            <img src={p.jogador2_foto} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] shrink-0">👤</div>
                          )}
                          <span className={`font-semibold text-xs sm:text-sm truncate text-left ${isDoubleLoss ? "text-slate-400" : "text-white"}`}>
                            {p.jogador2_nickname}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Top8Showcase
