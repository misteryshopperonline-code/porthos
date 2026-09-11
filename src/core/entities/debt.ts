export const DEBT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  DEFAULTED: 'DEFAULTED',
} as const;

export type DebtStatus = (typeof DEBT_STATUS)[keyof typeof DEBT_STATUS];

export const OUTSTANDING_DEBT_STATUSES: DebtStatus[] = [
  DEBT_STATUS.PENDING,
  DEBT_STATUS.DEFAULTED,
];

const ALLOWED_TRANSITIONS: Record<DebtStatus, readonly DebtStatus[]> = {
  PENDING: [DEBT_STATUS.PAID, DEBT_STATUS.DEFAULTED],
  DEFAULTED: [DEBT_STATUS.PAID],
  PAID: [],
};

export function canTransitionDebtStatus(from: DebtStatus, to: DebtStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertDebtStatusTransition(
  from: DebtStatus,
  to: DebtStatus,
): { ok: true } | { ok: false; error: string } {
  if (!canTransitionDebtStatus(from, to)) {
    return {
      ok: false,
      error: `Transición de estado inválida: ${from} → ${to}.`,
    };
  }
  return { ok: true };
}
