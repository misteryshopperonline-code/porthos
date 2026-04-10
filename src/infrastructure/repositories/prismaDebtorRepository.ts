import { PrismaClient } from '@prisma/client';
import { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import { Debtor } from '@/core/entities/debtor';

// Instancia global para evitar múltiples conexiones en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class PrismaDebtorRepository implements DebtorRepositoryPort {
  async save(debtorData: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>): Promise<Debtor> {
    const newDebtor = await prisma.debtor.create({
      data: {
        identification: debtorData.identification,
        firstName: debtorData.firstName,
        lastName: debtorData.lastName,
        email: debtorData.email,
        phone: debtorData.phone,
        // Score default is managed by DB schema (100)
      }
    });
    return newDebtor;
  }

  async findById(id: string): Promise<Debtor | null> {
    return await prisma.debtor.findUnique({ where: { id } });
  }

  async findByIdentification(identification: string): Promise<Debtor | null> {
    return await prisma.debtor.findUnique({ where: { identification } });
  }

  async findAll(): Promise<Debtor[]> {
    return await prisma.debtor.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
