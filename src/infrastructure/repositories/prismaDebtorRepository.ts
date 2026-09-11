import type { PrismaClient } from '@prisma/client';
import type {
  DebtorRepositoryPort,
  UpsertWithDebtResult,
} from '@/application/ports/debtorRepositoryPort';
import { DEBT_STATUS } from '@/core/entities/debt';
import type { Debtor } from '@/core/entities/debtor';
import { toPrismaDecimal } from '@/core/money';

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
  ): Promise<UpsertWithDebtResult> {
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

      const existingDebt = await tx.debt.findUnique({
        where: {
          debtorId_contractId: {
            debtorId: upsertedDebtor.id,
            contractId: debt.contractId,
          },
        },
      });

      if (existingDebt) {
        await tx.debt.update({
          where: { id: existingDebt.id },
          data: {
            amount: toPrismaDecimal(debt.amount),
            dueDate: debt.dueDate,
            // No reabrir deudas PAID automáticamente en re-carga.
          },
        });
        return { debtor: upsertedDebtor, debtCreated: false };
      }

      await tx.debt.create({
        data: {
          debtorId: upsertedDebtor.id,
          contractId: debt.contractId,
          amount: toPrismaDecimal(debt.amount),
          dueDate: debt.dueDate,
          status: DEBT_STATUS.PENDING,
        },
      });

      return { debtor: upsertedDebtor, debtCreated: true };
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
