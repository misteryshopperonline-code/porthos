'use server';

import { RegisterDebtorUseCase } from '@/application/useCases/registerDebtorUseCase';
import { PrismaDebtorRepository } from '@/infrastructure/repositories/prismaDebtorRepository';
import { revalidatePath } from 'next/cache';

// Inyección de dependencias manual para el Server Action
const debtorRepo = new PrismaDebtorRepository();
const registerDebtorUseCase = new RegisterDebtorUseCase(debtorRepo);

export async function createDebtorAction(prevState: any, formData: FormData) {
  const identification = formData.get('identification') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const contractId = formData.get('contractId') as string;
  const amountStr = formData.get('amount') as string;

  if (!identification || !firstName || !lastName || !contractId || !amountStr) {
    return { error: 'La identificación, nombre, contrato y monto son requeridos.' };
  }

  const amount = parseFloat(amountStr);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Default 30 días para vencimiento

  const result = await registerDebtorUseCase.execute({
    identification,
    firstName,
    lastName,
    email,
    phone,
    contractId,
    amount,
    dueDate
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/deudores'); // Actualizar la lista en la UI si la tuvieramos mostrada
  return { success: true, message: 'Deudor registrado exitosamente.' };
}
