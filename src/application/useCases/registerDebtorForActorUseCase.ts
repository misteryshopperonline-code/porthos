import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';
import { RegisterDebtorUseCase } from '@/application/useCases/registerDebtorUseCase';

export class RegisterDebtorForActorUseCase {
  constructor(private readonly registerDebtor: RegisterDebtorUseCase) {}

  async execute(
    actor: SessionUser | null,
    data: {
      identification: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      contractId: string;
      amount: number;
      dueDate: Date;
    },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    const access = assertContractWrite(actorScope(actor), data.contractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    return this.registerDebtor.execute(data);
  }
}
