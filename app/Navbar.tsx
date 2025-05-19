"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/menu/publico")) {
    return null;
  }

  const [user, setUser] = useState<null | {username:string, plan:string}>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-lg">Cardápio Digital</Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span>Olá, {user.username} ({user.plan.toUpperCase()})</span>
            <button
              onClick={logout}
              className="bg-blue-800 px-3 py-1 rounded hover:bg-blue-700"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
