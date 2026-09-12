export type ContractConditions = {
  interestRate?: number;
  lateFee?: number;
  amount?: number;
  dueDate?: string;
  parties?: string[];
  summary?: string;
};

export function normalizeContractConditions(
  value: unknown,
): ContractConditions | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const conditions: ContractConditions = {};

  if (typeof raw.interestRate === 'number' && Number.isFinite(raw.interestRate)) {
    conditions.interestRate = raw.interestRate;
  }
  if (typeof raw.lateFee === 'number' && Number.isFinite(raw.lateFee)) {
    conditions.lateFee = raw.lateFee;
  }
  if (typeof raw.amount === 'number' && Number.isFinite(raw.amount)) {
    conditions.amount = raw.amount;
  }
  if (typeof raw.dueDate === 'string' && raw.dueDate.trim()) {
    conditions.dueDate = raw.dueDate.trim();
  }
  if (Array.isArray(raw.parties)) {
    conditions.parties = raw.parties.filter((p): p is string => typeof p === 'string');
  }
  if (typeof raw.summary === 'string' && raw.summary.trim()) {
    conditions.summary = raw.summary.trim();
  }

  return Object.keys(conditions).length > 0 ? conditions : null;
}
