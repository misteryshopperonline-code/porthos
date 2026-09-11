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
