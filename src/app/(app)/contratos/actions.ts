'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/application/types/actionState';
import { analyzeContractPdfForActorUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

export async function analyzeContractPdfAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const contractId = String(formData.get('contractId') ?? '').trim();
  const file = formData.get('pdf');

  if (!contractId) {
    return { error: 'Selecciona un contrato.' };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Adjunta un archivo PDF.' };
  }

  if (file.type && file.type !== 'application/pdf') {
    return { error: 'Solo se aceptan archivos PDF.' };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const actor = await getAppSession();
  const result = await analyzeContractPdfForActorUseCase.execute(actor, {
    contractId,
    filename: file.name || 'contrato.pdf',
    bytes,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/contratos');
  return {
    success: true,
    message: `PDF analizado para ${result.contract.contractCode}.`,
  };
}
