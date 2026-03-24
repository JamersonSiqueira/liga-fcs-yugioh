import { Link } from "react-router-dom"
import logo from "../assets/logonavbar.png"

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link to="/" className="hover:text-white transition">
              <div className="flex items-center gap-3">
            <img src={logo} alt="FCS Logo" className="h-32" />
          </div>
            </Link>
        
          {/* NAV */}
          <div className="flex gap-6 text-sm text-slate-300">

            <Link to="/" className="hover:text-white transition">
              Ranking
            </Link>

            <Link to="/torneios" className="hover:text-white transition">
              Torneios
            </Link>

            <Link to="/meta" className="hover:text-white transition">
              Meta Call
            </Link>

            <Link to="/banlists" className="hover:text-white transition">
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