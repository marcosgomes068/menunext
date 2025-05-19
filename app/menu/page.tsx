"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface Categoria {
  id: number;
  nome: string;
}
interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria_id: number;
  imagem?: string;
}

export default function MenuCardapio() {
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [editRestName, setEditRestName] = useState<string>("");
  const [editRestWhatsapp, setEditRestWhatsapp] = useState<string>("");
  const [editRestMsgWhatsapp, setEditRestMsgWhatsapp] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("#2563eb"); // azul padrão
  const [secondaryColor, setSecondaryColor] = useState<string>("#f1f5f9"); // cinza claro padrão
  const [showConfig, setShowConfig] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setUser(userObj);
      setIsPro(userObj.plan === "pro");
      // Busca nome do restaurante
      fetch("/api/adm", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          const found = data.users?.find((u: any) => u.username === userObj.username);
          if (found && found.restaurantName) {
            setRestaurantName(found.restaurantName);
            setEditRestName(found.restaurantName);
            if (found.primaryColor) setPrimaryColor(found.primaryColor);
            if (found.secondaryColor) setSecondaryColor(found.secondaryColor);
            if (found.whatsapp) setEditRestWhatsapp(found.whatsapp);
            if (found.msgWhatsapp) setEditRestMsgWhatsapp(found.msgWhatsapp);
          }
        });
      fetch("/api/user-qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userObj.username }),
      })
        .then((res) => res.json())
        .then((data) => {
          setQrcode(data.qrcode || null);
        })
        .finally(() => setLoading(false));
      // Carrega categorias e produtos do usuário
      fetch(`/api/produtos?username=${userObj.username}`)
        .then((res) => res.json())
        .then((data) => {
          setProdutos(data.produtos || []);
          setCategorias(data.categorias || []);
        });
    } else {
      setLoading(false);
    }
  }, [mounted]);

  const adicionarCategoria = async () => {
    if (!novaCategoria || !user) return;
    if (!isPro && categorias.length >= 2) {
      alert("Usuários do plano Free só podem criar até 2 categorias. Para mais, assine o plano Pro.");
      return;
    }
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, categoria: novaCategoria }),
    });
    const data = await res.json();
    if (data.success && data.categoria) {
      setCategorias([...categorias, data.categoria]);
      setNovaCategoria("");
    }
  };

  const adicionarProduto = async () => {
    if (!novoNome || !user || !categoriaSelecionada) return;
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, nome: novoNome, preco: parseFloat(novoPreco) || 0, categoria_id: categoriaSelecionada }),
    });
    const data = await res.json();
    if (data.success) {
      setProdutos([...produtos, { id: data.id, nome: novoNome, preco: parseFloat(novoPreco) || 0, categoria_id: categoriaSelecionada }]);
      setNovoNome("");
      setNovoPreco("");
    }
  };

  const salvarEdicao = async (id: number) => {
    const res = await fetch("/api/produtos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nome: editNome, preco: parseFloat(editPreco) || 0 }),
    });
    const data = await res.json();
    if (data.success) {
      setProdutos(produtos.map(p => p.id === id ? { ...p, nome: editNome, preco: parseFloat(editPreco) || 0 } : p));
      setEditandoId(null);
    }
  };

  const excluirProduto = async (id: number) => {
    const res = await fetch("/api/produtos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  const excluirCategoria = async (id: number) => {
    if (!user) return;
    const res = await fetch("/api/produtos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria_id: id, username: user.username }),
    });
    const data = await res.json();
    if (data.success) {
      setCategorias(categorias.filter(c => c.id !== id));
      setProdutos(produtos.filter(p => p.categoria_id !== id));
    }
  };

  const salvarConfigRestaurante = async () => {
    if (!user) return;
    const res = await fetch("/api/adm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        restaurantName: editRestName,
        primaryColor,
        secondaryColor,
        whatsapp: editRestWhatsapp,
        msgWhatsapp: editRestMsgWhatsapp,
        configOnly: true
      })
    });
    const data = await res.json();
    if (data.success) {
      setRestaurantName(editRestName);
      setShowConfig(false);
    }
  };

  const handleUploadImagem = async (produtoId: number, file: File) => {
    if (!user) return;
    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("produtoId", produtoId.toString());
    formData.append("file", file);
    // Força o endpoint correto, independente de ambiente
    const res = await fetch("/api/produtos/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      setProdutos(produtos.map(p => p.id === produtoId ? { ...p, imagem: data.url } : p));
    }
  };

  if (!mounted) {
    return <div className="p-10 text-center z-10">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-2 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Modal de configuração do restaurante */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowConfig(false)} title="Fechar">&times;</button>
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Configurações do Restaurante</h2>
            <label htmlFor="rest-nome" className="font-semibold">Nome do restaurante</label>
            <input
              id="rest-nome"
              className="border rounded px-3 py-2 mb-2"
              value={editRestName}
              onChange={e => setEditRestName(e.target.value)}
              placeholder="Nome do restaurante"
              title="Nome do restaurante"
            />
            <label htmlFor="rest-whatsapp" className="font-semibold">WhatsApp do restaurante</label>
            <input
              id="rest-whatsapp"
              className="border rounded px-3 py-2 mb-2"
              value={editRestWhatsapp || ''}
              onChange={e => setEditRestWhatsapp(e.target.value)}
              placeholder="(99) 99999-9999"
              title="WhatsApp do restaurante"
              type="tel"
              pattern="\(\d{2}\) \d{5}-\d{4}"
            />
            <label htmlFor="rest-msg-whatsapp" className="font-semibold">Mensagem personalizada do WhatsApp</label>
            <textarea
              id="rest-msg-whatsapp"
              className="border rounded px-3 py-2 mb-2 min-h-[60px]"
              value={editRestMsgWhatsapp || ''}
              onChange={e => setEditRestMsgWhatsapp(e.target.value)}
              placeholder="Olá! Gostaria de fazer um pedido..."
              title="Mensagem personalizada do WhatsApp"
              maxLength={300}
            />
            <label htmlFor="cor-primaria" className="font-semibold">Cor primária</label>
            <input
              id="cor-primaria"
              type="color"
              className="w-12 h-8 p-0 border-none mb-2"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              title="Cor primária"
            />
            <label htmlFor="cor-secundaria" className="font-semibold">Cor secundária</label>
            <input
              id="cor-secundaria"
              type="color"
              className="w-12 h-8 p-0 border-none mb-4"
              value={secondaryColor}
              onChange={e => setSecondaryColor(e.target.value)}
              title="Cor secundária"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow"
              onClick={salvarConfigRestaurante}
              type="button"
            >Salvar</button>
          </div>
        </div>
      )}
      {/* Header e botões principais */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4 mb-6">
        <h1 className="text-3xl font-extrabold text-blue-700 text-center md:text-left drop-shadow">Painel do Cardápio</h1>
        <div className="flex flex-row flex-wrap gap-2 items-center justify-center md:justify-end w-full md:w-auto">
          <button
            className="flex items-center justify-center bg-white text-blue-700 border border-blue-700 px-3 py-2 rounded shadow hover:bg-blue-50 transition"
            onClick={() => setShowConfig(true)}
            type="button"
            title="Configurar Restaurante"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 2.25c.966 0 1.75.784 1.75 1.75v.5a7.001 7.001 0 014.95 4.95h.5a1.75 1.75 0 110 3.5h-.5a7.001 7.001 0 01-4.95 4.95v.5a1.75 1.75 0 11-3.5 0v-.5a7.001 7.001 0 01-4.95-4.95h-.5a1.75 1.75 0 110-3.5h.5a7.001 7.001 0 014.95-4.95v-.5a1.75 1.75 0 011.75-1.75z" /></svg>
            Configurações
          </button>
          <button
            className="flex items-center justify-center bg-blue-700 text-white px-3 py-2 rounded shadow hover:bg-blue-800 transition"
            onClick={() => {
              if (restaurantName) {
                window.open(`/menu/publico?nome=${encodeURIComponent(restaurantName)}`, "_blank");
              }
            }}
            title="Visualizar Cardápio Público"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
            Cardápio Público
          </button>
        </div>
      </div>
      {/* Área de edição do cardápio público */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col gap-6 mx-auto my-4 overflow-y-auto animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Editar Cardápio</h2>
        {/* Adicionar categoria */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
          <input
            className="flex-1 border rounded px-3 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="Nova categoria"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition w-full sm:w-auto" onClick={adicionarCategoria}>Adicionar Categoria</button>
        </div>
        {/* Listar categorias e produtos */}
        <div className="flex flex-col gap-6">
          {categorias.map((cat) => (
            <div key={cat.id} className="mb-2 bg-blue-50 rounded-xl shadow p-4">
              <div className="font-bold text-blue-700 mb-3 text-lg flex flex-row items-center justify-between">
                <span>{cat.nome}</span>
                <button className="text-xs text-red-500 hover:underline" onClick={() => excluirCategoria(cat.id)}>Excluir</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {produtos.filter(p => p.categoria_id === cat.id).map((produto) => (
                  <div key={produto.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4 gap-2 relative">
                    {produto.imagem && (
                      <img src={produto.imagem} alt={produto.nome} className="w-24 h-24 object-cover rounded shadow border mb-2 bg-gray-100" />
                    )}
                    <input
                      className="w-full border rounded px-2 py-2 bg-gray-50 input-produto-nome text-center font-semibold text-base mb-1"
                      value={produto.nome}
                      disabled
                      placeholder="Nome do produto"
                      title={produto.nome}
                    />
                    <input
                      className="w-full border rounded px-2 py-2 bg-gray-50 input-produto-preco text-center font-bold text-blue-700 mb-2"
                      value={produto.preco}
                      disabled
                      placeholder="Preço"
                      title="Preço"
                    />
                    <label className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700 transition w-full text-center">
                      Upload Imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) handleUploadImagem(produto.id, e.target.files[0]);
                        }}
                        className="hidden"
                        title="Enviar imagem do produto"
                        placeholder="Imagem do produto"
                      />
                    </label>
                    <div className="flex flex-row gap-2 w-full mt-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex-1" onClick={() => { setEditandoId(produto.id); setEditNome(produto.nome); setEditPreco(produto.preco.toString()); }}>Editar</button>
                      <button
                        onClick={() => excluirProduto(produto.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex-1"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                {/* Adicionar produto nesta categoria */}
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-blue-300 p-4 gap-2">
                  <input
                    className="w-full border rounded px-2 py-2 bg-white text-center mb-1"
                    placeholder="Nome do produto"
                    value={categoriaSelecionada === cat.id ? novoNome : ""}
                    onChange={e => { setNovoNome(e.target.value); setCategoriaSelecionada(cat.id); }}
                  />
                  <input
                    className="w-full border rounded px-2 py-2 bg-white text-center mb-2"
                    placeholder="Preço"
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoriaSelecionada === cat.id ? novoPreco : ""}
                    onChange={e => { setNovoPreco(e.target.value); setCategoriaSelecionada(cat.id); }}
                  />
                  <label className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700 transition w-full text-center">
                    Upload Imagem
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0] && categoriaSelecionada) {
                          adicionarProduto().then(() => {
                            const novoProduto = produtos.find(p => p.nome === novoNome && p.categoria_id === categoriaSelecionada);
                            if (novoProduto && e.target.files && e.target.files[0]) handleUploadImagem(novoProduto.id, e.target.files[0]);
                          });
                        }
                      }}
                      className="hidden"
                      title="Enviar imagem do produto"
                      placeholder="Imagem do produto"
                    />
                  </label>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full mt-2" onClick={adicionarProduto}>Adicionar Produto</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* QR Code para usuários PRO */}
        {isPro && qrcode && (
          <div className="flex flex-col items-center justify-center w-full mt-8">
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center gap-2">
              <QRCode value={`QR Code do Cardápio\n${qrcode}`} size={120} />
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                onClick={async () => {
                  const userStr = localStorage.getItem("user");
                  if (!userStr) return;
                  const user = JSON.parse(userStr);
                  // Chama a API de user-qrcode para gerar novo QR Code
                  const res = await fetch("/api/user-qrcode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username, forceNewQr: true }),
                  });
                  const data = await res.json();
                  if (data.qrcode) setQrcode(data.qrcode);
                }}
              >
                Gerar outro QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
