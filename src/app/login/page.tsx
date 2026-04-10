'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
      router.refresh(); // Refrescar contexto del servidor
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full absolute inset-0 bg-zinc-50 dark:bg-dark-bg">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-xl z-20 animate-fade-in mx-4 border border-zinc-200 dark:border-white/10">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gradient drop-shadow-sm mb-2">Porthos</h1>
          <p className="text-sm font-semibold tracking-wider uppercase text-zinc-500 dark:text-gray-400">Acceso a Plataforma</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-3 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              placeholder="admin@porthos.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-3 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              placeholder="••••••••"
            />
            <div className="mt-2 text-right">
              <a href="#" className="text-xs text-brand-600 dark:text-brand-500 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}
