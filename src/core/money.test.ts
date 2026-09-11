import { describe, expect, it } from 'vitest';
import { assertPositiveMoney, roundMoney, toMoneyNumber, toPrismaDecimal } from '@/core/money';

describe('money helpers', () => {
  it('redondea a 2 decimales de forma estable', () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(1.999)).toBe(2);
    expect(toPrismaDecimal(10.5)).toBe('10.50');
  });

  it('acepta Decimal-like y strings', () => {
    expect(toMoneyNumber({ toNumber: () => 12.345 })).toBe(12.35);
    expect(toMoneyNumber('9.99')).toBe(9.99);
    expect(toMoneyNumber(null)).toBe(0);
  });

  it('rechaza montos no positivos', () => {
    expect(assertPositiveMoney(0)).toBeNull();
    expect(assertPositiveMoney(-1)).toBeNull();
    expect(assertPositiveMoney(Number.NaN)).toBeNull();
    expect(assertPositiveMoney(1.239)).toBe(1.24);
  });
});
