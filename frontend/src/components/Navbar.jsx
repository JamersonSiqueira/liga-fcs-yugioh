import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800">

      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-6">

        <Link
          to="/"
          className="text-slate-300 hover:text-white font-medium"
        >
          Ranking
        </Link>

        <Link
          to="/torneios"
          className="text-slate-300 hover:text-white font-medium"
        >
          Torneios
        </Link>

        <Link
          to="/banlists"
          className="text-slate-300 hover:text-white font-medium"
        >
          Banlists
        </Link>

      </div>

    </nav>
  )
}

export default Navbar