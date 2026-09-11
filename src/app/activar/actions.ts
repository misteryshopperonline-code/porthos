'use server';

import type { ActionState } from '@/application/types/actionState';
import { setPasswordWithInviteUseCase } from '@/composition/container';

export async function activateAccountAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get('token') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  const result = await setPasswordWithInviteUseCase.execute({ token, password });
  if (!result.success) {
    return { error: result.error };
  }

  return {
    success: true,
    message: 'Cuenta activada. Ya puedes iniciar sesión.',
  };
}
