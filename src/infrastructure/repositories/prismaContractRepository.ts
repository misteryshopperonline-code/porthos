import type { PrismaClient } from '@prisma/client';
import type { ContractRepositoryPort, ContractSummary } from '@/application/ports/contractRepositoryPort';
import type { TenantScope } from '@/core/tenant/scope';

export class PrismaContractRepository implements ContractRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async listVisible(scope: TenantScope): Promise<ContractSummary[]> {
    if (scope.type === 'none') {
      return [];
    }

    const where = scope.type === 'contract' ? { id: scope.contractId } : {};

    return this.prisma.contract.findMany({
      where,
      select: { id: true, contractCode: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
