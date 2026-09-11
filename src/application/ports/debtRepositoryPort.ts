import type { DebtStatus } from '@/core/entities/debt';

export type DebtRecord = {
  id: string;
  contractId: string;
  amount: number;
  status: DebtStatus;
};

export interface DebtRepositoryPort {
  findById(id: string): Promise<DebtRecord | null>;
  updateStatus(id: string, status: DebtStatus): Promise<DebtRecord>;
}
