import { PrismaClient } from '@prisma/client';
import { UserEntity, UserRepositoryPort } from '@/application/ports/userRepositoryPort';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class PrismaUserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any, // Mapeado
      contractId: user.contractId,
      passwordHash: user.passwordHash
    };
  }

  async save(userConfig: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const newUser = await prisma.user.create({
      data: {
        email: userConfig.email,
        name: userConfig.name,
        role: userConfig.role as any,
        contractId: userConfig.contractId,
        passwordHash: userConfig.passwordHash
      }
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any, // Mapeado
      contractId: newUser.contractId,
      passwordHash: newUser.passwordHash
    };
  }
}
