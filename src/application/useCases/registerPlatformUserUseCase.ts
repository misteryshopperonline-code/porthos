import { UserRepositoryPort, UserRole, UserEntity } from '@/application/ports/userRepositoryPort';
import { BcryptPasswordService } from '@/infrastructure/adapters/bcryptPasswordService';

export class RegisterPlatformUserUseCase {
  constructor(
    private userRepository: UserRepositoryPort,
    private cryptoService: BcryptPasswordService
  ) {}

  async execute(
    adminRequesterRole: UserRole,
    adminContractId: string | null,
    newUserConfig: {
      email: string;
      rawPassword?: string;
      name: string;
      role: UserRole;
      contractId: string | null;
    }
  ): Promise<{ success: boolean; user?: Omit<UserEntity, 'passwordHash'>; error?: string }> {
    try {
      // Regla 1: Sólo los roles superiores pueden registrar usuarios.
      if (adminRequesterRole === 'OPERATOR') {
        return { success: false, error: 'Acceso denegado: Los operadores no pueden registrar usuarios.' };
      }

      // Regla 2: El CONTRACT_ADMIN sólo puede crear OPERATORS y DEBEN ser forzados a su mismo contrato.
      if (adminRequesterRole === 'CONTRACT_ADMIN') {
        if (newUserConfig.role !== 'OPERATOR') {
          return { success: false, error: 'Acceso denegado: Como administrador de contrato sólo puedes registrar operadores.' };
        }
        
        // Forzar silenciosamente asignación al contrato del Admin (ignorar intento de inyección externa)
        newUserConfig.contractId = adminContractId; 
      }

      // Regla 3: El email no puede estar replicado.
      const existing = await this.userRepository.findByEmail(newUserConfig.email);
      if (existing) {
        return { success: false, error: 'Un usuario con este email ya existe en el sistema.' };
      }

      // Hashing de contraseña (usamos un predeterminado o generamos uno aleatorio si no se pasó en el registro para forzar cambio OTP)
      const clearPassword = newUserConfig.rawPassword || Math.random().toString(36).slice(-8);
      const passwordHash = await this.cryptoService.hash(clearPassword);

      const savedUser = await this.userRepository.save({
        email: newUserConfig.email,
        name: newUserConfig.name,
        role: newUserConfig.role,
        contractId: newUserConfig.contractId,
        passwordHash
      });

      return { 
        success: true, 
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          contractId: savedUser.contractId,
        } 
      };

    } catch (e: any) {
      return { success: false, error: e.message || 'Error de transacción.' };
    }
  }
}
