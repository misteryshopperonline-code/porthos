import type { SessionUser } from '@/core/entities/user';

export type TenantScope =
  | { type: 'all' }
  | { type: 'contract'; contractId: string }
  | { type: 'none' };

export function actorScope(actor: SessionUser): TenantScope {
  if (actor.role === 'GLOBAL_ADMIN') {
    return { type: 'all' };
  }
  if (actor.contractId) {
    return { type: 'contract', contractId: actor.contractId };
  }
  return { type: 'none' };
}

export type ContractAccess =
  | { ok: true; filter: { contractId?: string } }
  | { ok: false; error: string };

export function resolveRequestedContract(
  scope: TenantScope,
  requestedContractId?: string | null,
): ContractAccess {
  if (scope.type === 'none') {
    return { ok: false, error: 'Tu usuario no tiene un contrato asignado.' };
  }

  if (scope.type === 'contract') {
    if (requestedContractId && requestedContractId !== scope.contractId) {
      return { ok: false, error: 'No tienes acceso a este contrato.' };
    }
    return { ok: true, filter: { contractId: scope.contractId } };
  }

  if (requestedContractId) {
    return { ok: true, filter: { contractId: requestedContractId } };
  }

  return { ok: true, filter: {} };
}

export function assertContractWrite(
  scope: TenantScope,
  contractId: string,
): { ok: true } | { ok: false; error: string } {
  if (!contractId) {
    return { ok: false, error: 'El contrato es requerido.' };
  }
  if (scope.type === 'none') {
    return { ok: false, error: 'Tu usuario no tiene un contrato asignado.' };
  }
  if (scope.type === 'contract' && scope.contractId !== contractId) {
    return { ok: false, error: 'No tienes acceso a este contrato.' };
  }
  return { ok: true };
}

export function canManageUsers(actor: SessionUser): boolean {
  return actor.role === 'GLOBAL_ADMIN' || actor.role === 'CONTRACT_ADMIN';
}
