import type { PrismaClient } from '@prisma/client';
import type { UserEntity, UserListItem, UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import type { SessionUser, UserRole } from '@/core/entities/user';

function toEntity(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  contractId: string | null;
  passwordHash: string | null;
}): UserEntity {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    contractId: user.contractId,
    passwordHash: user.passwordHash,
  };
}

export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return toEntity(user);
  }

  async save(userConfig: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const newUser = await this.prisma.user.create({
      data: {
        email: userConfig.email,
        name: userConfig.name,
        role: userConfig.role,
        contractId: userConfig.contractId,
        passwordHash: userConfig.passwordHash,
      },
    });
    return toEntity(newUser);
  }

  async listVisibleTo(actor: SessionUser): Promise<UserListItem[]> {
    if (actor.role === 'OPERATOR') {
      return [];
    }

    if (actor.role === 'CONTRACT_ADMIN' && !actor.contractId) {
      return [];
    }

    const where =
      actor.role === 'CONTRACT_ADMIN' && actor.contractId
        ? { contractId: actor.contractId }
        : {};

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        contractId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      contractId: user.contractId,
      createdAt: user.createdAt,
    }));
  }
}
