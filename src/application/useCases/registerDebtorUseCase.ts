import { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import { Debtor } from '@/core/entities/debtor';
import { assertPositiveMoney } from '@/core/money';

export class RegisterDebtorUseCase {
  constructor(private debtorRepository: DebtorRepositoryPort) {}

  async execute(data: {
    identification: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    contractId: string;
    amount: number;
    dueDate: Date;
  }): Promise<{ success: boolean; debtor?: Debtor; error?: string }> {
    try {
      const amount = assertPositiveMoney(data.amount);
      if (!data.contractId || amount === null || !data.dueDate) {
        return { success: false, error: 'Información de deuda o contrato faltante.' };
      }

      const debtor = await this.debtorRepository.upsertWithDebt(
        {
          identification: data.identification,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone || null,
        },
        {
          contractId: data.contractId,
          amount,
          dueDate: data.dueDate,
        },
      );

      return { success: true, debtor };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al registrar deudor y deuda.';
      return { success: false, error: message };
    }
  }
}
