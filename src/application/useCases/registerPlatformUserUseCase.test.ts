import { describe, it, expect, vi } from 'vitest';
import { RegisterPlatformUserUseCase } from './registerPlatformUserUseCase';
import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { InMemoryInviteTokenRepository } from '@/test/inMemoryInviteToken';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';

describe('RegisterPlatformUserUseCase RBAC Rules', () => {
  const mockCrypto: PasswordHasherPort = {
    hash: vi.fn().mockResolvedValue('hashed_pwd'),
    compare: vi.fn(),
  };

  function buildUseCase(repo: UserRepositoryPort, messaging = new ConsoleMessagingAdapter()) {
    return new RegisterPlatformUserUseCase(
      repo,
      mockCrypto,
      new InMemoryInviteTokenRepository(),
      messaging,
      () => 'http://localhost:3000',
    );
  }

  it('CONTRACT_ADMIN intentando crear un OPERATOR debe sobreescribir silenciosamente al contrato del admin', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: '123' })),
      updatePassword: vi.fn(),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort;
    const messaging = new ConsoleMessagingAdapter();

    const result = await buildUseCase(mockRepo, messaging).execute(
      'CONTRACT_ADMIN',
      'contrato-xyz-789',
      {
        email: 'nuevooperador@gmail.com',
        name: 'Nuevo Recolector',
        role: 'OPERATOR',
        contractId: 'intento-hacker-contrato-falso',
      },
    );

    expect(result.success).toBe(true);
    expect(result.inviteToken).toBeTruthy();
    expect(result.inviteUrl).toContain('/activar?token=');
    expect(result.inviteEmailSent).toBe(true);
    expect(messaging.sent).toHaveLength(1);
    expect(messaging.sent[0]?.to).toBe('nuevooperador@gmail.com');
    expect(result.user?.contractId).toBe('contrato-xyz-789');
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'OPERATOR',
        contractId: 'contrato-xyz-789',
        passwordHash: null,
      }),
    );
  });

  it('CONTRACT_ADMIN intentando crear un GLOBAL_ADMIN deber ser bloqueado', async () => {
    const result = await buildUseCase({} as UserRepositoryPort).execute(
      'CONTRACT_ADMIN',
      'contrato-xyz-789',
      {
        email: 'intruso@gmail.com',
        name: 'Hacker',
        role: 'GLOBAL_ADMIN',
        contractId: null,
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Como administrador de contrato sólo puedes registrar operadores');
  });

  it('OPERATOR no puede registrar usuarios', async () => {
    const result = await buildUseCase({} as UserRepositoryPort).execute('OPERATOR', 'c1', {
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
      updatePassword: vi.fn(),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort;

    const result = await buildUseCase(mockRepo).execute('GLOBAL_ADMIN', null, {
      email: 'clientenuevo@gmail.com',
      name: 'Dueño de Contrato',
      role: 'CONTRACT_ADMIN',
      contractId: 'contrato-real-externo',
    });

    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('CONTRACT_ADMIN');
    expect(result.user?.contractId).toBe('contrato-real-externo');
    expect(result.inviteToken).toBeTruthy();
  });
});
