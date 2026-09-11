import type { DebtRecord, DebtRepositoryPort } from '@/application/ports/debtRepositoryPort';
import type { DebtStatus } from '@/core/entities/debt';

export class InMemoryDebtRepository implements DebtRepositoryPort {
  debts: DebtRecord[] = [];

  seed(debt: DebtRecord) {
    this.debts.push(debt);
  }

  async findById(id: string): Promise<DebtRecord | null> {
    return this.debts.find((d) => d.id === id) ?? null;
  }

  async updateStatus(id: string, status: DebtStatus): Promise<DebtRecord> {
    const debt = this.debts.find((d) => d.id === id);
    if (!debt) throw new Error('not found');
    debt.status = status;
    return debt;
  }
}
