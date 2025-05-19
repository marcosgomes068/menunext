import "../../globals.css";

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 font-sans min-h-screen flex flex-col">
        {/* Não renderiza Navbar aqui! */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
