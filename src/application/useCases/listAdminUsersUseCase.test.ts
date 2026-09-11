import { describe, expect, it } from 'vitest';
import { ListAdminUsersUseCase } from '@/application/useCases/listAdminUsersUseCase';
import { actor } from '@/test/actors';

describe('ListAdminUsersUseCase', () => {
  it('niega el listado a OPERATOR', async () => {
    const useCase = new ListAdminUsersUseCase(
      { findByEmail: async () => null, save: async (u) => ({ ...u, id: '1' }), listVisibleTo: async () => [] },
      { listVisible: async () => [] },
    );
    const result = await useCase.execute(actor({ role: 'OPERATOR' }));
    expect(result.success).toBe(false);
  });

  it('pide usuarios visibles al repositorio', async () => {
    const seen: string[] = [];
    const useCase = new ListAdminUsersUseCase(
      {
        findByEmail: async () => null,
        save: async (u) => ({ ...u, id: '1' }),
        listVisibleTo: async (current) => {
          seen.push(current.role);
          return [];
        },
      },
      { listVisible: async () => [{ id: 'c1', contractCode: 'C1' }] },
    );

    const result = await useCase.execute(actor({ role: 'CONTRACT_ADMIN', contractId: 'c1' }));
    expect(result.success).toBe(true);
    expect(seen).toEqual(['CONTRACT_ADMIN']);
  });
});
