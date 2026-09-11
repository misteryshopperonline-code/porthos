import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { DebtRepositoryPort } from '@/application/ports/debtRepositoryPort';
import type { DebtStatus } from '@/core/entities/debt';
import { assertDebtStatusTransition } from '@/core/entities/debt';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';

export class UpdateDebtStatusForActorUseCase {
  constructor(
    private readonly debts: DebtRepositoryPort,
    private readonly audit: AuditLogPort,
  ) {}

  async execute(
    actor: SessionUser | null,
    input: { debtId: string; status: DebtStatus },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    const debt = await this.debts.findById(input.debtId);
    if (!debt) {
      return { success: false as const, error: 'La deuda no existe.' };
    }

    const access = assertContractWrite(actorScope(actor), debt.contractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    const transition = assertDebtStatusTransition(debt.status, input.status);
    if (!transition.ok) {
      return { success: false as const, error: transition.error };
    }

    const updated = await this.debts.updateStatus(debt.id, input.status);

    await this.audit.record({
      userId: actor.id,
      action: AUDIT_ACTIONS.DEBT_STATUS_CHANGED,
      details: {
        debtId: debt.id,
        from: debt.status,
        to: input.status,
        contractId: debt.contractId,
      },
    });

    return { success: true as const, debt: updated };
  }
}
