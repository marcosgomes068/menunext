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
  imagem?: string | null;
}
interface RestauranteConfig {
  whatsapp?: string;
  msgWhatsapp?: string;
}

export default function CardapioPublico() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState<string>("#f1f5f9");
  const [restauranteConfig, setRestauranteConfig] = useState<RestauranteConfig>({});
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [qrcode, setQrcode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restaurantName = params.get("nome");
    if (!restaurantName) {
      setLoading(false);
      return;
    }
    // Buscar o usuário pelo nome do restaurante
    fetch("/api/adm")
      .then((res) => res.json())
      .then((data) => {
        const user = data.users?.find((u: any) => u.restaurantName === restaurantName);
        if (!user) {
          setLoading(false);
          return;
        }
        setRestaurantName(user.restaurantName);
        setPrimaryColor(user.primaryColor || "#2563eb");
        setSecondaryColor(user.secondaryColor || "#f1f5f9");
        setIsPro(user.plan === "pro");
        // Aplica as cores como variáveis CSS
        document.documentElement.style.setProperty('--rest-primary', user.primaryColor || '#2563eb');
        document.documentElement.style.setProperty('--rest-secondary', user.secondaryColor || '#f1f5f9');
        setRestauranteConfig({ whatsapp: user.whatsapp, msgWhatsapp: user.msgWhatsapp });
        fetch(`/api/produtos?username=${user.username}`)
          .then((res) => res.json())
          .then((data) => {
            setProdutos((data.produtos || []).map((p: any) => ({
              ...p,
              imagem: p.imagem && typeof p.imagem === 'string'
                ? (p.imagem.startsWith("/uploads/") ? p.imagem : `/uploads/${p.imagem.replace(/^\/+/,'')}`)
                : undefined
            })));
            setCategorias(data.categorias || []);
          })
          .finally(() => setLoading(false));
      });
  }, []);

  useEffect(() => {
    if (restauranteConfig.whatsapp) {
      setQrcode(`QR Code do Cardápio\nhttps://wa.me/${restauranteConfig.whatsapp.replace(/\D/g, '')}`);
    }
  }, [restauranteConfig.whatsapp]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-0 bg-rest-gradient">
      <div className="w-full max-w-full bg-white rounded-none shadow-none p-0 md:p-6">
        {restaurantName && (
          <h1 className="text-2xl font-bold mb-4 text-center text-rest-primary">{restaurantName}</h1>
        )}
        <h2 className="text-xl font-bold mb-6 text-center text-rest-primary">Cardápio</h2>
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : categorias.length === 0 ? (
          <div className="text-center text-gray-500">Nenhuma categoria cadastrada.</div>
        ) : (
          <div className="flex flex-col gap-8 w-full">
            {categorias.map((cat) => (
              <div key={cat.id} className="mb-2 w-full">
                <div className="font-bold mb-3 text-rest-primary text-lg text-center">{cat.nome}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                  {produtos.filter(p => p.categoria_id === cat.id).map((produto) => (
                    <div key={produto.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4 gap-2 relative">
                      {produto.imagem && (
                        <img src={produto.imagem} alt={produto.nome} className="w-48 h-48 object-cover rounded shadow border mb-2 bg-gray-100" />
                      )}
                      <div className="font-semibold text-center text-base mb-1">{produto.nome}</div>
                      <div className="font-bold text-blue-700 text-center mb-2">R$ {produto.preco.toFixed(2)}</div>
                      {isPro && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow text-xs ml-2 mt-2"
                          onClick={() => setCarrinho([...carrinho, produto])}
                        >
                          Adicionar ao carrinho
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Carrinho e WhatsApp apenas para Pro */}
      {isPro && (
        <>
          <button
            className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-blue-700 transition"
            onClick={() => setShowCarrinho(true)}
            title="Ver carrinho"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>
            {carrinho.length > 0 && (
              <span className="ml-2 bg-white text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold">{carrinho.length}</span>
            )}
          </button>
          {showCarrinho && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCarrinho(false)} title="Fechar">&times;</button>
                <h2 className="text-xl font-bold text-blue-700 mb-2">Seu Carrinho</h2>
                {carrinho.length === 0 ? (
                  <div className="text-center text-gray-500">Carrinho vazio.</div>
                ) : (
                  <ul className="divide-y mb-2">
                    {carrinho.map((item, idx) => (
                      <li key={idx} className="py-2 flex items-center gap-3 justify-between">
                        <span className="font-medium text-gray-800 flex-1">{item.nome}</span>
                        <span className="font-bold text-rest-primary ml-2">R$ {item.preco.toFixed(2)}</span>
                        <button className="text-red-500 hover:underline ml-2 text-xs" onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))}>Remover</button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow mt-2"
                  onClick={() => {
                    if (!restauranteConfig.whatsapp) return alert('Restaurante não configurou WhatsApp!');
                    let msg = restauranteConfig.msgWhatsapp || 'Olá! Gostaria de fazer um pedido:';
                    msg += '\n';
                    carrinho.forEach((item, idx) => {
                      msg += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
                    });
                    const url = `https://wa.me/${restauranteConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank');
                  }}
                  disabled={carrinho.length === 0}
                >
                  Pedir via WhatsApp
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* QR Code apenas para Pro */}
      {isPro && restauranteConfig.whatsapp && qrcode && (
        <div className="flex flex-col items-center justify-center w-full mt-8">
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center gap-2">
            <QRCode value={qrcode} size={120} />
          </div>
        </div>
      )}
    </div>
  );
}
