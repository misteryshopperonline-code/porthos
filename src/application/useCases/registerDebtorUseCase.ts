import { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';
import { Debtor } from '@/core/entities/debtor';

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
      if (!data.contractId || !data.amount || !data.dueDate) {
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
          amount: data.amount,
          dueDate: data.dueDate
        }
      );

      return { success: true, debtor };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar deudor y deuda.' };
    }
  }
}
