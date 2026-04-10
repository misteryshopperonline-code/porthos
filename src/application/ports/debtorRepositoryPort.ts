import { Debtor } from '@/core/entities/debtor';

export interface DebtorRepositoryPort {
  save(debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>): Promise<Debtor>;
  findById(id: string): Promise<Debtor | null>;
  findByIdentification(identification: string): Promise<Debtor | null>;
  findAll(): Promise<Debtor[]>;
}
