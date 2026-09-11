import type { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import type { Debtor } from '@/core/entities/debtor';

type StoredDebt = {
  id: string;
  debtorId: string;
  contractId: string;
  amount: number;
  dueDate: Date;
  status: string;
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
  ) {
    let existing = this.debtors.find((item) => item.identification === debtor.identification);
    if (!existing) {
      existing = await this.save(debtor);
    } else {
      existing.firstName = debtor.firstName;
      existing.lastName = debtor.lastName;
      existing.email = debtor.email;
      existing.phone = debtor.phone;
    }

    const existingDebt = this.debts.find(
      (item) => item.debtorId === existing!.id && item.contractId === debt.contractId,
    );

    if (existingDebt) {
      existingDebt.amount = debt.amount;
      existingDebt.dueDate = debt.dueDate;
      return { debtor: existing, debtCreated: false };
    }

    this.debts.push({
      id: `debt-${this.debts.length + 1}`,
      debtorId: existing.id,
      contractId: debt.contractId,
      amount: debt.amount,
      dueDate: debt.dueDate,
      status: 'PENDING',
    });
    return { debtor: existing, debtCreated: true };
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
