import { useEffect, useState } from "react"

function Banlists() {

  const [cartas, setCartas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")

  const [mostrarBanlist, setMostrarBanlist] = useState(false)

  useEffect(() => {

    async function load() {
      try {
        const res = await fetch(
          "https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=tcg&sort=name"
        )

        const data = await res.json()

        setCartas(data.data || [])

      } catch {
        setErro("Erro ao carregar banlist")
      } finally {
        setLoading(false)
      }
    }

    load()

  }, [])

  // =========================
  // AGRUPAMENTO
  // =========================
  const forbidden = cartas.filter(
    c => c.banlist_info?.ban_tcg === "Forbidden"
  )

  const limited = cartas.filter(
    c => c.banlist_info?.ban_tcg === "Limited"
  )

  const semiLimited = cartas.filter(
    c => c.banlist_info?.ban_tcg === "Semi-Limited"
  )

  function renderLista(lista) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {lista.map(card => (
          <div
            key={card.id}
            className="bg-slate-800 rounded p-2 text-center hover:bg-slate-700 transition"
          >
            <img
              src={card.card_images?.[0]?.image_url_small}
              alt={card.name}
              className="mx-auto mb-2 w-20 hover:scale-110 transition"
            />

            <p className="text-[10px] text-white leading-tight">
              {card.name}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (

    <div className="max-w-6xl mx-auto p-6 text-white">

      {/* =========================
          BANLIST
      ========================= */}
      <h2 className="text-2xl font-bold mb-4">
        Banlist Oficial (TCG)
      </h2>

      <button
        onClick={() => setMostrarBanlist(prev => !prev)}
        className="mb-6 bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded transition"
      >
        {mostrarBanlist ? "Ocultar Banlist" : "Mostrar Banlist"}
      </button>

      {mostrarBanlist && (

        <div>

          {loading && <p>Carregando...</p>}
          {erro && <p className="text-red-500">{erro}</p>}

          {!loading && !erro && (

            <div className="space-y-10">

              <div>
                <h3 className="text-xl font-bold mb-3 text-red-400">
                  Forbidden ({forbidden.length})
                </h3>
                {renderLista(forbidden)}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-yellow-400">
                  Limited ({limited.length})
                </h3>
                {renderLista(limited)}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-sky-400">
                  Semi-Limited ({semiLimited.length})
                </h3>
                {renderLista(semiLimited)}
              </div>

            </div>

          )}

        </div>

      )}

    </div>
  )
}

export default Banlists