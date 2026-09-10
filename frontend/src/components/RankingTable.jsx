import React, { useState } from "react"
import { Link } from "react-router-dom"

function RankingTable({ ranking }) {

  const [hovered, setHovered] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const getMedal = (position) => {
    if (position === 1) return "🥇"
    if (position === 2) return "🥈"
    if (position === 3) return "🥉"
    return position
  }

  const getRowStyle = (position) => {
    if (position <= 8) {
      return "bg-sky-900/20 border-t border-slate-800 hover:bg-sky-900/30 transition"
    }
    return "border-t border-slate-800 hover:bg-slate-800 transition"
  }

  if (!Array.isArray(ranking)) {
    return <div className="text-slate-400 p-4">Carregando ranking...</div>
  }

  return (
    <div className="space-y-2">

      {/* 🔥 LEGENDA */}
      <div className="text-xs text-slate-400 px-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>🏆 títulos</span>
        <span>•</span>
        <span>🥉 top cut</span>
        <span>•</span>
        <span className="text-slate-300"><strong className="text-white">Vit. Mensal:</strong> 3 pts cada</span>
        <span>•</span>
        <span className="text-amber-400"><strong className="text-amber-300">⚡ Vit. Relâmpago:</strong> 2 pts cada</span>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">

        <table className="w-full text-sm">

          {/* DESKTOP HEADER */}
          <thead className="bg-slate-800 text-slate-300 hidden sm:table-header-group">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Jogador</th>
              <th className="p-3 text-right">Pts</th>
              <th className="p-3 text-right" title="Vitórias em Torneios Mensais (3 pontos cada)">
                <div className="leading-tight">
                  <div>Vit. Mensal</div>
                  <div className="text-[10px] text-slate-400 font-normal">3 pts</div>
                </div>
              </th>
              <th className="p-3 text-right text-amber-400" title="Vitórias em Torneios Relâmpago (2 pontos cada)">
                <div className="leading-tight">
                  <div>⚡ Vit. Relâmpago</div>
                  <div className="text-[10px] text-amber-400/70 font-normal">2 pts</div>
                </div>
              </th>
              <th className="p-3 text-right">L</th>
              <th className="p-3 text-right">%</th>
              <th className="p-3 text-right">Média</th>
            </tr>
          </thead>

          <tbody>

            {ranking.map((player, index) => {

              const position = index + 1
              const isOpen = expanded === player.jogador_id

              return (
                <React.Fragment key={player.jogador_id}>

                  {/* DESKTOP */}
                  <tr className={`${getRowStyle(position)} hidden sm:table-row`}>

                    <td className="p-3 font-bold text-slate-300">
                      {getMedal(position)}
                    </td>

                    <td className="p-3 text-white font-bold">
                      <Link
                        to={`/jogador/${player.jogador_id}`}
                        className="hover:underline hover:text-sky-400 transition flex items-center gap-2"
                      >
                        {player.nickname}

                        {player.titulos > 0 && (
                          <span className="text-yellow-400 text-xs">
                            🏆{player.titulos}
                          </span>
                        )}

                        {player.tops > 0 && (
                          <span className="text-slate-400 text-xs">
                            🥉{player.tops}
                          </span>
                        )}
                      </Link>
                    </td>

                    <td className="p-3 text-right text-sky-400 font-bold">
                      {player.total_pontos}
                    </td>

                    <td className="p-3 text-right font-medium text-slate-200">
                      {player.total_vitorias}
                    </td>

                    <td className="p-3 text-right text-amber-400/90 font-medium">
                      {player.vitorias_relampago || 0}
                    </td>

                    <td className="p-3 text-right text-slate-300">
                      {player.total_derrotas}
                    </td>

                    <td className="p-3 text-right">
                      {player.aproveitamento}%
                    </td>

                    <td
                      className="p-3 text-right relative cursor-help text-slate-300"
                      onMouseEnter={() => setHovered(player.jogador_id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {player.media_colocacao
                        ? Number(player.media_colocacao).toFixed(1)
                        : "-"}

                      {hovered === player.jogador_id && player.media_colocacao && (
                        <div className="absolute z-10 bg-slate-800 text-xs text-white p-2 rounded shadow-lg w-56 -top-14 right-0">
                          Média de colocações: {Number(player.media_colocacao).toFixed(1)}
                          <div className="text-slate-400 mt-1">
                            Quanto menor, melhor o desempenho.
                          </div>
                        </div>
                      )}
                    </td>

                  </tr>

                  {/* MOBILE */}
                  <tr
                    className={`${getRowStyle(position)} sm:hidden cursor-pointer`}
                    onClick={() => setExpanded(isOpen ? null : player.jogador_id)}
                  >
                    <td className="p-3 w-full">

                      <div className="flex justify-between items-center">

                        <div className="flex items-center gap-2 font-bold">

                          <span className="text-slate-300">
                            {getMedal(position)}
                          </span>

                          <span>{player.nickname}</span>

                          {player.titulos > 0 && (
                            <span className="text-yellow-400 text-xs">
                              🏆{player.titulos}
                            </span>
                          )}

                          {player.tops > 0 && (
                            <span className="text-slate-400 text-xs">
                              🥉{player.tops}
                            </span>
                          )}

                        </div>

                        <div className="text-sky-400 font-bold">
                          {player.total_pontos} pts
                        </div>

                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{player.total_vitorias}W Mensal / {player.total_derrotas}L</span>
                        {Number(player.vitorias_relampago) > 0 && (
                          <span className="text-amber-400 font-medium">
                            • ⚡ {player.vitorias_relampago}W Relâmpago
                          </span>
                        )}
                      </div>

                    </td>
                  </tr>

                  {/* EXPAND MOBILE */}
                  {isOpen && (
                    <tr className="sm:hidden bg-slate-800/50">
                      <td className="p-3 text-xs text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Vitórias Mensais (3 pts):</span>
                          <span className="font-bold text-white">{player.total_vitorias}W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400">⚡ Vitórias Relâmpago (2 pts):</span>
                          <span className="font-bold text-amber-400">{player.vitorias_relampago || 0}W</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aproveitamento:</span>
                          <span>{player.aproveitamento}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Média de colocações:</span>
                          <span>{player.media_colocacao ? Number(player.media_colocacao).toFixed(1) : "-"}</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* TOP 8 */}
                  {position === 8 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-xs text-sky-400 py-3 border-t border-sky-800 bg-sky-900/30 tracking-widest"
                      >
                        ───────── CORTE TOP 8 ─────────
                      </td>
                    </tr>
                  )}

                </React.Fragment>
              )
            })}

          </tbody>

        </table>

      </div>
    </div>
  )
}

export default RankingTable