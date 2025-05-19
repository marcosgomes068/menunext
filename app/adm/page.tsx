"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  plan: string;
}

export default function AdmPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [admPass, setAdmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [editPlans, setEditPlans] = useState<{[id:number]: string}>({});

  useEffect(() => {
    if (isAuth) {
      setLoading(true);
      fetch("/api/adm")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data.users || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Erro ao carregar usuários");
          setLoading(false);
        });
    }
  }, [isAuth]);

  async function handlePlanChange(id: number, plan: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/adm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map(u => u.id === id ? { ...u, plan } : u));
      } else {
        setError(data.message || "Erro ao atualizar plano");
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setSaving(false);
    }
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (admPass === "gomesgabriel14") {
      setIsAuth(true);
      setError("");
    } else {
      setError("Senha de ADM incorreta");
    }
  }

  function handleEditChange(id: number, plan: string) {
    setEditPlans(prev => ({ ...prev, [id]: plan }));
  }

  async function handleSave(id: number) {
    setSaving(true);
    setError("");
    try {
      const plan = editPlans[id];
      const res = await fetch("/api/adm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map(u => u.id === id ? { ...u, plan } : u));
      } else {
        setError(data.message || "Erro ao atualizar plano");
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/adm", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter(u => u.id !== id));
      } else {
        setError(data.message || "Erro ao excluir usuário");
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center">
          <h1 className="text-2xl font-extrabold text-blue-700 mb-6 text-center">Acesso ADM</h1>
          <form className="flex flex-col gap-4 w-full" onSubmit={handleAuth}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Senha de ADM"
              className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg outline-none transition"
              value={admPass}
              onChange={e => setAdmPass(e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} /> Mostrar senha
            </label>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
            >
              Entrar
            </button>
          </form>
          {error && <div className="mt-4 text-center text-red-600">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">Painel ADM - Usuários</h1>
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <table className="w-full border mt-4 bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-4">Usuário</th>
                <th className="py-2 px-4">Plano</th>
                <th className="py-2 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="py-2 px-4 text-center">{user.username}</td>
                  <td className="py-2 px-4 text-center font-semibold text-blue-700">{user.plan.toUpperCase()}</td>
                  <td className="py-2 px-4 text-center">
                    <select
                      value={editPlans[user.id] ?? user.plan}
                      onChange={e => handleEditChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                      title="Plano do usuário"
                      disabled={saving}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                    <button
                      className="ml-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                      onClick={() => handleSave(user.id)}
                      disabled={saving || (editPlans[user.id] ?? user.plan) === user.plan}
                    >
                      Salvar
                    </button>
                    <button
                      className="ml-2 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                      onClick={() => handleDelete(user.id)}
                      disabled={saving}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      </div>
    </div>
  );
}
