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

  if (!identification || !firstName || !lastName) {
    return { error: 'La identificación, nombre y apellidos son requeridos.' };
  }

  const result = await registerDebtorUseCase.execute({
    identification,
    firstName,
    lastName,
    email,
    phone,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/deudores'); // Actualizar la lista en la UI si la tuvieramos mostrada
  return { success: true, message: 'Deudor registrado exitosamente.' };
}
