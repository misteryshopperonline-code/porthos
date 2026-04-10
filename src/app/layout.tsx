import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import NextAuthSessionProvider from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-50 dark:bg-dark-bg text-zinc-900 dark:text-gray-100 antialiased`}>
        <NextAuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              {/* Main content */}
              <main className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-6 pb-8 bg-zinc-50 dark:bg-dark-bg relative">
                 {children}
              </main>
            </div>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
