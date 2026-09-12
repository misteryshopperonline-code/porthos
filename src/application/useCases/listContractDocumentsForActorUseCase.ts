import type { ContractDocumentRepositoryPort } from '@/application/ports/contractDocumentRepositoryPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope } from '@/core/tenant/scope';

export class ListContractDocumentsForActorUseCase {
  constructor(private readonly contracts: ContractDocumentRepositoryPort) {}

  async execute(actor: SessionUser | null) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa.' };
    }

    const scope = actorScope(actor);
    if (scope.type === 'none') {
      return { success: false as const, error: 'Tu usuario no tiene un contrato asignado.' };
    }

    const items = await this.contracts.listDocuments(scope);
    return { success: true as const, items };
  }
}
