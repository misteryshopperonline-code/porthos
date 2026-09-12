import type { DebtStatus } from '@/core/entities/debt';

export type DebtRecord = {
  id: string;
  contractId: string;
  amount: number;
  status: DebtStatus;
};

export type DebtWithContact = DebtRecord & {
  debtorName: string;
  debtorEmail: string | null;
};

export interface DebtRepositoryPort {
  findById(id: string): Promise<DebtRecord | null>;
  findByIdWithContact(id: string): Promise<DebtWithContact | null>;
  updateStatus(id: string, status: DebtStatus): Promise<DebtRecord>;
}
