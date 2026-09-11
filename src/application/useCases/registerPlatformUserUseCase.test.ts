import { describe, it, expect, vi } from 'vitest';
import { RegisterPlatformUserUseCase } from './registerPlatformUserUseCase';
import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';

describe('RegisterPlatformUserUseCase RBAC Rules', () => {
  const mockCrypto: PasswordHasherPort = {
    hash: vi.fn().mockResolvedValue('hashed_pwd'),
    compare: vi.fn(),
  };

  it('CONTRACT_ADMIN intentando crear un OPERATOR debe sobreescribir silenciosamente al contrato del admin', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: '123' })),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort;

    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto, () => 'temp-pass');

    const result = await useCase.execute('CONTRACT_ADMIN', 'contrato-xyz-789', {
      email: 'nuevooperador@gmail.com',
      name: 'Nuevo Recolector',
      role: 'OPERATOR',
      contractId: 'intento-hacker-contrato-falso',
    });

    expect(result.success).toBe(true);
    expect(result.temporaryPassword).toBe('temp-pass');
    expect(result.user?.contractId).toBe('contrato-xyz-789');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'OPERATOR',
        contractId: 'contrato-xyz-789',
      }),
    );
  });

  it('CONTRACT_ADMIN intentando crear un GLOBAL_ADMIN deber ser bloqueado', async () => {
    const mockRepo = {} as UserRepositoryPort;
    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto, () => 'temp-pass');

    const result = await useCase.execute('CONTRACT_ADMIN', 'contrato-xyz-789', {
      email: 'intruso@gmail.com',
      name: 'Hacker',
      role: 'GLOBAL_ADMIN',
      contractId: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Como administrador de contrato sólo puedes registrar operadores');
  });

  it('OPERATOR no puede registrar usuarios', async () => {
    const useCase = new RegisterPlatformUserUseCase({} as UserRepositoryPort, mockCrypto, () => 'x');
    const result = await useCase.execute('OPERATOR', 'c1', {
      email: 'a@b.com',
      name: 'A',
      role: 'OPERATOR',
      contractId: 'c1',
    });
    expect(result.success).toBe(false);
  });

  it('GLOBAL_ADMIN tiene poder absoluto para crear a cualquier rol asignándole o no contratos', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: '444' })),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort;

    const useCase = new RegisterPlatformUserUseCase(mockRepo, mockCrypto, () => 'temp-pass');

    const result = await useCase.execute('GLOBAL_ADMIN', null, {
      email: 'clientenuevo@gmail.com',
      name: 'Dueño de Contrato',
      role: 'CONTRACT_ADMIN',
      contractId: 'contrato-real-externo',
    });

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('CONTRACT_ADMIN');
    expect(result.user?.contractId).toBe('contrato-real-externo');
  });
});
