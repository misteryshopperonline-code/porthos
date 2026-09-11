import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
      <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-dark-bg text-zinc-900 dark:text-gray-100 antialiased`}>
        <NextAuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
