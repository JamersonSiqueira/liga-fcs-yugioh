import { Routes, Route } from "react-router-dom"

import MainLayout from "./layouts/MainLayout"
import Ranking from "./pages/Ranking"
import Torneios from "./pages/Torneios"
import TorneioDetalhe from "./pages/TorneioDetalhe"

function Banlists() {
  return <div className="text-white">Página de Banlists</div>
}

function App() {
  return (
    <MainLayout>

      <Routes>

        <Route path="/" element={<Ranking />} />

        <Route path="/torneios" element={<Torneios />} />

        <Route path="/torneios/:id" element={<TorneioDetalhe />} />

        <Route path="/banlists" element={<Banlists />} />

      </Routes>

    </MainLayout>
  )
}

export default App