import { Routes, Route } from "react-router-dom"

import MainLayout from "./layouts/MainLayout"
import Ranking from "./pages/Ranking"
import Torneios from "./pages/Torneios"
import TorneioDetalhe from "./pages/TorneioDetalhe"
import Admin from "./pages/Admin"
import Banlists from "./pages/Banlists"
import AdminPanel from "./pages/admin/AdminPanel"


function App() {
  return (
    <MainLayout>

      <Routes>

        <Route path="/" element={<Ranking />} />

        <Route path="/torneios" element={<Torneios />} />

        <Route path="/torneios/:id" element={<TorneioDetalhe />} />

        <Route path="/banlists" element={<Banlists />} />
        
        <Route path="/ajustesold" element={<Admin />} />

        <Route path="/ajustes" element={<AdminPanel />} />

      </Routes>

    </MainLayout>
  )
}

export default App