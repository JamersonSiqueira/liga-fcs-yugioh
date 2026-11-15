import { useState, useEffect } from "react"
import { fetchAdmin } from "../../services/adminFetch"
import { API_URL } from "../../services/api"

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function comprimirImagem(file, maxSize = 450, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        const head = "data:image/jpeg;base64,"
        const compressedBytes = Math.round((compressedBase64.length - head.length) * 3 / 4)

        resolve({
          base64: compressedBase64,
          bytesOriginal: file.size,
          bytesComprimido: compressedBytes,
          tamanhoOriginal: formatBytes(file.size),
          tamanhoComprimido: formatBytes(compressedBytes),
          reducao: Math.round(((file.size - compressedBytes) / file.size) * 100)
        })
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

function AdminJogadoresManager() {

  const [jogadores, setJogadores] = useState([])

  const [nickname, setNickname] = useState("")
  const [nome, setNome] = useState("")
  const [fotoUrl, setFotoUrl] = useState("")
  
  // Feedback e Upload Status
  const [uploadModal, setUploadModal] = useState(null) // { etapa, progresso, orig, comp, reducao }
  const [salvando, setSalvando] = useState(false)
  const [feedback, setFeedback] = useState(null) // { tipo: 'sucesso' | 'erro', msg: '' }

  const [editandoId, setEditandoId] = useState(null)

  async function carregarJogadores() {
    try {
      const res = await fetch(`${API_URL}/jogadores`)
      const data = await res.json()
      setJogadores(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    carregarJogadores()
  }, [])

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadModal({
      etapa: "otimizando",
      progresso: 30,
      tamanhoOriginal: formatBytes(file.size),
      tamanhoComprimido: "Calculando...",
      reducao: 0,
      mensagem: "Otimizando imagem para alta performance..."
    })

    try {
      // 1. Compressão local instantânea via canvas
      const comp = await comprimirImagem(file, 450, 0.85)

      setUploadModal({
        etapa: "enviando",
        progresso: 70,
        tamanhoOriginal: comp.tamanhoOriginal,
        tamanhoComprimido: comp.tamanhoComprimido,
        reducao: comp.reducao,
        mensagem: `Reduzido de ${comp.tamanhoOriginal} para ${comp.tamanhoComprimido} (${comp.reducao}% menor)! Enviando...`
      })

      // 2. Envio da imagem otimizada para o backend
      const res = await fetchAdmin(`${API_URL}/admin/upload-foto`, {
        method: "POST",
        body: JSON.stringify({
          imagemBase64: comp.base64,
          filename: file.name
        })
      })

      if (res && res.ok) {
        const data = await res.json()
        setFotoUrl(data.url)
      } else {
        // Fallback: se a rota der qualquer problema, usa a própria imagem comprimida
        setFotoUrl(comp.base64)
      }

      setUploadModal({
        etapa: "concluido",
        progresso: 100,
        tamanhoOriginal: comp.tamanhoOriginal,
        tamanhoComprimido: comp.tamanhoComprimido,
        reducao: comp.reducao,
        mensagem: "Foto otimizada e pronta para salvar!"
      })

      setTimeout(() => {
        setUploadModal(null)
      }, 1600)

    } catch (err) {
      console.error(err)
      setUploadModal({
        etapa: "erro",
        progresso: 100,
        mensagem: "Erro ao processar imagem. Tente novamente."
      })
      setTimeout(() => setUploadModal(null), 3000)
    }
  }

  async function salvarJogador() {
    if (!nickname.trim()) {
      alert("Nickname é obrigatório")
      return
    }

    setSalvando(true)
    setFeedback(null)

    let url = `${API_URL}/jogadores`
    let method = "POST"

    if (editandoId) {
      url = `${API_URL}/jogadores/${editandoId}`
      method = "PUT"
    }

    try {
      const res = await fetchAdmin(url, {
        method,
        body: JSON.stringify({
          nickname,
          nome,
          foto_url: fotoUrl || null
        })
      })

      if (res && res.ok) {
        setFeedback({
          tipo: "sucesso",
          msg: editandoId ? `✅ Jogador "${nickname}" atualizado com sucesso!` : `✅ Jogador "${nickname}" criado com sucesso!`
        })
        cancelarEdicao()
        carregarJogadores()
        setTimeout(() => setFeedback(null), 4000)
      } else {
        const data = await res.json().catch(() => ({}))
        setFeedback({
          tipo: "erro",
          msg: data.error || `Erro ao salvar (${res.status} ${res.statusText})`
        })
      }
    } catch (err) {
      console.error(err)
      setFeedback({
        tipo: "erro",
        msg: "Erro de conexão ao salvar jogador."
      })
    } finally {
      setSalvando(false)
    }
  }

  function editarJogador(j) {
    setEditandoId(j.id)
    setNickname(j.nickname)
    setNome(j.nome || "")
    setFotoUrl(j.foto_url || "")
    setFeedback(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deletarJogador(id) {
    if (!confirm("Deseja remover este jogador?")) return

    const res = await fetchAdmin(`${API_URL}/jogadores/${id}`, {
      method: "DELETE"
    })

    if (res && res.ok) {
      carregarJogadores()
      setFeedback({ tipo: "sucesso", msg: "Jogador removido com sucesso." })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNickname("")
    setNome("")
    setFotoUrl("")
  }

  return (

    <div className="grid gap-6">

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

      {/* MODAL DE UPLOAD COM NÚMEROS REAIS */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl">
              {uploadModal.etapa === "concluido" ? "✅" : uploadModal.etapa === "erro" ? "❌" : "⚙️"}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">
                {uploadModal.etapa === "concluido" ? "Upload Concluído!" : uploadModal.etapa === "erro" ? "Erro no Processamento" : "Otimizando Imagem"}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {uploadModal.mensagem}
              </p>
            </div>

            {uploadModal.tamanhoOriginal && (
              <div className="bg-slate-800 rounded-lg p-3 text-xs flex justify-around border border-slate-700 text-slate-300">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Original</span>
                  <span className="font-bold text-white">{uploadModal.tamanhoOriginal}</span>
                </div>
                <div className="text-slate-500 font-bold self-center">➔</div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Otimizado</span>
                  <span className="font-bold text-green-400">{uploadModal.tamanhoComprimido}</span>
                </div>
                {uploadModal.reducao > 0 && (
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Economia</span>
                    <span className="font-bold text-sky-400">-{uploadModal.reducao}%</span>
                  </div>
                )}
              </div>
            )}

            {/* BARRA DE PROGRESSO COM PORCENTAGEM REAL */}
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadModal.etapa === "concluido" ? "bg-green-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${uploadModal.progresso}%` }}
                />
              </div>
              <div className="text-right text-[10px] text-slate-400">
                {uploadModal.progresso}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl text-white font-bold mb-4">
          {editandoId ? "Editar Jogador" : "Criar Jogador"}
        </h2>

        <div className="grid gap-3">
          <input
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
          />

          <input
            placeholder="Nome real"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded p-2 text-white"
          />

          {/* FOTO: UPLOAD OU LINK */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              📸 Foto do Jogador (Mural do Top 8 e Perfil)
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {fotoUrl ? (
                <div className="relative group">
                  <img
                    src={fotoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoUrl("")}
                    className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow"
                    title="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-2xl text-slate-400">
                  👤
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <input
                  placeholder="URL direta da foto (Imgur, Discord, Drive)"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded transition inline-flex items-center gap-1.5">
                    <span>📁 Escolher Arquivo do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={salvarJogador}
              disabled={salvando}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-5 py-2.5 rounded font-semibold transition flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando alterações...</span>
                </>
              ) : (
                <span>{editandoId ? "Salvar Alterações" : "Criar Jogador"}</span>
              )}
            </button>

            {editandoId && (
              <button
                onClick={cancelarEdicao}
                disabled={salvando}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl text-white font-bold mb-4 flex items-center justify-between">
          <span>Jogadores cadastrados ({jogadores.length})</span>
          <span className="text-xs font-normal text-slate-400">
            {jogadores.filter(j => j.foto_url).length} com foto
          </span>
        </h2>

        <div className="grid gap-2">
          {jogadores.map(j => (
            <div
              key={j.id}
              className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700/60 hover:border-slate-600 transition"
            >
              <div className="flex items-center gap-3">
                {/* PREVIEW MINIATURA */}
                {j.foto_url ? (
                  <img
                    src={j.foto_url}
                    alt={j.nickname}
                    className="w-10 h-10 rounded-full object-cover border border-sky-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm text-slate-400">
                    👤
                  </div>
                )}

                <div className="text-white">
                  <div className="font-semibold flex items-center gap-2">
                    <span>{j.nickname}</span>
                    {j.foto_url ? (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                        🟢 Com foto
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full border border-slate-600">
                        ⚪ Sem foto
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-400">
                    {j.nome || "-"}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editarJogador(j)}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-sm transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => deletarJogador(j.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  )

}

export default AdminJogadoresManager