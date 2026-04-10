import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Porthos | Cobranza Inteligente',
  description: 'Plataforma para automatizar el seguimiento de la cobranza vencida.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-dark-bg text-gray-100 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar minimalista - puede separarse en un componente despues */}
          <aside className="w-64 glass-panel border-r border-dark-border hidden md:block z-10">
            <div className="p-6">
              <h1 className="text-3xl font-extrabold text-gradient tracking-tight drop-shadow-sm">Porthos</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Cobranza Inteligente</p>
            </div>
            <nav className="px-4 mt-6 space-y-2">
              <Link href="/" className="block px-4 py-3 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-all font-medium border border-brand-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                Dashboard
              </Link>
              <Link href="/deudores" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all hover:pl-5">
                Registro y Deudores
              </Link>
              <Link href="/carga-masiva" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all hover:pl-5">
                Carga Masiva
              </Link>
              <Link href="/mensajeria" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all hover:pl-5">
                Mensajería
              </Link>
              <Link href="/contratos" className="block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all hover:pl-5">
                Contratos PDF
              </Link>
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-6 pb-8 bg-dark-bg relative">
             <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>
             {children}
          </main>
        </div>
      </body>
    </html>
  );
}
