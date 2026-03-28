import { Link } from "react-router-dom"
import logo from "../assets/logonavbar.png"

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">

          {/* 🔥 MOBILE + DESKTOP CONTAINER */}
          <div className="flex flex-col items-center md:flex-row md:justify-between">

            {/* LOGO */}
            <Link to="/" className="mb-3 md:mb-0">
              <img
                src={logo}
                alt="FCS Logo"
                className="
                  h-20
                  md:h-24
                  object-contain
                "
              />
            </Link>

            {/* NAV */}
            <div className="
              w-full
              flex
              justify-center
              gap-4
              text-sm text-slate-300
              
              md:w-auto
              md:justify-end
              md:gap-6
            ">

              <Link to="/" className="hover:text-white transition">
                Ranking
              </Link>

              <Link to="/torneios" className="hover:text-white transition">
                Torneios
              </Link>

              <Link to="/meta" className="hover:text-white transition">
                Meta
              </Link>

              <Link to="/banlists" className="hover:text-white transition">
                Banlists
              </Link>

            </div>

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