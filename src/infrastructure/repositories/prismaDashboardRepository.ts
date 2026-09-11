import type { PrismaClient } from '@prisma/client';
import type {
  DashboardRepositoryPort,
  DashboardSnapshot,
} from '@/application/ports/dashboardRepositoryPort';
import type { CommunicationStatus, CommunicationType } from '@/core/entities/communication';
import type { DebtStatus } from '@/core/entities/debt';
import { DEBT_STATUS, OUTSTANDING_DEBT_STATUSES } from '@/core/entities/debt';
import { toMoneyNumber } from '@/core/money';

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
      outstandingAmount: toMoneyNumber(outstanding._sum.amount),
      recoveredAmount: toMoneyNumber(recovered._sum.amount),
      linkedDebtCount,
      contractCount,
      recentDebts: recent.map((debt) => ({
        id: debt.id,
        amount: toMoneyNumber(debt.amount),
        status: debt.status as DebtStatus,
        debtorName: `${debt.debtor.firstName} ${debt.debtor.lastName}`,
        latestCommunication: debt.communications[0]
          ? {
              type: debt.communications[0].type as CommunicationType,
              status: debt.communications[0].status as CommunicationStatus,
            }
          : null,
      })),
    };
  }
}
