export type UserRole = 'GLOBAL_ADMIN' | 'CONTRACT_ADMIN' | 'OPERATOR';

export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  contractId: string | null;
  passwordHash: string | null;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: Omit<UserEntity, 'id'>): Promise<UserEntity>;
}
