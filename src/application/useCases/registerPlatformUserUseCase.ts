import type { InviteTokenPort } from '@/application/ports/inviteTokenPort';
import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserEntity, UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import type { UserRole } from '@/core/entities/user';

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export class RegisterPlatformUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly invites: InviteTokenPort,
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
    },
  ): Promise<{
    success: boolean;
    user?: Omit<UserEntity, 'passwordHash'>;
    inviteToken?: string;
    error?: string;
  }> {
    try {
      if (adminRequesterRole === 'OPERATOR') {
        return { success: false, error: 'Acceso denegado: Los operadores no pueden registrar usuarios.' };
      }

      if (adminRequesterRole === 'CONTRACT_ADMIN') {
        if (newUserConfig.role !== 'OPERATOR') {
          return {
            success: false,
            error: 'Acceso denegado: Como administrador de contrato sólo puedes registrar operadores.',
          };
        }
        newUserConfig.contractId = adminContractId;
      }

      const existing = await this.userRepository.findByEmail(newUserConfig.email);
      if (existing) {
        return { success: false, error: 'Un usuario con este email ya existe en el sistema.' };
      }

      let passwordHash: string | null = null;
      let inviteToken: string | undefined;

      if (newUserConfig.rawPassword) {
        passwordHash = await this.hasher.hash(newUserConfig.rawPassword);
      } else {
        inviteToken = await this.invites.create(
          newUserConfig.email,
          new Date(Date.now() + INVITE_TTL_MS),
        );
      }

      const savedUser = await this.userRepository.save({
        email: newUserConfig.email,
        name: newUserConfig.name,
        role: newUserConfig.role,
        contractId: newUserConfig.contractId,
        passwordHash,
      });

      return {
        success: true,
        inviteToken,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          contractId: savedUser.contractId,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de transacción.';
      return { success: false, error: message };
    }
  }
}
