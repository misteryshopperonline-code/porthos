import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
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
          <Sidebar />
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
