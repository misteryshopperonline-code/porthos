import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';
import { RegisterDebtorUseCase } from '@/application/useCases/registerDebtorUseCase';

export class RegisterDebtorForActorUseCase {
  constructor(
    private readonly registerDebtor: RegisterDebtorUseCase,
    private readonly audit: AuditLogPort,
  ) {}

  async execute(
    actor: SessionUser | null,
    data: {
      identification: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      contractId: string;
      amount: number;
      dueDate: Date;
    },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    const access = assertContractWrite(actorScope(actor), data.contractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    const result = await this.registerDebtor.execute(data);
    if (!result.success) {
      return result;
    }

    await this.audit.record({
      userId: actor.id,
      action: AUDIT_ACTIONS.DEBTOR_REGISTERED,
      details: {
        debtorId: result.debtor?.id,
        identification: data.identification,
        contractId: data.contractId,
        amount: data.amount,
      },
    });

    return result;
  }
}
