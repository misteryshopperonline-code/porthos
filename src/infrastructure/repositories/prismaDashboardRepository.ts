import type { PrismaClient } from '@prisma/client';
import type {
  DashboardRepositoryPort,
  DashboardSnapshot,
} from '@/application/ports/dashboardRepositoryPort';
import { DEBT_STATUS, OUTSTANDING_DEBT_STATUSES } from '@/core/entities/debt';

export class PrismaDashboardRepository implements DashboardRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getSnapshot(filter: { contractId?: string }): Promise<DashboardSnapshot> {
    const debtWhere = filter.contractId ? { contractId: filter.contractId } : {};
    const communicationWhere = filter.contractId
      ? { debt: { contractId: filter.contractId } }
      : {};
    const contractWhere = filter.contractId ? { id: filter.contractId } : {};

    const [
      communicationsSent,
      outstanding,
      recovered,
      linkedDebtCount,
      contractCount,
      recent,
    ] = await Promise.all([
      this.prisma.communication.count({ where: communicationWhere }),
      this.prisma.debt.aggregate({
        where: { ...debtWhere, status: { in: [...OUTSTANDING_DEBT_STATUSES] } },
        _sum: { amount: true },
      }),
      this.prisma.debt.aggregate({
        where: { ...debtWhere, status: DEBT_STATUS.PAID },
        _sum: { amount: true },
      }),
      this.prisma.debt.count({ where: debtWhere }),
      this.prisma.contract.count({ where: contractWhere }),
      this.prisma.debt.findMany({
        where: debtWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          debtor: true,
          communications: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return {
      communicationsSent,
      outstandingAmount: outstanding._sum.amount ?? 0,
      recoveredAmount: recovered._sum.amount ?? 0,
      linkedDebtCount,
      contractCount,
      recentDebts: recent.map((debt) => ({
        id: debt.id,
        amount: debt.amount,
        status: debt.status,
        debtorName: `${debt.debtor.firstName} ${debt.debtor.lastName}`,
        latestCommunication: debt.communications[0]
          ? {
              type: debt.communications[0].type,
              status: debt.communications[0].status,
            }
          : null,
      })),
    };
  }
}
