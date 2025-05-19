"use client";

export default function Planos() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Escolha seu Plano
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-xl p-6 flex flex-col items-center bg-blue-50">
            <h2 className="text-xl font-bold mb-2">Plano Free</h2>
            <p className="mb-4 text-gray-600">
              Ideal para experimentar o Cardápio Digital.
            </p>
            <ul className="mb-4 text-gray-500 text-sm list-disc list-inside">
              <li>Cadastro de até 10 produtos</li>
              <li>1 usuário</li>
              <li>Suporte básico</li>
            </ul>
            <button
              className="bg-blue-200 text-blue-700 font-semibold px-6 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Grátis
            </button>
          </div>
          <div className="border rounded-xl p-6 flex flex-col items-center bg-blue-100">
            <h2 className="text-xl font-bold mb-2">Plano Pro</h2>
            <p className="mb-4 text-gray-600">
              Para negócios que querem mais recursos.
            </p>
            <ul className="mb-4 text-gray-500 text-sm list-disc list-inside">
              <li>Produtos ilimitados</li>
              <li>Vários usuários</li>
              <li>Suporte prioritário</li>
              <li>Relatórios avançados</li>
            </ul>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              onClick={() =>
                window.open("https://wa.me/+5568992088865", "_blank")
              }
            >
              Assinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
