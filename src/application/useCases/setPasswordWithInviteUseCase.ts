import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { InviteTokenPort } from '@/application/ports/inviteTokenPort';
import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';

const MIN_PASSWORD_LENGTH = 8;

export class SetPasswordWithInviteUseCase {
  constructor(
    private readonly invites: InviteTokenPort,
    private readonly users: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly audit: AuditLogPort,
  ) {}

  async execute(input: { token: string; password: string }) {
    if (!input.token.trim()) {
      return { success: false as const, error: 'El enlace de activación no es válido.' };
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false as const,
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      };
    }

    const email = await this.invites.consume(input.token);
    if (!email) {
      return { success: false as const, error: 'El enlace expiró o ya fue utilizado.' };
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      return { success: false as const, error: 'El usuario asociado al enlace no existe.' };
    }

    const passwordHash = await this.hasher.hash(input.password);
    const updated = await this.users.updatePassword(email, passwordHash);
    if (!updated) {
      return { success: false as const, error: 'No se pudo actualizar la contraseña.' };
    }

    await this.audit.record({
      userId: user.id,
      action: AUDIT_ACTIONS.PASSWORD_SET_VIA_INVITE,
      details: { email },
    });

    return { success: true as const, email };
  }
}
