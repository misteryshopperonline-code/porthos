import type { PrismaClient } from '@prisma/client';
import type { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import { DEBT_STATUS } from '@/core/entities/debt';
import type { Debtor } from '@/core/entities/debtor';

export class PrismaDebtorRepository implements DebtorRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(
    debtorData: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>,
  ): Promise<Debtor> {
    return this.prisma.debtor.create({
      data: {
        identification: debtorData.identification,
        firstName: debtorData.firstName,
        lastName: debtorData.lastName,
        email: debtorData.email,
        phone: debtorData.phone,
      },
    });
  }

  async upsertWithDebt(
    debtorData: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>,
    debt: { contractId: string; amount: number; dueDate: Date },
  ): Promise<Debtor> {
    return this.prisma.$transaction(async (tx) => {
      const upsertedDebtor = await tx.debtor.upsert({
        where: { identification: debtorData.identification },
        update: {
          firstName: debtorData.firstName,
          lastName: debtorData.lastName,
          email: debtorData.email,
          phone: debtorData.phone,
        },
        create: {
          identification: debtorData.identification,
          firstName: debtorData.firstName,
          lastName: debtorData.lastName,
          email: debtorData.email,
          phone: debtorData.phone,
        },
      });

      await tx.debt.create({
        data: {
          debtorId: upsertedDebtor.id,
          contractId: debt.contractId,
          amount: debt.amount,
          dueDate: debt.dueDate,
          status: DEBT_STATUS.PENDING,
        },
      });

      return upsertedDebtor;
    });
  }

  async findById(id: string): Promise<Debtor | null> {
    return this.prisma.debtor.findUnique({ where: { id } });
  }

  async findByIdentification(identification: string): Promise<Debtor | null> {
    return this.prisma.debtor.findUnique({ where: { identification } });
  }

  async findAll(): Promise<Debtor[]> {
    return this.prisma.debtor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
