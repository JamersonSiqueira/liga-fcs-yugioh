import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function AdminTop8Manager() {
  const [config, setConfig] = useState(null)
  const [classificados, setClassificados] = useState([])
  const [partidas, setPartidas] = useState([])
  const [tabelaClassificacao, setTabelaClassificacao] = useState([])
  const [rodadaAtiva, setRodadaAtiva] = useState("rodada_1")
  const [loading, setLoading] = useState(true)

  // Formulário para lançar partida individual do KCGN
  const [novoJ1, setNovoJ1] = useState("")
  const [novoJ2, setNovoJ2] = useState("")
  const [novoV1, setNovoV1] = useState(2)
  const [novoV2, setNovoV2] = useState(0)
  const [salvandoNova, setSalvandoNova] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function carregarDados() {
    try {
      setLoading(true)
      const [resConfig, resClassificados, resPartidas] = await Promise.all([
        fetchAdmin(`${API_URL}/top8/config`),
        fetchAdmin(`${API_URL}/top8/classificados`),
        fetchAdmin(`${API_URL}/top8/partidas`)
      ])

      if (resConfig && resConfig.ok) {
        setConfig(await resConfig.json())
      }
      if (resClassificados && resClassificados.ok) {
        setClassificados(await resClassificados.json())
      }
      if (resPartidas && resPartidas.ok) {
        const data = await resPartidas.json()
        setPartidas(data.partidas || [])
        setTabelaClassificacao(data.classificacao_top8 || [])
      }
    } catch (err) {
      console.error("Erro ao carregar dados do Top 8:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function atualizarConfig(novoStatus, novaFase) {
    const res = await fetchAdmin(`${API_URL}/top8/config`, {
      method: "PUT",
      body: JSON.stringify({
        status: novoStatus || config?.status,
        fase_atual: novaFase || config?.fase_atual,
        campeao_id: config?.campeao_id,
        vice_id: config?.vice_id,
        terceiro_id: config?.terceiro_id
      })
    })

    if (res && res.ok) {
      carregarDados()
      setFeedback({ tipo: "sucesso", msg: "Modo de exibição do Top 8 atualizado no site!" })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  async function adicionarPartidaKCGN() {
    if (!novoJ1 || !novoJ2) {
      alert("Selecione os dois jogadores do confronto.")
      return
    }

    if (novoJ1 === novoJ2) {
      alert("O Jogador 1 e Jogador 2 não podem ser a mesma pessoa.")
      return
    }

    setSalvandoNova(true)
    try {
      const res = await fetchAdmin(`${API_URL}/top8/partida`, {
        method: "POST",
        body: JSON.stringify({
          rodada: rodadaAtiva,
          jogador1_id: novoJ1,
          jogador2_id: novoJ2,
          vitorias_j1: Number(novoV1),
          vitorias_j2: Number(novoV2),
          empates: 0,
          concluida: true
        })
      })

      if (res && res.ok) {
        setNovoJ1("")
        setNovoJ2("")
        setNovoV1(2)
        setNovoV2(0)
        carregarDados()
        setFeedback({ tipo: "sucesso", msg: "Partida do KCGN registrada com sucesso!" })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "Erro ao adicionar partida")
      }
    } catch (e) {
      alert("Erro ao conectar com o servidor.")
    } finally {
      setSalvandoNova(false)
    }
  }

  async function salvarPlacar(partidaId, v1, v2, empates, concluida) {
    const res = await fetchAdmin(`${API_URL}/top8/partida/${partidaId}`, {
      method: "PUT",
      body: JSON.stringify({
        vitorias_j1: Number(v1),
        vitorias_j2: Number(v2),
        empates: Number(empates || 0),
        concluida: concluida
      })
    })

    if (res && res.ok) {
      carregarDados()
      setFeedback({ tipo: "sucesso", msg: "Placar salvo!" })
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  async function deletarPartida(partidaId) {
    if (!confirm("Deseja remover esta partida do Top 8?")) return

    const res = await fetchAdmin(`${API_URL}/top8/partida/${partidaId}`, {
      method: "DELETE"
    })

    if (res && res.ok) {
      carregarDados()
    }
  }

  async function salvarPodio(campeaoId, viceId, terceiroId) {
    if (!campeaoId) {
      alert("Selecione pelo menos o Campeão.")
      return
    }

    const res = await fetchAdmin(`${API_URL}/top8/config`, {
      method: "PUT",
      body: JSON.stringify({
        status: "concluido",
        fase_atual: "finalizado",
        campeao_id: campeaoId,
        vice_id: viceId || null,
        terceiro_id: terceiroId || null
      })
    })

    if (res && res.ok) {
      alert("Pódio oficial publicado no site com sucesso!")
      carregarDados()
    }
  }

  if (loading && !config) {
    return <p className="text-white">Carregando dados do Top 8...</p>
  }

  const partidasFiltradas = partidas.filter(p => {
    if (rodadaAtiva === "finais") {
      return p.rodada === "final" || p.rodada === "terceiro_lugar"
    }
    return p.rodada === rodadaAtiva
  })

  const partidaFinal = partidas.find(p => p.rodada === "final")
  const partidaTerceiro = partidas.find(p => p.rodada === "terceiro_lugar")

  return (
    <div className="grid gap-6 text-white">

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow ${
          feedback.tipo === "sucesso"
            ? "bg-green-500/10 border-green-500/30 text-green-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          <span className="font-semibold">{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="text-xs px-2 py-1 rounded hover:bg-slate-800">✕</button>
        </div>
      )}

      {/* HEADER E CONTROLE DE STATUS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            👑 Gerenciamento do Top 8 (KCGN)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Lance os resultados reais gerados pelo software da Konami (KCGN) por rodada.
          </p>
        </div>

        {/* STATUS TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Exibição no Site:</span>
          <select
            value={config?.fase_atual || "mural"}
            onChange={(e) => atualizarConfig(e.target.value === "finalizado" ? "concluido" : "em_andamento", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sky-400 font-semibold text-xs rounded p-2"
          >
            <option value="mural">🖼️ Apenas Mural (Apresentação dos 8)</option>
            <option value="rodadas">⚔️ Fase de 7 Rodadas (KCGN)</option>
            <option value="finais">🏆 Confrontos Finais (Final e 3º Lugar)</option>
            <option value="finalizado">👑 Finalizado (Exibir Pódio Oficial)</option>
          </select>
        </div>
      </div>

      {/* 1. MURAL DOS 8 CLASSIFICADOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400 mb-4">
          ⭐ Os 8 Duelistas Classificados
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {classificados.map((c) => (
            <div
              key={c.jogador_id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 relative"
            >
              <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Seed #{c.seed}
              </span>

              {c.foto_url ? (
                <img
                  src={c.foto_url}
                  alt={c.nickname}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-lg text-slate-400 shrink-0">
                  👤
                </div>
              )}

              <div className="truncate pr-8">
                <div className="font-bold text-sm text-white truncate">
                  {c.nickname}
                </div>
                <div className="text-xs text-sky-400 truncate">
                  {c.deck_principal || "Deck não reg."}
                </div>
                <div className="text-[11px] text-slate-400">
                  {c.total_pontos} pts • {c.aproveitamento}% WR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TABELA DE CLASSIFICAÇÃO COMPUTADA A PARTIR DO KCGN */}
      {tabelaClassificacao.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
            📊 Tabela de Classificação do Top 8 (Baseada nos Jogos do KCGN)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2">Pos</th>
                  <th>Jogador</th>
                  <th className="text-center">Jogos</th>
                  <th className="text-center">V</th>
                  <th className="text-center">D</th>
                  <th className="text-center" title="Dupla Derrota por Tempo Esgotado">DL</th>
                  <th className="text-center">Saldo</th>
                  <th className="text-center">Pontos</th>
                  <th>Destino KCGN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tabelaClassificacao.map((j) => (
                  <tr key={j.jogador_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 font-bold text-amber-400">{j.posicao}º</td>
                    <td className="font-semibold text-white flex items-center gap-2">
                      {j.foto_url && (
                        <img src={j.foto_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span>{j.nickname}</span>
                    </td>
                    <td className="text-center text-slate-300">{j.jogos}</td>
                    <td className="text-center font-bold text-green-400">{j.vitorias}</td>
                    <td className="text-center text-red-400">{j.derrotas}</td>
                    <td className="text-center font-semibold text-amber-400/90">
                      {j.double_losses > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold">
                          {j.double_losses}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="text-center text-slate-300">{j.saldo_sets > 0 ? `+${j.saldo_sets}` : j.saldo_sets}</td>
                    <td className="text-center font-bold text-white text-base">{j.pontos}</td>
                    <td>
                      {j.posicao <= 2 ? (
                        <span className="text-[11px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
                          🏆 Grande Final
                        </span>
                      ) : j.posicao <= 4 ? (
                        <span className="text-[11px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                          🥉 Disputa 3º Lugar
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LANÇADOR DE RESULTADOS DO KCGN */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          ⚔️ Lançamento de Partidas do KCGN
        </h3>

        {/* SELETOR DE RODADAS */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <button
              key={num}
              onClick={() => setRodadaAtiva(`rodada_${num}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rodadaAtiva === `rodada_${num}`
                  ? "bg-sky-600 text-white shadow"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Rodada {num}
            </button>
          ))}

          <button
            onClick={() => setRodadaAtiva("final")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              rodadaAtiva === "final"
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-800 text-amber-400 hover:bg-slate-700"
            }`}
          >
            🏆 Grande Final
          </button>

          <button
            onClick={() => setRodadaAtiva("terceiro_lugar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              rodadaAtiva === "terceiro_lugar"
                ? "bg-sky-500 text-slate-950 shadow"
                : "bg-slate-800 text-sky-400 hover:bg-slate-700"
            }`}
          >
            🥉 Disputa 3º Lugar
          </button>
        </div>

        {/* FORMULÁRIO DE INSERÇÃO MANUAL DO CONFRONTO */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
            + Inserir Confronto do KCGN na {rodadaAtiva.replace("_", " ").toUpperCase()}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* JOGADOR 1 */}
            <div className="sm:col-span-4">
              <select
                value={novoJ1}
                onChange={(e) => setNovoJ1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
              >
                <option value="">Selecione o Jogador 1</option>
                {classificados.map(c => (
                  <option key={c.jogador_id} value={c.jogador_id}>
                    #{c.seed} {c.nickname} ({c.deck_principal || "Sem deck"})
                  </option>
                ))}
              </select>
            </div>

            {/* PLACAR */}
            <div className="sm:col-span-3 flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                max="5"
                value={novoV1}
                onChange={(e) => setNovoV1(e.target.value)}
                className="w-12 text-center bg-slate-900 border border-slate-700 rounded p-1 font-bold text-white text-sm"
              />
              <span className="text-slate-500 font-bold">x</span>
              <input
                type="number"
                min="0"
                max="5"
                value={novoV2}
                onChange={(e) => setNovoV2(e.target.value)}
                className="w-12 text-center bg-slate-900 border border-slate-700 rounded p-1 font-bold text-white text-sm"
              />
            </div>

            {/* JOGADOR 2 */}
            <div className="sm:col-span-4">
              <select
                value={novoJ2}
                onChange={(e) => setNovoJ2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
              >
                <option value="">Selecione o Jogador 2</option>
                {classificados.map(c => (
                  <option key={c.jogador_id} value={c.jogador_id}>
                    #{c.seed} {c.nickname} ({c.deck_principal || "Sem deck"})
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÃO */}
            <div className="sm:col-span-1 flex justify-end">
              <button
                onClick={adicionarPartidaKCGN}
                disabled={salvandoNova}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold p-2 rounded text-xs transition shadow"
                title="Lançar partida"
              >
                {salvandoNova ? "..." : "+"}
              </button>
            </div>
          </div>

          {novoV1 !== "" && novoV2 !== "" && parseInt(novoV1) === parseInt(novoV2) && (
            <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-3 flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <span>
                <strong>Regra de Tempo (Double Loss):</strong> Ambos os duelistas terminaram empatados em sets ({novoV1} x {novoV2}). Pela regra oficial do Yu-Gi-Oh!, ambos receberão <strong>Derrota</strong> e <strong>0 pontos</strong>.
              </span>
            </div>
          )}
        </div>

        {/* LISTA DE PARTIDAS JÁ CADASTRADAS PARA ESTA RODADA */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">
            Partidas registradas ({partidasFiltradas.length}):
          </h4>

          {partidasFiltradas.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center bg-slate-800/30 rounded-lg border border-slate-800">
              Nenhuma partida do KCGN lançada para esta rodada ainda.
            </p>
          ) : (
            partidasFiltradas.map(p => (
              <PartidaLinhaAdmin
                key={p.id}
                partida={p}
                onSalvar={salvarPlacar}
                onDeletar={deletarPartida}
              />
            ))
          )}
        </div>
      </div>

      {/* 4. DEFINIÇÃO MANUAL DO PÓDIO OFICIAL */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
          👑 Consagração do Pódio Oficial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* CAMPEÃO */}
          <div className="bg-slate-800/70 border border-amber-500/40 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-1">🏆</span>
            <label className="block text-xs font-bold text-amber-300 uppercase mb-2">
              1º Lugar • Campeão
            </label>
            <select
              value={config?.campeao_id || ""}
              onChange={(e) => salvarPodio(e.target.value, config?.vice_id, config?.terceiro_id)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
            >
              <option value="">Selecione o Campeão</option>
              {classificados.map(c => (
                <option key={c.jogador_id} value={c.jogador_id}>
                  {c.nickname}
                </option>
              ))}
            </select>
          </div>

          {/* VICE */}
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-1">🥈</span>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              2º Lugar • Vice
            </label>
            <select
              value={config?.vice_id || ""}
              onChange={(e) => salvarPodio(config?.campeao_id, e.target.value, config?.terceiro_id)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
            >
              <option value="">Selecione o Vice</option>
              {classificados.map(c => (
                <option key={c.jogador_id} value={c.jogador_id}>
                  {c.nickname}
                </option>
              ))}
            </select>
          </div>

          {/* 3º LUGAR */}
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-center">
            <span className="text-2xl block mb-1">🥉</span>
            <label className="block text-xs font-bold text-amber-600/90 uppercase mb-2">
              3º Lugar
            </label>
            <select
              value={config?.terceiro_id || ""}
              onChange={(e) => salvarPodio(config?.campeao_id, config?.vice_id, e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
            >
              <option value="">Selecione o 3º Colocado</option>
              {classificados.map(c => (
                <option key={c.jogador_id} value={c.jogador_id}>
                  {c.nickname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

    </div>
  )
}

function PartidaLinhaAdmin({ partida, onSalvar, onDeletar }) {
  const [v1, setV1] = useState(partida.vitorias_j1 || 0)
  const [v2, setV2] = useState(partida.vitorias_j2 || 0)
  const [alterado, setAlterado] = useState(false)

  useEffect(() => {
    setV1(partida.vitorias_j1 || 0)
    setV2(partida.vitorias_j2 || 0)
    setAlterado(false)
  }, [partida])

  return (
    <div className="p-3 bg-slate-800 border border-slate-700/80 rounded-lg flex items-center justify-between gap-3 text-xs">
      {/* JOGADOR 1 */}
      <div className="flex items-center gap-2 flex-1 justify-end truncate">
        <span className="font-semibold text-white truncate">{partida.jogador1_nickname}</span>
        {partida.jogador1_foto ? (
          <img src={partida.jogador1_foto} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">👤</div>
        )}
      </div>

      {/* PLACAR */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min="0"
          max="5"
          value={v1}
          onChange={(e) => { setV1(e.target.value); setAlterado(true); }}
          className="w-10 text-center bg-slate-900 border border-slate-700 rounded p-1 font-bold text-white text-xs"
        />
        <span className="text-slate-500 font-bold">x</span>
        <input
          type="number"
          min="0"
          max="5"
          value={v2}
          onChange={(e) => { setV2(e.target.value); setAlterado(true); }}
          className="w-10 text-center bg-slate-900 border border-slate-700 rounded p-1 font-bold text-white text-xs"
        />

        {parseInt(v1) === parseInt(v2) && (
          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded font-black tracking-tight" title="Double Loss (Tempo)">
            DL
          </span>
        )}
      </div>

      {/* JOGADOR 2 */}
      <div className="flex items-center gap-2 flex-1 justify-start truncate">
        {partida.jogador2_foto ? (
          <img src={partida.jogador2_foto} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">👤</div>
        )}
        <span className="font-semibold text-white truncate">{partida.jogador2_nickname}</span>
      </div>

      {/* AÇÕES */}
      <div className="flex items-center gap-1.5 shrink-0">
        {alterado && (
          <button
            onClick={() => onSalvar(partida.id, v1, v2, 0, true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded text-[11px] font-bold"
          >
            Salvar
          </button>
        )}

        <button
          onClick={() => onDeletar(partida.id)}
          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-700"
          title="Excluir partida"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default AdminTop8Manager
