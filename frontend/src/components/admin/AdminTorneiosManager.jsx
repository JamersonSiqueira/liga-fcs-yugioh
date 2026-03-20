import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"

function AdminTorneiosManager() {

  const [torneios, setTorneios] = useState([])
  const [tipos, setTipos] = useState([])

  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState("")
  const [data, setData] = useState("")

  const [editandoId, setEditandoId] = useState(null)

  // =========================
  // LOAD INICIAL
  // =========================
  useEffect(() => {

    async function load() {

      const resTorneios = await fetchAdmin("/torneios")
      const resTipos = await fetchAdmin("/tipotorneio")

      if (resTorneios && resTorneios.ok) {
        const data = await resTorneios.json()
        setTorneios(data)
      }

      if (resTipos && resTipos.ok) {
        const data = await resTipos.json()
        setTipos(data)
      }

    }

    load()

  }, [])

  // =========================
  // FORM
  // =========================
  function limparFormulario() {
    setNome("")
    setTipo("")
    setData("")
    setEditandoId(null)
  }

  // =========================
  // SAVE
  // =========================
  async function salvarTorneio() {

    if (!nome.trim()) {
      alert("Nome é obrigatório")
      return
    }

    const body = {
      nome,
      tipo_id: tipo || null,
      data_inicio: data || null
    }

    let res

    if (editandoId) {
      res = await fetchAdmin(`/torneios/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
    } else {
      res = await fetchAdmin("/torneios", {
        method: "POST",
        body: JSON.stringify(body)
      })
    }

    if (!res) return

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Erro ao salvar torneio")
      return
    }

    limparFormulario()

    // reload
    const reload = await fetchAdmin("/torneios")

    if (reload && reload.ok) {
      const data = await reload.json()
      setTorneios(data)
    }
  }

  // =========================
  // EDIT
  // =========================
  function editarTorneio(t) {
    setEditandoId(t.id)
    setNome(t.nome)
    setTipo(t.tipo_id || "")
    setData(t.data_inicio?.slice(0, 10) || "")
  }

  // =========================
  // DELETE
  // =========================
  async function deletarTorneio(id) {

    if (!confirm("Deseja deletar este torneio?")) return

    const res = await fetchAdmin(`/torneios/${id}`, {
      method: "DELETE"
    })

    if (!res) return

    if (!res.ok) {
      alert("Erro ao deletar torneio")
      return
    }

    // reload
    const reload = await fetchAdmin("/torneios")

    if (reload && reload.ok) {
      const data = await reload.json()
      setTorneios(data)
    }
  }

  // =========================
  // RENDER
  // =========================
  return (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

      <h2 className="text-xl text-white font-bold mb-4">
        Gerenciar Torneios
      </h2>

      <div className="grid gap-3 mb-6">

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
          <option value="">Tipo</option>

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

        <div className="flex gap-2">

          <button
            onClick={salvarTorneio}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded"
          >
            {editandoId ? "Salvar edição" : "Criar torneio"}
          </button>

          {editandoId && (
            <button
              onClick={limparFormulario}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-left text-white">

          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-2">Nome</th>
              <th>Tipo</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {torneios.map(t => (

              <tr key={t.id} className="border-b border-slate-800">

                <td className="py-2">{t.nome}</td>
                <td>{t.tipo_torneio}</td>
                <td>{t.data_inicio?.slice(0, 10)}</td>

                <td className="flex gap-2">

                  <button
                    onClick={() => editarTorneio(t)}
                    className="text-yellow-400"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deletarTorneio(t.id)}
                    className="text-red-400"
                  >
                    Deletar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}

export default AdminTorneiosManager