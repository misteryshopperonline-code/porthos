import { describe, it, expect, vi } from 'vitest';
import { RegisterPlatformUserUseCase } from './registerPlatformUserUseCase';
import { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { BcryptPasswordService } from '@/infrastructure/adapters/bcryptPasswordService';

describe('RegisterPlatformUserUseCase RBAC Rules', () => {
  const mockCrypto = {
    hash: vi.fn().mockResolvedValue('hashed_pwd'),
    compare: vi.fn()
  } as unknown as BcryptPasswordService;

  it('CONTRACT_ADMIN intentando crear un OPERATOR debe sobreescribir silenciosamente al contrato del admin', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation(data => Promise.resolve({ ...data, id: '123' }))
    } as unknown as UserRepositoryPort;

    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto);

    const result = await useCase.execute(
      'CONTRACT_ADMIN',
      'contrato-xyz-789',
      {
        email: 'nuevooperador@gmail.com',
        name: 'Nuevo Recolector',
        role: 'OPERATOR',
        contractId: 'intento-hacker-contrato-falso' // Try to inject false contract
      }
    );

    expect(result.success).toBe(true);
    expect(result.user?.contractId).toBe('contrato-xyz-789'); // Validates the override
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'OPERATOR',
        contractId: 'contrato-xyz-789'
      })
    );
  });

  it('CONTRACT_ADMIN intentando crear un GLOBAL_ADMIN deber ser bloqueado', async () => {
    const mockRepo = {} as UserRepositoryPort;
    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto);

    const result = await useCase.execute(
      'CONTRACT_ADMIN',
      'contrato-xyz-789',
      {
        email: 'intruso@gmail.com',
        name: 'Hacker',
        role: 'GLOBAL_ADMIN',
        contractId: null
      }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Como administrador de contrato sólo puedes registrar operadores');
  });

  it('GLOBAL_ADMIN tiene poder absoluto para crear a cualquier rol asignándole o no contratos', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation(data => Promise.resolve({ ...data, id: '444' }))
    } as unknown as UserRepositoryPort;

    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto);

    const result = await useCase.execute(
      'GLOBAL_ADMIN',
      null, // Globals are unconstrained
      {
        email: 'clientenuevo@gmail.com',
        name: 'Dueño de Contrato',
        role: 'CONTRACT_ADMIN',
        contractId: 'contrato-real-externo'
      }
    );

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('CONTRACT_ADMIN');
    expect(result.user?.contractId).toBe('contrato-real-externo');
  });
});
