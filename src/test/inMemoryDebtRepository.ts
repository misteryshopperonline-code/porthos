import type {
  DebtRecord,
  DebtRepositoryPort,
  DebtWithContact,
} from '@/application/ports/debtRepositoryPort';
import type { DebtStatus } from '@/core/entities/debt';

export class InMemoryDebtRepository implements DebtRepositoryPort {
  debts: DebtRecord[] = [];
  contacts = new Map<string, { debtorName: string; debtorEmail: string | null }>();

  seed(debt: DebtRecord, contact?: { debtorName: string; debtorEmail: string | null }) {
    this.debts.push(debt);
    if (contact) this.contacts.set(debt.id, contact);
  }

  async findById(id: string): Promise<DebtRecord | null> {
    return this.debts.find((d) => d.id === id) ?? null;
  }

  async findByIdWithContact(id: string): Promise<DebtWithContact | null> {
    const debt = await this.findById(id);
    if (!debt) return null;
    const contact = this.contacts.get(id) ?? {
      debtorName: 'Unknown',
      debtorEmail: null,
    };
    return { ...debt, ...contact };
  }

  async updateStatus(id: string, status: DebtStatus): Promise<DebtRecord> {
    const debt = this.debts.find((d) => d.id === id);
    if (!debt) throw new Error('not found');
    debt.status = status;
    return debt;
  }
}
