import type { ContractRepositoryPort } from '@/application/ports/contractRepositoryPort';
import type { DashboardRepositoryPort } from '@/application/ports/dashboardRepositoryPort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, resolveRequestedContract } from '@/core/tenant/scope';

export class GetDashboardUseCase {
  constructor(
    private readonly contracts: ContractRepositoryPort,
    private readonly dashboard: DashboardRepositoryPort,
  ) {}

  async execute(actor: SessionUser, requestedContractId?: string | null) {
    const scope = actorScope(actor);
    const access = resolveRequestedContract(scope, requestedContractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    const [contracts, snapshot] = await Promise.all([
      this.contracts.listVisible(scope),
      this.dashboard.getSnapshot(access.filter),
    ]);

    return {
      success: true as const,
      contracts,
      snapshot,
      selectedContractId: access.filter.contractId ?? null,
      canViewAll: scope.type === 'all',
    };
  }
}
