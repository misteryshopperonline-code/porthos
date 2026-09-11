import type { CommunicationRepositoryPort } from '@/application/ports/communicationRepositoryPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope } from '@/core/tenant/scope';

export class ListCommunicationsForActorUseCase {
  constructor(private readonly communications: CommunicationRepositoryPort) {}

  async execute(actor: SessionUser, limit = 50) {
    const scope = actorScope(actor);
    if (scope.type === 'none') {
      return {
        success: false as const,
        error: 'Tu usuario no tiene un contrato asignado.',
      };
    }

    const items = await this.communications.listRecent(scope, limit);
    return { success: true as const, items, scope };
  }
}
