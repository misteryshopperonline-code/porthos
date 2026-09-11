import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAuthSecret } from '@/lib/authSecret';

describe('getAuthSecret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa NEXTAUTH_SECRET cuando existe', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'from-env');
    expect(getAuthSecret()).toBe('from-env');
  });

  it('falla en producción si falta el secreto', () => {
    vi.stubEnv('NEXTAUTH_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getAuthSecret()).toThrow(/NEXTAUTH_SECRET/);
  });

  it('permite un fallback sólo fuera de producción', () => {
    vi.stubEnv('NEXTAUTH_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getAuthSecret()).toBe('porthos-dev-insecure-secret');
  });
});
