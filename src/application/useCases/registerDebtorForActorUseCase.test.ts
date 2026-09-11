import { describe, expect, it, vi } from 'vitest';
import { RegisterDebtorUseCase } from '@/application/useCases/registerDebtorUseCase';
import { RegisterDebtorForActorUseCase } from '@/application/useCases/registerDebtorForActorUseCase';
import { InMemoryDebtorRepository } from '@/test/inMemoryDebtorRepository';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { actor } from '@/test/actors';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

const payload = {
  identification: '123',
  firstName: 'Ana',
  lastName: 'Ruiz',
  contractId: 'contract-a',
  amount: 100,
  dueDate: new Date('2026-12-01'),
};

describe('RegisterDebtorForActorUseCase', () => {
  it('rechaza si no hay sesión', async () => {
    const useCase = new RegisterDebtorForActorUseCase(
      new RegisterDebtorUseCase(new InMemoryDebtorRepository()),
      new InMemoryAuditLog(),
    );
    const result = await useCase.execute(null, payload);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/sesión/i);
  });

  it('rechaza escribir en un contrato ajeno', async () => {
    const repo = new InMemoryDebtorRepository();
    const audit = new InMemoryAuditLog();
    const upsert = vi.spyOn(repo, 'upsertWithDebt');
    const useCase = new RegisterDebtorForActorUseCase(new RegisterDebtorUseCase(repo), audit);

    const result = await useCase.execute(
      actor({ role: 'OPERATOR', contractId: 'contract-a' }),
      { ...payload, contractId: 'contract-b' },
    );

    expect(result.success).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
    expect(audit.entries).toHaveLength(0);
  });

  it('registra deudor, deuda y audit cuando el contrato es del actor', async () => {
    const repo = new InMemoryDebtorRepository();
    const audit = new InMemoryAuditLog();
    const useCase = new RegisterDebtorForActorUseCase(new RegisterDebtorUseCase(repo), audit);

    const result = await useCase.execute(actor({ role: 'OPERATOR', contractId: 'contract-a' }), payload);

    expect(result.success).toBe(true);
    expect(repo.debtors).toHaveLength(1);
    expect(repo.debts).toHaveLength(1);
    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.DEBTOR_REGISTERED);
  });

  it('GLOBAL_ADMIN puede escribir en cualquier contrato', async () => {
    const repo = new InMemoryDebtorRepository();
    const useCase = new RegisterDebtorForActorUseCase(
      new RegisterDebtorUseCase(repo),
      new InMemoryAuditLog(),
    );

    const result = await useCase.execute(
      actor({ role: 'GLOBAL_ADMIN', contractId: null }),
      { ...payload, contractId: 'foreign' },
    );

    expect(result.success).toBe(true);
    expect(repo.debts[0]?.contractId).toBe('foreign');
  });
});
