import type { Debtor } from '@/core/entities/debtor';

export type UpsertWithDebtResult = {
  debtor: Debtor;
  /** true si se creó la deuda; false si se actualizó una existente del mismo contrato */
  debtCreated: boolean;
};

export interface DebtorRepositoryPort {
  save(debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>): Promise<Debtor>;
  upsertWithDebt(
    debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>,
    debt: { contractId: string; amount: number; dueDate: Date },
  ): Promise<UpsertWithDebtResult>;
  findById(id: string): Promise<Debtor | null>;
  findByIdentification(identification: string): Promise<Debtor | null>;
  findAll(): Promise<Debtor[]>;
}
