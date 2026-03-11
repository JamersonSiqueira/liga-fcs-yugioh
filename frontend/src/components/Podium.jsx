function Podium({ ranking }) {

  const top3 = ranking.slice(0, 3)

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">

      {top3.map((player, index) => (
        <div
          key={player.id}
          className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center"
        >

          <div className="text-2xl mb-1">
            {medals[index]}
          </div>

          <div className="font-bold text-white">
            {player.nickname}
          </div>

          <div className="text-sky-400 text-sm">
            {player.total_pontos} pts
          </div>

        </div>
      ))}

    </div>
  )
}

export default Podium