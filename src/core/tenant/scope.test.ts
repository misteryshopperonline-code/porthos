import { describe, expect, it } from 'vitest';
import {
  actorScope,
  assertContractWrite,
  canManageUsers,
  resolveRequestedContract,
} from '@/core/tenant/scope';
import { actor } from '@/test/actors';

describe('tenant scope', () => {
  it('GLOBAL_ADMIN ve todos los contratos', () => {
    expect(actorScope(actor({ role: 'GLOBAL_ADMIN', contractId: null }))).toEqual({ type: 'all' });
  });

  it('CONTRACT_ADMIN y OPERATOR quedan atados a su contrato', () => {
    expect(actorScope(actor({ role: 'CONTRACT_ADMIN', contractId: 'c1' }))).toEqual({
      type: 'contract',
      contractId: 'c1',
    });
    expect(actorScope(actor({ role: 'OPERATOR', contractId: 'c1' }))).toEqual({
      type: 'contract',
      contractId: 'c1',
    });
  });

  it('usuario de contrato sin contractId no tiene scope', () => {
    expect(actorScope(actor({ role: 'OPERATOR', contractId: null }))).toEqual({ type: 'none' });
  });

  it('bloquea lecturas de un contrato ajeno', () => {
    const scope = actorScope(actor({ role: 'OPERATOR', contractId: 'c1' }));
    const access = resolveRequestedContract(scope, 'c2');
    expect(access.ok).toBe(false);
    if (!access.ok) {
      expect(access.error).toContain('No tienes acceso');
    }
  });

  it('fuerza el contrato propio aunque no se pida filtro', () => {
    const scope = actorScope(actor({ role: 'CONTRACT_ADMIN', contractId: 'c1' }));
    const access = resolveRequestedContract(scope, null);
    expect(access).toEqual({ ok: true, filter: { contractId: 'c1' } });
  });

  it('GLOBAL_ADMIN puede filtrar o ver todo', () => {
    const scope = actorScope(actor({ role: 'GLOBAL_ADMIN', contractId: null }));
    expect(resolveRequestedContract(scope, null)).toEqual({ ok: true, filter: {} });
    expect(resolveRequestedContract(scope, 'c9')).toEqual({ ok: true, filter: { contractId: 'c9' } });
  });

  it('assertContractWrite impide escribir en contrato ajeno', () => {
    const scope = actorScope(actor({ role: 'OPERATOR', contractId: 'c1' }));
    expect(assertContractWrite(scope, 'c2').ok).toBe(false);
    expect(assertContractWrite(scope, 'c1').ok).toBe(true);
    expect(assertContractWrite(scope, '').ok).toBe(false);
  });

  it('solo admins gestionan usuarios', () => {
    expect(canManageUsers(actor({ role: 'OPERATOR' }))).toBe(false);
    expect(canManageUsers(actor({ role: 'CONTRACT_ADMIN' }))).toBe(true);
    expect(canManageUsers(actor({ role: 'GLOBAL_ADMIN', contractId: null }))).toBe(true);
  });
});
