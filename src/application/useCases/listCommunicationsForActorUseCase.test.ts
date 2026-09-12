import { describe, expect, it } from 'vitest';
import { ListCommunicationsForActorUseCase } from '@/application/useCases/listCommunicationsForActorUseCase';
import type {
  CommunicationListItem,
  CommunicationRepositoryPort,
} from '@/application/ports/communicationRepositoryPort';
import { actor } from '@/test/actors';
import type { TenantScope } from '@/core/tenant/scope';

class FakeComms implements CommunicationRepositoryPort {
  lastScope: TenantScope | null = null;

  async listRecent(scope: TenantScope): Promise<CommunicationListItem[]> {
    this.lastScope = scope;
    if (scope.type === 'none') return [];
    return [
      {
        id: 'c1',
        type: 'EMAIL',
        status: 'SENT',
        content: 'hola',
        sentAt: new Date(),
        debtorName: 'Ana Ruiz',
        contractId: scope.type === 'contract' ? scope.contractId : 'any',
        debtId: 'd1',
        amount: 10,
      },
    ];
  }

  async create() {
    return { id: 'unused' };
  }
}

describe('ListCommunicationsForActorUseCase', () => {
  it('filtra por contrato del actor', async () => {
    const repo = new FakeComms();
    const useCase = new ListCommunicationsForActorUseCase(repo);
    const result = await useCase.execute(actor({ role: 'OPERATOR', contractId: 'contract-a' }));

    expect(result.success).toBe(true);
    expect(repo.lastScope).toEqual({ type: 'contract', contractId: 'contract-a' });
    if (result.success) {
      expect(result.items).toHaveLength(1);
    }
  });

  it('GLOBAL_ADMIN ve alcance global', async () => {
    const repo = new FakeComms();
    const useCase = new ListCommunicationsForActorUseCase(repo);
    await useCase.execute(actor({ role: 'GLOBAL_ADMIN', contractId: null }));
    expect(repo.lastScope).toEqual({ type: 'all' });
  });

  it('falla si el actor no tiene contrato', async () => {
    const useCase = new ListCommunicationsForActorUseCase(new FakeComms());
    const result = await useCase.execute(actor({ role: 'OPERATOR', contractId: null }));
    expect(result.success).toBe(false);
  });
});
