import { useEffect, useState } from "react"
import logofcs from "../assets/logo.png"
import livraria from "../assets/livraria.png"

export default function Footer() {
  const [torneios, setTorneios] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/torneios/upcoming`)
      .then(res => res.json())
      .then(data => setTorneios(data))
      .catch(() => setTorneios([]))
  }, [])

  function formatDate(date) {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <footer className="bg-slate-900 text-slate-300 mt-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6 items-center">

        {/* IDENTIDADE */}
        <div className="flex flex-col gap-2">
          <img src={logofcs} alt="FCS Logo" className="w-24" />

          <p className="text-sm leading-tight">
            <strong>FCS - Feira Championship Series</strong><br />
            Desde 2015 sendo a mais tradicional da Bahia
          </p>

          <p className="text-xs text-slate-400">
            12 anos de ligas anuais • Comunidade ativa há 14 anos
          </p>
        </div>

        {/* PARCEIRO + PRÓXIMOS */}
        <div className="flex flex-col items-center gap-4 text-center">

          <div className="flex flex-col items-center gap-1">
            <img src={livraria} alt="OTS Parceira" className="w-48" />
            <p className="text-xs text-slate-400">
              Loja oficial / OTS parceira
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Próximos Torneios
            </p>

            {torneios.length > 0 ? (
              torneios.slice(0, 3).map(t => (
                <div key={t.id} className="text-xs">
                  <span className="font-bold">
                    {formatDate(t.data_inicio)}
                  </span>{" "}
                  - {t.nome}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum torneio agendado
              </p>
            )}
          </div>

        </div>

        {/* CONTATO */}
        <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-sm font-semibold">
            Quer jogar conosco?
          </p>
          <p className="text-sm font-semibold">
            Entre na comunidade do WhatsApp!
          </p>

          <a
            href="https://chat.whatsapp.com/DMh0KZdn2FI4dsCOYVXxNQ"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white text-sm transition"
          >
            Entrar no WhatsApp
          </a>

        </div>
      </div>

      <div className="text-center text-xs text-slate-500 py-2 border-t border-slate-800">
        © {new Date().getFullYear()} FCS • v1.3 - Miscellaneousaurus
                  <p><a
            href="https://liga-fcs-yugioh.vercel.app/"
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
              Desenvolvido por Jamerson "Son" Siqueira
          </a>
          </p>
      </div>
    </footer>
  )
}