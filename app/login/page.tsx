"use client";
import { useState } from "react";

export default function LoginCadastro() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Para animação
  const [animating, setAnimating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("user", JSON.stringify({ username: data.username, plan: data.plan }));
          window.location.href = "/menu";
        } else {
          setError(data.message || "Erro ao fazer login");
        }
      } else {
        // Cadastro real no banco SQLite
        try {
          const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, restaurantName }),
          });
          const data = await res.json();
          if (data.success) {
            setError("");
            alert("Cadastro realizado! Faça login.");
            setIsLogin(true);
          } else {
            setError(data.message || "Erro ao cadastrar");
          }
        } catch (err) {
          setError("Erro de conexão com o servidor");
        }
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  function handleSwitch() {
    setAnimating(true);
    setTimeout(() => {
      setIsLogin((v) => !v);
      setError("");
      setUsername("");
      setPassword("");
      setRestaurantName("");
      setAnimating(false);
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center relative overflow-hidden">
        {/* Linha animada superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          {isLogin ? "Entrar no Cardápio Digital" : "Criar Conta"}
        </h1>
        {/* Jogo da velha animado para separar itens */}
        <div className="w-2/3 h-12 flex flex-col justify-between mb-6">
          <div className="flex justify-between w-full h-1">
            <div className="w-1/3 h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 animate-pulse rounded-full" />
            <div className="w-1/3 h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 animate-pulse rounded-full" />
          </div>
          <div className="flex justify-between w-full h-1">
            <div className="w-1/3 h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 animate-pulse rounded-full" />
            <div className="w-1/3 h-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 animate-pulse rounded-full" />
          </div>
        </div>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuário"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg outline-none transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Nome do restaurante"
              className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg outline-none transition"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (isLogin ? "Entrando..." : "Cadastrando...") : isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
        <div className="mt-6 text-center text-sm text-gray-500 flex flex-col gap-2">
          {isLogin ? (
            <>
              Não tem uma conta?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={handleSwitch}
                disabled={animating}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={handleSwitch}
                disabled={animating}
              >
                Entrar
              </button>
            </>
          )}
          <button
            type="button"
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-blue-700 font-semibold py-2 px-4 rounded-lg transition"
            onClick={() => (window.location.href = "/adm")}
          >
            Iniciar ADM
          </button>
        </div>
        {/* Linha animada inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse" />
      </div>
    </div>
  );
}
