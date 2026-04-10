'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Registro y Deudores', href: '/deudores' },
  { name: 'Carga Masiva', href: '/carga-masiva' },
  { name: 'Mensajería', href: '/mensajeria' },
  { name: 'Contratos PDF', href: '/contratos' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-dark-border hidden md:block z-10">
      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-gradient tracking-tight drop-shadow-sm">Porthos</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Cobranza Inteligente</p>
      </div>
      <nav className="px-4 mt-6 space-y-2">
        {navigation.map((item) => {
          // Marca activo si es matching exacto o si empieza con el href (para subrutas, excepto para el / principal)
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={
                isActive 
                  ? "block px-4 py-3 rounded-lg bg-brand-500/10 text-brand-500 transition-all font-medium border border-brand-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "block px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all hover:pl-5"
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
