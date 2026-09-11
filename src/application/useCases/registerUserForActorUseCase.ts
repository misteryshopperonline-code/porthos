import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { SessionUser, UserRole } from '@/core/entities/user';
import { canManageUsers } from '@/core/tenant/scope';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';

export class RegisterUserForActorUseCase {
  constructor(
    private readonly registerUser: RegisterPlatformUserUseCase,
    private readonly audit: AuditLogPort,
  ) {}

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

    const result = await this.registerUser.execute(actor.role, actor.contractId, newUserConfig);
    if (!result.success) {
      return result;
    }

    await this.audit.record({
      userId: actor.id,
      action: AUDIT_ACTIONS.USER_CREATED,
      details: {
        createdUserId: result.user?.id,
        email: newUserConfig.email,
        role: newUserConfig.role,
        contractId: result.user?.contractId ?? null,
        inviteIssued: Boolean(result.inviteToken),
      },
    });

    return result;
  }
}
