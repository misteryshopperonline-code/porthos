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
  }): Promise<{ success: boolean; debtor?: Debtor; error?: string }> {
    try {
      // Regla de Negocio: Validar si la identificación ya existe
      const existingDebtor = await this.debtorRepository.findByIdentification(data.identification);
      
      if (existingDebtor) {
        return { success: false, error: 'Un deudor con esta identificación ya está registrado.' };
      }

      const debtor = await this.debtorRepository.save({
        identification: data.identification,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
      });

      return { success: true, debtor };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar al deudor.' };
    }
  }
}
