export type UserRole = 'GLOBAL_ADMIN' | 'CONTRACT_ADMIN' | 'OPERATOR';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  contractId: string | null;
};
