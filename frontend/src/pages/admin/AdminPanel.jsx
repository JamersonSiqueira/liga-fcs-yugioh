import { useState } from "react"

import AdminJogadoresManager from "../../components/admin/AdminJogadoresManager.jsx"
import AdminTorneiosManager from "../../components/admin/AdminTorneiosManager"
import AdminParticipacoesManager from "../../components/admin/AdminParticipacoesManager"
import AdminBanlistManager from "../../components/admin/AdminBanlistManager"


function AdminPanel() {

  const [aba, setAba] = useState("jogadores")

  function renderConteudo() {

    if (aba === "jogadores") {
      return <AdminJogadoresManager />
    }

    if (aba === "torneios") {
      return <AdminTorneiosManager />
    }

    if (aba === "participacoes") {
      return <AdminParticipacoesManager/>
    }

    if (aba === "banlists") {
      return <AdminBanlistManager />
    }

  }

  return (

    <div className="max-w-5xl mx-auto p-6 grid gap-6">

      <h1 className="text-3xl font-bold text-white">
        Painel Administrativo
      </h1>

      <div className="flex gap-2">

        <button
          onClick={() => setAba("jogadores")}
          className={`px-4 py-2 rounded ${
            aba === "jogadores"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Jogadores
        </button>

        <button
          onClick={() => setAba("torneios")}
          className={`px-4 py-2 rounded ${
            aba === "torneios"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Torneios
        </button>

        <button
          onClick={() => setAba("participacoes")}
          className={`px-4 py-2 rounded ${
            aba === "participacoes"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Participações
        </button>

        <button
          onClick={() => setAba("banlists")}
          className={`px-4 py-2 rounded ${
            aba === "banlists"
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Banlists
        </button>

      </div>

      <div>
        {renderConteudo()}
      </div>

    </div>

  )

}

export default AdminPanel