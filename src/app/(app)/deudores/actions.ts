'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/application/types/actionState';
import { registerDebtorForActorUseCase, bulkUploadForActorUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

function defaultDueDate(): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

export async function createDebtorAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identification = String(formData.get('identification') ?? '').trim();
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const contractId = String(formData.get('contractId') ?? '').trim();
  const amount = Number(formData.get('amount'));

  if (!identification || !firstName || !lastName || !contractId || !Number.isFinite(amount) || amount <= 0) {
    return { error: 'La identificación, nombre, contrato y monto son requeridos.' };
  }

  const actor = await getAppSession();
  const result = await registerDebtorForActorUseCase.execute(actor, {
    identification,
    firstName,
    lastName,
    email: email || undefined,
    phone: phone || undefined,
    contractId,
    amount,
    dueDate: defaultDueDate(),
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/deudores');
  revalidatePath('/');
  return { success: true, message: 'Deudor registrado exitosamente.' };
}

export async function bulkUploadDebtorsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const contractId = String(formData.get('contractId') ?? '').trim();
  const file = formData.get('file');

  if (!contractId || !(file instanceof File)) {
    return { error: 'El contrato y el archivo CSV son requeridos.' };
  }

  const actor = await getAppSession();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await bulkUploadForActorUseCase.execute(actor, {
    fileBuffer: buffer,
    fileName: file.name,
    contractId,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/deudores');
  revalidatePath('/');

  const errorHint = result.failed > 0 ? ` Fallaron ${result.failed} filas.` : '';

  return {
    success: true,
    message: `Carga masiva: ${result.uploaded} registros procesados.${errorHint}`,
  };
}
