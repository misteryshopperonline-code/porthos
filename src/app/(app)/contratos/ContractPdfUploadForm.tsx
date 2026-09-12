'use client';

import { useActionState } from 'react';
import { analyzeContractPdfAction } from '@/app/(app)/contratos/actions';
import type { ActionState } from '@/application/types/actionState';

const initialState: ActionState = {};

export default function ContractPdfUploadForm({
  contracts,
}: {
  contracts: Array<{ id: string; contractCode: string }>;
}) {
  const [state, formAction, pending] = useActionState(analyzeContractPdfAction, initialState);

  if (contracts.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-gray-400">
        No hay contratos visibles en tu alcance.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-600 dark:text-gray-400">Contrato</span>
          <select
            name="contractId"
            required
            defaultValue={contracts[0]?.id}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-gray-100"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractCode}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-600 dark:text-gray-400">PDF del contrato</span>
          <input
            type="file"
            name="pdf"
            accept="application/pdf,.pdf"
            required
            className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white dark:text-gray-300"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? 'Analizando…' : 'Subir y analizar con IA'}
      </button>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && state.message && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>
      )}
    </form>
  );
}
