'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/application/types/actionState';
import { sendDebtReminderForActorUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

export async function sendDebtReminderAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const debtId = String(formData.get('debtId') ?? '').trim();
  if (!debtId) {
    return { error: 'Deuda inválida.' };
  }

  const actor = await getAppSession();
  const result = await sendDebtReminderForActorUseCase.execute(actor, { debtId });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/');
  revalidatePath('/mensajeria');
  return {
    success: true,
    message: `Recordatorio enviado a ${result.to}.`,
  };
}
