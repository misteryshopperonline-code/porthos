import type { PrismaClient } from '@prisma/client';
import type { DebtRecord, DebtRepositoryPort } from '@/application/ports/debtRepositoryPort';
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
