'use client';

import { useActionState } from 'react';
import { updateDebtStatusAction } from '@/app/(app)/actions/debtStatus';
import type { ActionState } from '@/application/types/actionState';
import { DEBT_STATUS, type DebtStatus } from '@/core/entities/debt';

const initialState: ActionState = {};

export default function DebtStatusActions({
  debtId,
  status,
}: {
  debtId: string;
  status: DebtStatus;
}) {
  const [state, formAction, pending] = useActionState(updateDebtStatusAction, initialState);

  if (status === DEBT_STATUS.PAID) {
    return <span className="text-xs text-zinc-400">Cerrada</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <form action={formAction}>
          <input type="hidden" name="debtId" value={debtId} />
          <input type="hidden" name="status" value={DEBT_STATUS.PAID} />
          <button
            type="submit"
            disabled={pending}
            className="text-xs px-2.5 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50"
          >
            Marcar PAID
          </button>
        </form>
        {status === DEBT_STATUS.PENDING && (
          <form action={formAction}>
            <input type="hidden" name="debtId" value={debtId} />
            <input type="hidden" name="status" value={DEBT_STATUS.DEFAULTED} />
            <button
              type="submit"
              disabled={pending}
              className="text-xs px-2.5 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              DEFAULTED
            </button>
          </form>
        )}
      </div>
      {state.error && <span className="text-xs text-red-500">{state.error}</span>}
    </div>
  );
}
