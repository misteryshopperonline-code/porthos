import { describe, expect, it } from 'vitest';
import {
  assertDebtStatusTransition,
  canTransitionDebtStatus,
  DEBT_STATUS,
} from '@/core/entities/debt';

describe('debt status transitions', () => {
  it('permite PENDING → PAID / DEFAULTED', () => {
    expect(canTransitionDebtStatus(DEBT_STATUS.PENDING, DEBT_STATUS.PAID)).toBe(true);
    expect(canTransitionDebtStatus(DEBT_STATUS.PENDING, DEBT_STATUS.DEFAULTED)).toBe(true);
  });

  it('permite DEFAULTED → PAID y bloquea PAID → *', () => {
    expect(canTransitionDebtStatus(DEBT_STATUS.DEFAULTED, DEBT_STATUS.PAID)).toBe(true);
    expect(canTransitionDebtStatus(DEBT_STATUS.PAID, DEBT_STATUS.PENDING)).toBe(false);
    expect(assertDebtStatusTransition(DEBT_STATUS.PAID, DEBT_STATUS.DEFAULTED).ok).toBe(false);
  });
});
