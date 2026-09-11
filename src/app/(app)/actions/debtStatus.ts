'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/application/types/actionState';
import { DEBT_STATUS, type DebtStatus } from '@/core/entities/debt';
import { updateDebtStatusForActorUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

const ALLOWED: DebtStatus[] = [
  DEBT_STATUS.PENDING,
  DEBT_STATUS.PAID,
  DEBT_STATUS.DEFAULTED,
];

function isDebtStatus(value: string): value is DebtStatus {
  return ALLOWED.includes(value as DebtStatus);
}

export async function updateDebtStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const debtId = String(formData.get('debtId') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!debtId || !isDebtStatus(status)) {
    return { error: 'Deuda o estado inválidos.' };
  }

  const actor = await getAppSession();
  const result = await updateDebtStatusForActorUseCase.execute(actor, { debtId, status });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/');
  return { success: true, message: `Estado actualizado a ${status}.` };
}
