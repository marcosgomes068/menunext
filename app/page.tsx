import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center relative overflow-hidden">
        {/* Linha animada superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse" />
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center drop-shadow">
          Cardápio Digital
        </h1>
        {/* Linha animada entre título e descrição */}
        <div className="w-2/3 h-1 bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 rounded-full animate-pulse mb-6" />
        <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
          Transforme o seu restaurante, lanchonete ou bar com um cardápio digital
          moderno, fácil de usar e totalmente personalizável. Tenha controle de
          planos, login de clientes e painel administrativo para gerenciar tudo
          de forma simples e segura.
        </p>
        {/* Linha animada entre descrição e botões */}
        <div className="w-1/2 h-1 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-100 rounded-full animate-pulse mb-8" />
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition text-center"
          >
            Entrar / Cadastrar
          </Link>
          <Link
            href="/planos"
            className="bg-white border border-blue-600 text-blue-700 font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-50 transition text-center"
          >
            Ver Planos
          </Link>
        </div>
        {/* Linha animada inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse" />
        <div className="mt-10 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Cardápio Digital. Todos os direitos
          reservados.
        </div>
      </div>
    </div>
  );
}