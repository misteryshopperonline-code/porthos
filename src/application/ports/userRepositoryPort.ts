import type { SessionUser, UserRole } from '@/core/entities/user';

export type UserEntity = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  contractId: string | null;
  passwordHash: string | null;
};

export type UserListItem = Omit<UserEntity, 'passwordHash'> & {
  createdAt: Date;
};

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: Omit<UserEntity, 'id'>): Promise<UserEntity>;
  listVisibleTo(actor: SessionUser): Promise<UserListItem[]>;
}

export type { UserRole };
