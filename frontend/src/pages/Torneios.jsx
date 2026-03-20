import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../services/api"

function Torneios() {

  const [torneios, setTorneios] = useState([])

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

  return (

    <div>

      <h1 className="text-3xl font-bold text-white mb-2">
        Torneios da Liga
      </h1>

      <p className="text-slate-400 mb-6">
        Histórico de torneios da Feira Championship Series
      </p>

      <div className="grid gap-4">

        {torneios.map(torneio => (

          <Link
            to={`/torneios/${torneio.id}`}
            key={torneio.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-sky-500 transition block"
          >

            <div className="text-lg font-semibold text-white">
              {torneio.nome}
            </div>

            <div className="text-sm text-slate-400 mt-1">

              {torneio.tipo_torneio}

              {" • "}

              {formatarData(torneio.data_inicio)}

            </div>

            <div className="text-xs text-sky-400 mt-2">
              Banlist: {torneio.banlist}
            </div>

          </Link>

        ))}

      </div>

    </div>
  )
}

export default Torneios