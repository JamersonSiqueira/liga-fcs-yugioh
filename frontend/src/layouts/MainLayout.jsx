import { Link } from "react-router-dom"

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

          <h1 className="text-lg font-bold text-sky-400">
            FCS - Feira Championship Series
          </h1>

          <div className="flex gap-6 text-sm text-slate-300">

            <Link
              to="/"
              className="hover:text-white"
            >
              Ranking
            </Link>

            <Link
              to="/torneios"
              className="hover:text-white"
            >
              Torneios
            </Link>

            <Link
              to="/banlists"
              className="hover:text-white"
            >
              Banlists
            </Link>

          </div>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {children}
      </main>

    </div>
  )
}

export default MainLayout