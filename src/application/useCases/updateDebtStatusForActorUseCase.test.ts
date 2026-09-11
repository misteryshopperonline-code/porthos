import { describe, expect, it } from 'vitest';
import { UpdateDebtStatusForActorUseCase } from '@/application/useCases/updateDebtStatusForActorUseCase';
import { DEBT_STATUS } from '@/core/entities/debt';
import { actor } from '@/test/actors';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { InMemoryDebtRepository } from '@/test/inMemoryDebtRepository';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

describe('UpdateDebtStatusForActorUseCase', () => {
  it('bloquea cambio en deuda de otro contrato', async () => {
    const debts = new InMemoryDebtRepository();
    debts.seed({
      id: 'd1',
      contractId: 'contract-b',
      amount: 50,
      status: DEBT_STATUS.PENDING,
    });
    const useCase = new UpdateDebtStatusForActorUseCase(debts, new InMemoryAuditLog());

    const result = await useCase.execute(actor({ contractId: 'contract-a' }), {
      debtId: 'd1',
      status: DEBT_STATUS.PAID,
    });

    expect(result.success).toBe(false);
  });

  it('aplica transición válida y audita', async () => {
    const debts = new InMemoryDebtRepository();
    const audit = new InMemoryAuditLog();
    debts.seed({
      id: 'd1',
      contractId: 'contract-a',
      amount: 50,
      status: DEBT_STATUS.PENDING,
    });
    const useCase = new UpdateDebtStatusForActorUseCase(debts, audit);

    const result = await useCase.execute(actor({ contractId: 'contract-a' }), {
      debtId: 'd1',
      status: DEBT_STATUS.PAID,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.debt.status).toBe(DEBT_STATUS.PAID);
    }
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.DEBT_STATUS_CHANGED);
  });

  it('rechaza transición inválida', async () => {
    const debts = new InMemoryDebtRepository();
    debts.seed({
      id: 'd1',
      contractId: 'contract-a',
      amount: 50,
      status: DEBT_STATUS.PAID,
    });
    const useCase = new UpdateDebtStatusForActorUseCase(debts, new InMemoryAuditLog());

    const result = await useCase.execute(actor({ contractId: 'contract-a' }), {
      debtId: 'd1',
      status: DEBT_STATUS.PENDING,
    });

    expect(result.success).toBe(false);
  });
});
