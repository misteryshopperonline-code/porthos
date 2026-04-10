'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user as any)?.role;

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Gestión de Portafolio', href: '/deudores' },
    { name: 'Mensajería', href: '/mensajeria' },
    { name: 'Contratos PDF', href: '/contratos' },
  ];

  if (userRole === 'GLOBAL_ADMIN' || userRole === 'CONTRACT_ADMIN') {
    navigation.push({ name: 'Administración de Usuarios', href: '/admin/usuarios' });
  }

  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 glass-panel border-r border-zinc-200 dark:border-dark-border hidden md:flex flex-col z-10 min-h-screen">
      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-gradient tracking-tight drop-shadow-sm">Porthos</h1>
        <p className="text-xs text-zinc-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Cobranza Inteligente</p>
      </div>
      <nav className="px-4 mt-6 space-y-2 flex-1">
        {navigation.map((item) => {
          // Marca activo si es matching exacto o si empieza con el href (para subrutas, excepto para el / principal)
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={
                isActive 
                  ? "block px-4 py-3 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-500 transition-all font-medium border border-brand-500/20 shadow-sm"
                  : "block px-4 py-3 rounded-lg text-zinc-500 dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-gray-100 transition-all hover:pl-5"
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-dark-border flex flex-col gap-4">
        {session && (
          <div className="flex flex-col gap-2 mb-2">
            <p className="text-sm font-semibold text-zinc-700 dark:text-gray-300 truncate px-2">{(session.user as any)?.name}</p>
            <p className="text-xs text-brand-600 dark:text-brand-500 font-bold uppercase tracking-wider px-2">{userRole}</p>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="mt-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </aside>
  );
}
