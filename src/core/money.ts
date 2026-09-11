/**
 * Money helpers keep domain/use-case layers on plain numbers
 * while Prisma persists Decimal(14,2).
 */

export function toMoneyNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return roundMoney(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? roundMoney(parsed) : 0;
  }
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    const maybe = value as { toNumber: () => number };
    if (typeof maybe.toNumber === 'function') {
      return roundMoney(maybe.toNumber());
    }
  }
  return 0;
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function assertPositiveMoney(amount: number): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return roundMoney(amount);
}

/** Prisma accepts number | string | Decimal for Decimal fields. */
export function toPrismaDecimal(amount: number): string {
  return roundMoney(amount).toFixed(2);
}
