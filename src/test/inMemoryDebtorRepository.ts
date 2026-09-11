import type { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import type { Debtor } from '@/core/entities/debtor';

type StoredDebt = {
  debtorId: string;
  contractId: string;
  amount: number;
  dueDate: Date;
};

export class InMemoryDebtorRepository implements DebtorRepositoryPort {
  debtors: Debtor[] = [];
  debts: StoredDebt[] = [];

  async save(
    debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>,
  ): Promise<Debtor> {
    const created: Debtor = {
      ...debtor,
      id: `d-${this.debtors.length + 1}`,
      score: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.debtors.push(created);
    return created;
  }

  async upsertWithDebt(
    debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt' | 'score'>,
    debt: { contractId: string; amount: number; dueDate: Date },
  ): Promise<Debtor> {
    let existing = this.debtors.find((item) => item.identification === debtor.identification);
    if (!existing) {
      existing = await this.save(debtor);
    } else {
      existing.firstName = debtor.firstName;
      existing.lastName = debtor.lastName;
      existing.email = debtor.email;
      existing.phone = debtor.phone;
    }
    this.debts.push({
      debtorId: existing.id,
      contractId: debt.contractId,
      amount: debt.amount,
      dueDate: debt.dueDate,
    });
    return existing;
  }

  async findById(id: string): Promise<Debtor | null> {
    return this.debtors.find((item) => item.id === id) ?? null;
  }

  async findByIdentification(identification: string): Promise<Debtor | null> {
    return this.debtors.find((item) => item.identification === identification) ?? null;
  }

  async findAll(): Promise<Debtor[]> {
    return [...this.debtors];
  }
}
