'use server';

import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/application/types/actionState';
import type { UserRole } from '@/core/entities/user';
import { registerUserForActorUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

const ROLES: UserRole[] = ['GLOBAL_ADMIN', 'CONTRACT_ADMIN', 'OPERATOR'];

function isUserRole(value: string): value is UserRole {
  return ROLES.includes(value as UserRole);
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getAppSession();

  const email = String(formData.get('email') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const targetRole = String(formData.get('role') ?? '');
  const contractId = String(formData.get('contractId') ?? '').trim();

  if (!email || !name || !isUserRole(targetRole)) {
    return { error: 'Información de registro incompleta.' };
  }

  const result = await registerUserForActorUseCase.execute(actor, {
    email,
    name,
    role: targetRole,
    contractId: contractId || null,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/admin/usuarios');

  const passwordNote = result.temporaryPassword
    ? ` Contraseña temporal: ${result.temporaryPassword}`
    : '';

  return {
    success: true,
    message: `${targetRole} creado exitosamente.${passwordNote}`,
  };
}
