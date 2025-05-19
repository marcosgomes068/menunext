import "./globals.css";
import Navbar from "./Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <footer className="bg-gray-100 text-center p-4 text-sm text-gray-600">
          &copy; 2025 Cardápio Digital
        </footer>
      </body>
    </html>
  );
}