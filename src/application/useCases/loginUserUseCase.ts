import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserEntity, UserRepositoryPort } from '@/application/ports/userRepositoryPort';

const INVALID_CREDENTIALS = 'Credenciales inválidas.';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(
    email: string,
    plainPassword: string,
  ): Promise<{ success: boolean; user?: Omit<UserEntity, 'passwordHash'>; error?: string }> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);

      if (!existingUser || !existingUser.passwordHash) {
        return { success: false, error: INVALID_CREDENTIALS };
      }

      const isValid = await this.hasher.compare(plainPassword, existingUser.passwordHash);
      if (!isValid) {
        return { success: false, error: INVALID_CREDENTIALS };
      }

      return {
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          contractId: existingUser.contractId,
        },
      };
    } catch {
      return { success: false, error: 'Fallo interno de autenticación' };
    }
  }
}
