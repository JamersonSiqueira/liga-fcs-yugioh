import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../services/api"

function Torneios() {

  const [torneios, setTorneios] = useState([])
  const [filtro, setFiltro] = useState("todos")

  useEffect(() => {

    fetch(`${API_URL}/torneios`)
      .then(res => res.json())
      .then(data => setTorneios(data))
      .catch(err => console.log(err))

  }, [])

  function formatarData(data) {

    const d = new Date(data)

    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  // =========================
  // FILTRO
  // =========================
  const torneiosFiltrados = torneios.filter(t => {

    if (filtro === "todos") return true

    if (filtro === "liga") {
      return t.modelo_codigo !== "SEM_RANKING"
    }

    if (filtro === "sem_ranking") {
      return t.modelo_codigo === "SEM_RANKING"
    }

    return true
  })

  return (

    <div className="max-w-5xl mx-auto p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-white mb-2">
        Torneios
      </h1>

      <p className="text-slate-400 mb-6">
        Histórico de torneios da Feira Championship Series
      </p>


      {/* FILTROS */}
      <div className="flex flex-wrap gap-2 mb-6">

        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 rounded-lg text-sm transition
            ${filtro === "todos"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Todos
        </button>

        <button
          onClick={() => setFiltro("liga")}
          className={`px-4 py-2 rounded-lg text-sm transition
            ${filtro === "liga"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Liga FCS
        </button>

        <button
          onClick={() => setFiltro("sem_ranking")}
          className={`px-4 py-2 rounded-lg text-sm transition
            ${filtro === "sem_ranking"
              ? "bg-purple-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
        >
          Sem Ranking
        </button>

      </div>


      {/* CONTADOR */}
      <div className="text-sm text-slate-400 mb-4">
        {torneiosFiltrados.length} torneio(s) encontrado(s)
      </div>


      {/* LISTA */}
      <div className="grid gap-4">

        {torneiosFiltrados.map(torneio => {

          const isSemRanking = torneio.modelo_codigo === "SEM_RANKING"

          return (

            <Link
              to={`/torneios/${torneio.id}`}
              key={torneio.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 transition block"
            >

              {/* NOME */}
              <div className="flex justify-between items-center">

                <div className="text-lg font-semibold text-white">
                  {torneio.nome}
                </div>

                {/* BADGE */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${isSemRanking
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-sky-500/20 text-sky-300"
                  }`}
                >
                  {isSemRanking ? "Sem Ranking" : "Liga"}
                </span>

              </div>


              {/* INFO */}
              <div className="text-sm text-slate-400 mt-2">

                {torneio.tipo_torneio}

                {" • "}

                {formatarData(torneio.data_inicio)}

              </div>


              {/* BANLIST */}
              <div className="text-xs text-slate-500 mt-2">
                Banlist: {torneio.banlist}
              </div>


              {/* TOP CUT BADGE (se existir) */}
              <div className="mt-3">
                {torneio.tem_top_cut ? (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                    Top {torneio.top_cut}
                  </span>
                ) : (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    Suíço
                  </span>
                )}
              </div>

            </Link>

          )

        })}

      </div>

    </div>
  )
}

export default Torneios