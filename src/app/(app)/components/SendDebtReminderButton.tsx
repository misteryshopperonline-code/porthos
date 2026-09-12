'use client';

import { useActionState } from 'react';
import { sendDebtReminderAction } from '@/app/(app)/actions/sendDebtReminder';
import type { ActionState } from '@/application/types/actionState';

const initialState: ActionState = {};

export default function SendDebtReminderButton({ debtId }: { debtId: string }) {
  const [state, formAction, pending] = useActionState(sendDebtReminderAction, initialState);

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction}>
        <input type="hidden" name="debtId" value={debtId} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-2.5 py-1 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-dark-border dark:text-gray-300 dark:hover:bg-white/[0.04] disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Email recordatorio'}
        </button>
      </form>
      {state.error && <span className="text-xs text-red-500">{state.error}</span>}
      {state.success && state.message && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400">{state.message}</span>
      )}
    </div>
  );
}
