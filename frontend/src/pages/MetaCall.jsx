import { useEffect, useState } from "react"
import { API_URL } from "../services/api"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts"

function MetaCall() {

  const [banlists, setBanlists] = useState([])
  const [banlistSelecionada, setBanlistSelecionada] = useState("")
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandido, setExpandido] = useState(null)
  const [mostrarTierC, setMostrarTierC] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/banlists`)
      const data = await res.json()

      setBanlists(data)
      if (data.length > 0) setBanlistSelecionada(data[0].id)
    }
    load()
  }, [])

  useEffect(() => {
    if (!banlistSelecionada) return

    async function loadMeta() {
      setLoading(true)

      try {
        const res = await fetch(
          `${API_URL}/stats/banlist/${banlistSelecionada}`
        )
        const data = await res.json()

        const normalizado = {
          ...data,
          decks: data.decks.map(d => ({
            ...d,
            uso: Number(d.uso),
            vitorias: Number(d.vitorias),
            derrotas: Number(d.derrotas),
            top_cut: Number(d.top_cut),
            titulos: Number(d.titulos),
            winrate: Number(d.winrate),
            players_unicos: Number(d.players_unicos)
          }))
        }

        setDados(normalizado)

      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    loadMeta()

  }, [banlistSelecionada])

  function getTier(index) {
    if (index === 0) return "S"
    if (index <= 2) return "A"
    if (index <= 5) return "B"
    return "C"
  }

  function getTierColor(tier) {
    switch (tier) {
      case "S": return "text-yellow-400"
      case "A": return "text-sky-400"
      case "B": return "text-green-400"
      default: return "text-slate-400"
    }
  }

  function getResultados(deck) {
    return dados.resultados.filter(r => r.deck === deck)
  }

  return (

    <div className="max-w-6xl mx-auto p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Meta Call
        </h1>

        <button
          onClick={() => setShowHelp(true)}
          className="text-sky-400 text-sm"
        >
          ❓ Como funciona
        </button>

      </div>

      {/* SELECT */}
      <div className="mb-8">

        <label className="block text-sm text-slate-400 mb-2">
          Formato:
        </label>

        <select
          value={banlistSelecionada}
          onChange={(e) => setBanlistSelecionada(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
        >
          {banlists.map(b => (
            <option key={b.id} value={b.id}>
              {b.nome}
            </option>
          ))}
        </select>

      </div>

      {loading && <p>Carregando meta...</p>}

      {!loading && dados && (

        <div className="space-y-10">

          {/* PIE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Popularidade (Top 5)
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dados.decks.slice(0, 5)}
                  dataKey="uso"
                  nameKey="deck"
                  outerRadius={100}
                  label
                >
                  {dados.decks.slice(0, 5).map((entry, index) => (
                    <Cell key={entry.deck + index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* TIERS */}
          {["S", "A", "B", "C"].map(tier => {

            let decks = dados.decks
              .map((d, i) => ({ ...d, tier: getTier(i) }))
              .filter(d => d.tier === tier)

            if (tier === "C" && !mostrarTierC) {
              decks = decks.slice(0, 5)
            }

            return (

              <div key={tier}>

                <h2 className={`text-xl font-bold mb-4 ${getTierColor(tier)}`}>
                  Tier {tier}
                </h2>

                <div className="grid gap-3">

                  {decks.map((d) => {

                    const resultados = getResultados(d.deck)
                    const isOpen = expandido === d.deck

                    return (

                      <div
                        key={d.deck}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                      >

                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => setExpandido(isOpen ? null : d.deck)}
                        >

                          <div>
                            <div className="font-semibold text-lg">
                              {d.deck}
                            </div>

                            <div className="text-xs text-slate-400 mt-1 flex gap-3">
                              <span>{d.players_unicos} players</span>
                              <span>{d.top_cut} tops</span>
                              <span>{d.titulos} títulos</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sky-400 font-bold text-lg">
                              {d.winrate}%
                            </div>
                            <div className="text-xs text-slate-400">
                              WR
                            </div>
                          </div>

                        </div>

                        {isOpen && (
                          <div className="mt-4 border-t border-slate-700 pt-3 space-y-1 text-sm">

                            {resultados.map((r, idx) => (
                              <div key={idx} className="text-slate-300">
                                {r.colocacao}º lugar — {r.torneio_nome} — {r.nickname}
                              </div>
                            ))}

                          </div>
                        )}

                      </div>

                    )

                  })}

                  {tier === "C" && dados.decks.length > 5 && (
                    <button
                      onClick={() => setMostrarTierC(!mostrarTierC)}
                      className="text-sky-400 text-sm mt-2"
                    >
                      {mostrarTierC ? "Mostrar menos" : "Ver todos"}
                    </button>
                  )}

                </div>

              </div>

            )

          })}

        </div>

      )}

      {/* MODAL HELP */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-slate-900 p-6 rounded-xl max-w-lg">

            <h2 className="text-xl font-bold mb-4">
              Como o Meta é calculado
            </h2>

            <p className="text-sm text-slate-300 mb-3">
              O ranking dos decks é baseado em um score composto:
            </p>

            <ul className="text-sm text-slate-300 space-y-1 mb-4">
              <li>• Uso (quantidade de vezes jogado)</li>
              <li>• Top Cut (peso maior)</li>
              <li>• Títulos (peso máximo)</li>
              <li>• Winrate (impacto percentual)</li>
            </ul>

            <p className="text-sm text-slate-300 mb-4">
              Score aproximado:
              <br />
              <span className="text-sky-400">
                uso + (top_cut × 3) + (títulos × 5) + (winrate × 0.1)
              </span>
            </p>

            <p className="text-sm text-slate-400 mb-4">
              Os tiers são definidos pela posição no ranking final.
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="bg-sky-600 px-4 py-2 rounded"
            >
              Fechar
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default MetaCall