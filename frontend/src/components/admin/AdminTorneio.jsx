import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function AdminTorneio() {

  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState("")
  const [data, setData] = useState("")

  const [tipos, setTipos] = useState([])

  useEffect(() => {

    fetch(`${API_URL}/tipotorneio`)
      .then(res => res.json())
      .then(data => setTipos(data))

  }, [])

  async function criarTorneio() {

    const res = await fetchAdmin(
      `${API_URL}/torneios`,
      {
        method: "POST",
        body: JSON.stringify({
          nome,
          tipo_id: tipo,
          data_inicio: data
        })
      }
    )

    if (res && res.ok) {

      alert("Torneio criado!")

      setNome("")
      setTipo("")
      setData("")

    }

  }

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h2 className="text-xl text-white font-bold mb-4">
        Criar Torneio
      </h2>

      <div className="grid gap-3">

        <input
          placeholder="Nome do torneio"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          <option value="">Tipo de torneio</option>

          {tipos.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}

        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        />

        <button
          onClick={criarTorneio}
          className="bg-sky-600 hover:bg-sky-500 text-white py-2 rounded"
        >
          Criar Torneio
        </button>

      </div>

    </div>

  )

}

export default AdminTorneio