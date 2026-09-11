import type { ContractRepositoryPort } from '@/application/ports/contractRepositoryPort';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, canManageUsers } from '@/core/tenant/scope';

export class ListAdminUsersUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly contracts: ContractRepositoryPort,
  ) {}

  async execute(actor: SessionUser) {
    if (!canManageUsers(actor)) {
      return { success: false as const, error: 'Acceso denegado.' };
    }

    const [users, contracts] = await Promise.all([
      this.users.listVisibleTo(actor),
      this.contracts.listVisible(actorScope(actor)),
    ]);

    return { success: true as const, users, contracts };
  }
}
