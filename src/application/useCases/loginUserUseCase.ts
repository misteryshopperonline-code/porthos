import { UserRepositoryPort, UserEntity } from '@/application/ports/userRepositoryPort';
import { BcryptPasswordService } from '@/infrastructure/adapters/bcryptPasswordService';

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepositoryPort,
    private cryptoService: BcryptPasswordService
  ) {}

  async execute(email: string, plainPassword: string): Promise<{ success: boolean; user?: Omit<UserEntity, 'passwordHash'>; error?: string }> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      
      if (!existingUser || !existingUser.passwordHash) {
        return { success: false, error: 'Credenciales inválidas o cuenta no registrada tradicionalmente.' };
      }

      const isValid = await this.cryptoService.compare(plainPassword, existingUser.passwordHash);

      if (!isValid) {
        return { success: false, error: 'La contraseña ingresada es incorrecta.' };
      }

      return { 
        success: true, 
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          contractId: existingUser.contractId,
        }
      };
    } catch (e: any) {
      return { success: false, error: 'Fallo interno de autenticación' };
    }
  }
}
