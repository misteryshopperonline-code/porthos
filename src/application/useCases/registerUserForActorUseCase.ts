import type { SessionUser } from '@/core/entities/user';
import { canManageUsers } from '@/core/tenant/scope';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';
import type { UserRole } from '@/core/entities/user';

export class RegisterUserForActorUseCase {
  constructor(private readonly registerUser: RegisterPlatformUserUseCase) {}

  async execute(
    actor: SessionUser | null,
    newUserConfig: {
      email: string;
      rawPassword?: string;
      name: string;
      role: UserRole;
      contractId: string | null;
    },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }
    if (!canManageUsers(actor)) {
      return { success: false as const, error: 'Acceso denegado: Los operadores no pueden registrar usuarios.' };
    }
    return this.registerUser.execute(actor.role, actor.contractId, newUserConfig);
  }
}
