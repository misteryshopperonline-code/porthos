import type { PrismaClient } from '@prisma/client';
import type {
  CommunicationListItem,
  CommunicationRepositoryPort,
  CreateCommunicationInput,
} from '@/application/ports/communicationRepositoryPort';
import type { CommunicationStatus, CommunicationType } from '@/core/entities/communication';
import type { TenantScope } from '@/core/tenant/scope';
import { toMoneyNumber } from '@/core/money';

export class PrismaCommunicationRepository implements CommunicationRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCommunicationInput): Promise<{ id: string }> {
    const row = await this.prisma.communication.create({
      data: {
        debtId: input.debtId,
        type: input.type,
        status: input.status,
        content: input.content,
      },
    });
    return { id: row.id };
  }

  async listRecent(scope: TenantScope, limit = 50): Promise<CommunicationListItem[]> {
    if (scope.type === 'none') {
      return [];
    }

    const debtFilter =
      scope.type === 'contract' ? { contractId: scope.contractId } : undefined;

    const rows = await this.prisma.communication.findMany({
      where: debtFilter ? { debt: debtFilter } : {},
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: {
        debt: {
          include: { debtor: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type as CommunicationType,
      status: row.status as CommunicationStatus,
      content: row.content,
      sentAt: row.sentAt,
      debtorName: `${row.debt.debtor.firstName} ${row.debt.debtor.lastName}`,
      contractId: row.debt.contractId,
      debtId: row.debtId,
      amount: toMoneyNumber(row.debt.amount),
    }));
  }
}
