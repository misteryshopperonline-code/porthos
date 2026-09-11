import { describe, expect, it } from 'vitest';
import { GetDashboardUseCase } from '@/application/useCases/getDashboardUseCase';
import type { DashboardSnapshot } from '@/application/ports/dashboardRepositoryPort';
import { actor } from '@/test/actors';

const emptySnapshot: DashboardSnapshot = {
  communicationsSent: 0,
  outstandingAmount: 0,
  recoveredAmount: 0,
  linkedDebtCount: 0,
  contractCount: 0,
  recentDebts: [],
};

describe('GetDashboardUseCase', () => {
  it('no filtra snapshot de un contrato ajeno', async () => {
    const useCase = new GetDashboardUseCase(
      { listVisible: async () => [{ id: 'contract-a', contractCode: 'A' }] },
      { getSnapshot: async () => emptySnapshot },
    );

    const result = await useCase.execute(
      actor({ role: 'OPERATOR', contractId: 'contract-a' }),
      'contract-b',
    );

    expect(result.success).toBe(false);
  });

  it('pasa el filtro de contrato del actor al repositorio', async () => {
    const filters: Array<{ contractId?: string }> = [];
    const useCase = new GetDashboardUseCase(
      {
        listVisible: async () => [{ id: 'contract-a', contractCode: 'A' }],
      },
      {
        getSnapshot: async (filter) => {
          filters.push(filter);
          return {
            ...emptySnapshot,
            outstandingAmount: 80,
            recoveredAmount: 20,
          };
        },
      },
    );

    const result = await useCase.execute(actor({ role: 'CONTRACT_ADMIN', contractId: 'contract-a' }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.snapshot.outstandingAmount).toBe(80);
      expect(result.snapshot.recoveredAmount).toBe(20);
      expect(result.canViewAll).toBe(false);
    }
    expect(filters).toEqual([{ contractId: 'contract-a' }]);
  });

  it('GLOBAL_ADMIN sin filtro pide cartera completa', async () => {
    const filters: Array<{ contractId?: string }> = [];
    const useCase = new GetDashboardUseCase(
      { listVisible: async () => [] },
      {
        getSnapshot: async (filter) => {
          filters.push(filter);
          return emptySnapshot;
        },
      },
    );

    await useCase.execute(actor({ role: 'GLOBAL_ADMIN', contractId: null }));
    expect(filters).toEqual([{}]);
  });
});
