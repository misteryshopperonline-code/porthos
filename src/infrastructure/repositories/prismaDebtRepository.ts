import type { PrismaClient } from '@prisma/client';
import type {
  DebtRecord,
  DebtRepositoryPort,
  DebtWithContact,
} from '@/application/ports/debtRepositoryPort';
import type { DebtStatus } from '@/core/entities/debt';
import { toMoneyNumber } from '@/core/money';

export class PrismaDebtRepository implements DebtRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DebtRecord | null> {
    const debt = await this.prisma.debt.findUnique({ where: { id } });
    if (!debt) return null;
    return {
      id: debt.id,
      contractId: debt.contractId,
      amount: toMoneyNumber(debt.amount),
      status: debt.status as DebtStatus,
    };
  }

  async findByIdWithContact(id: string): Promise<DebtWithContact | null> {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: { debtor: true },
    });
    if (!debt) return null;
    return {
      id: debt.id,
      contractId: debt.contractId,
      amount: toMoneyNumber(debt.amount),
      status: debt.status as DebtStatus,
      debtorName: `${debt.debtor.firstName} ${debt.debtor.lastName}`,
      debtorEmail: debt.debtor.email,
    };
  }

  async updateStatus(id: string, status: DebtStatus): Promise<DebtRecord> {
    const debt = await this.prisma.debt.update({
      where: { id },
      data: { status },
    });
    return {
      id: debt.id,
      contractId: debt.contractId,
      amount: toMoneyNumber(debt.amount),
      status: debt.status as DebtStatus,
    };
  }
}
