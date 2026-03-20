import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import adminImg from "../assets/admin.png"

import AdminTorneio from "../components/admin/AdminTorneio"
import AdminJogador from "../components/admin/AdminJogador"
import AdminParticipacao from "../components/admin/AdminParticipacao"

function Admin() {

  const [secret, setSecret] = useState("")
  const [autorizado, setAutorizado] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function validarAdmin(key = secret) {

    setLoading(true)

    try {

      const res = await fetch("http://localhost:3000/admin/teste", {
        headers: {
          "x-admin-key": key
        }
      })

      if (res.ok) {

        localStorage.setItem("admin_key", key)
        setAutorizado(true)

      } else {

        localStorage.removeItem("admin_key")
        alert("SAI DAQUI CARALHO")
        navigate("/")

      }

    } catch {

      alert("Erro ao conectar com API")
      navigate("/")

    }

    setLoading(false)

  }

  useEffect(() => {

    const savedKey = localStorage.getItem("admin_key")

    if (!savedKey) return

    async function verificarAdmin() {

      const res = await fetch("http://localhost:3000/admin/teste", {
        headers: {
          "x-admin-key": savedKey
        }
      })

      if (res.ok) setAutorizado(true)

    }

    verificarAdmin()

  }, [])

  function logoutAdmin() {

    localStorage.removeItem("admin_key")
    setAutorizado(false)

  }

  if (!autorizado) {

    return (

      <div className="flex items-center justify-center min-h-[80vh]">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-md text-center">

          <h1 className="text-2xl font-bold text-white mb-6">
            EPA! TÁ PERDIDO?
          </h1>

          <img src={adminImg} className="mx-auto w-128 mb-6"/>

          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mb-4"
          />

          <button
            onClick={() => validarAdmin()}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded"
          >
            {loading ? "Validando..." : "Entrar"}
          </button>

        </div>

      </div>

    )

  }

  return (

    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold text-white">
          Painel Administrativo
        </h1>

        <button
          onClick={logoutAdmin}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

      <AdminTorneio/>

      <AdminJogador/>

      <AdminParticipacao/>

    </div>

  )

}

export default Admin