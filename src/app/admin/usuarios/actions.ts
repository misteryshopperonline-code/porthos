'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RegisterPlatformUserUseCase } from "@/application/useCases/registerPlatformUserUseCase";
import { PrismaUserRepository } from "@/infrastructure/repositories/prismaUserRepository";
import { BcryptPasswordService } from "@/infrastructure/adapters/bcryptPasswordService";
import { revalidatePath } from "next/cache";

const userRepository = new PrismaUserRepository();
const cryptoService = new BcryptPasswordService();
const registerUseCase = new RegisterPlatformUserUseCase(userRepository, cryptoService);

export async function createUserAction(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: 'No tienes una sesión activa para ejecutar esto.' };
  }

  const requesterRole = (session.user as any).role;
  const requesterContractId = (session.user as any).contractId;

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const targetRole = formData.get('role') as any;
  const contractId = formData.get('contractId') as string;

  if (!email || !name || !targetRole) {
    return { error: 'Información de registro incompleta.' };
  }

  const result = await registerUseCase.execute(
    requesterRole,
    requesterContractId,
    {
      email,
      name,
      role: targetRole,
      contractId: contractId || null,
    }
  );

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath('/admin/usuarios');
  return { 
    success: true, 
    message: `¡${targetRole} creado exitosamente! Contraseña autogenerada fue sujeta a hashing. El usuario solicitará OTP.` 
  };
}
