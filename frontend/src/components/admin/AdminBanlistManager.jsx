import { useEffect, useState } from "react";
import { fetchAdmin } from "../../services/adminFetch";

export default function AdminBanlistManager() {
  const [banlists, setBanlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    nome: "",
    data_inicio: "",
  });

  // =========================
  // LOAD
  // =========================
  async function carregarBanlists() {
    setLoading(true);
    setErro("");

    try {
      const res = await fetchAdmin("/banlists");

      if (!res) return;

      if (!res.ok) {
        throw new Error("Erro ao buscar banlists");
      }

      const data = await res.json();
      setBanlists(data);
    } catch (error) {
      setErro(error.message || "Erro ao carregar banlists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarBanlists();
  }, []);

  // =========================
  // FORM
  // =========================
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      nome: "",
      data_inicio: "",
    });
  }

  function validar() {
    if (!form.nome.trim()) {
      setErro("Nome é obrigatório");
      return false;
    }

    if (!form.data_inicio) {
      setErro("Data de início é obrigatória");
      return false;
    }

    return true;
  }

  // =========================
  // CREATE
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!validar()) return;

    try {
      const res = await fetchAdmin("/banlists", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!res) return;

      if (!res.ok) {
        throw new Error("Erro ao criar banlist");
      }

      setSucesso("Banlist criada com sucesso");
      resetForm();
      carregarBanlists();
    } catch (error) {
      setErro(error.message || "Erro ao criar");
    }
  }

  // =========================
  // ATIVAR
  // =========================
  async function handleAtivar(id) {
    setErro("");
    setSucesso("");

    try {
      const res = await fetchAdmin(`/banlists/${id}/ativar`, {
        method: "PATCH",
      });

      if (!res) return;

      if (!res.ok) {
        throw new Error("Erro ao ativar banlist");
      }

      setSucesso("Banlist ativada com sucesso");
      carregarBanlists();
    } catch (error) {
      setErro(error.message || "Erro ao ativar");
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="mt-5">
      <h2 className="text-xl font-bold text-white mb-4">
        Gerenciar Banlists
      </h2>

      {erro && <p className="text-red-500">{erro}</p>}
      {sucesso && <p className="text-green-500">{sucesso}</p>}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          name="nome"
          placeholder="Nome da Banlist"
          value={form.nome}
          onChange={handleChange}
          className="px-2 py-1 rounded bg-slate-800 text-white"
        />

        <input
          type="date"
          name="data_inicio"
          value={form.data_inicio}
          onChange={handleChange}
          className="px-2 py-1 rounded bg-slate-800 text-white"
        />

        <button
          type="submit"
          className="px-4 py-1 bg-sky-600 text-white rounded"
        >
          Criar
        </button>
      </form>

      {/* LISTA */}
      {loading ? (
        <p className="text-white">Carregando...</p>
      ) : (
        <table className="w-full text-white border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Data Início</th>
              <th className="p-2 border">Ativa</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {banlists.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-2">
                  Nenhuma banlist encontrada
                </td>
              </tr>
            ) : (
              banlists.map((b) => (
                <tr key={b.id} className="text-center">
                  <td className="p-2 border">{b.nome}</td>
                  <td className="p-2 border">
                    {b.data_inicio
                      ? new Date(b.data_inicio).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    {b.ativa ? "Sim" : "Não"}
                  </td>
                  <td className="p-2 border">
                    {!b.ativa && (
                      <button
                        onClick={() => handleAtivar(b.id)}
                        className="px-3 py-1 bg-green-600 rounded"
                      >
                        Ativar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}