import type { ContractRepositoryPort } from '@/application/ports/contractRepositoryPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope } from '@/core/tenant/scope';

export class ListVisibleContractsUseCase {
  constructor(private readonly contracts: ContractRepositoryPort) {}

  execute(actor: SessionUser) {
    return this.contracts.listVisible(actorScope(actor));
  }
}
