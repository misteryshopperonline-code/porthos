'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { activateAccountAction } from './actions';
import type { ActionState } from '@/application/types/actionState';

const initialState: ActionState = {};

export default function ActivarForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, formAction, pending] = useActionState(activateAccountAction, initialState);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-zinc-200 dark:border-white/10">
        <h1 className="text-3xl font-extrabold text-gradient mb-2">Activar cuenta</h1>
        <p className="text-sm text-zinc-500 dark:text-gray-400 mb-6">
          Define tu contraseña con el enlace de invitación.
        </p>

        {state.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
            {state.message}{' '}
            <Link href="/login" className="underline font-medium">
              Ir al login
            </Link>
          </div>
        )}

        {!state.success && (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 p-3 outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmar contraseña</label>
              <input
                name="confirm"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 p-3 outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={pending || !token}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
            >
              {pending ? 'Guardando...' : 'Activar cuenta'}
            </button>
            {!token && (
              <p className="text-xs text-red-500">Falta el token en la URL (?token=...).</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
