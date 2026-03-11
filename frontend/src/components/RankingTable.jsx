function RankingTable({ ranking }) {

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

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Jogador</th>
            <th className="p-3 text-right">Pts</th>
            <th className="p-3 text-right hidden sm:table-cell">W</th>
            <th className="p-3 text-right hidden sm:table-cell">L</th>
            <th className="p-3 text-right hidden sm:table-cell">Aproveitamento (%)</th>
          </tr>
        </thead>

        <tbody>

{ranking.map((player, index) => {

  const position = index + 1

  return (
    <>

      <tr
        key={player.id}
        className={getRowStyle(position)}
      >

        <td className="p-3 font-bold text-slate-300">
          {getMedal(position)}
        </td>

        <td className="p-3 font-medium text-white">
          {player.nickname}
        </td>

        <td className="p-3 text-right text-sky-400 font-bold">
          {player.total_pontos}
        </td>

        <td className="p-3 text-right hidden sm:table-cell">
          {player.total_vitorias}
        </td>

        <td className="p-3 text-right hidden sm:table-cell">
          {player.total_derrotas}
        </td>

        <td className="p-3 text-right hidden sm:table-cell">
          {player.aproveitamento}%
        </td>

      </tr>

      {position === 8 && (
        <tr>
          <td
            colSpan="6"
            className="text-center text-xs text-sky-400 py-3 border-t border-sky-800 bg-sky-900/30 tracking-widest"
          >
            ───────── CORTE TOP 8 ─────────
          </td>
        </tr>
      )}

    </>
  )
})}

</tbody>

      </table>

    </div>
  )
}

export default RankingTable