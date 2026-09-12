import { describe, expect, it } from 'vitest';
import {
  extractRoughPdfText,
  parseConditionsFromText,
} from '@/infrastructure/adapters/pdfTextExtraction';
import { HeuristicPdfParserAdapter } from '@/infrastructure/adapters/heuristicPdfParserAdapter';

describe('pdfTextExtraction', () => {
  it('parsea interés y mora del texto', () => {
    const parsed = parseConditionsFromText(
      'Contrato con interest rate 5.5% y late fee $40. Monto principal $1,200.00',
    );
    expect(parsed.interestRate).toBe(5.5);
    expect(parsed.lateFee).toBe(40);
    expect(parsed.amount).toBe(1200);
  });

  it('extrae literales del PDF', () => {
    const buf = Buffer.from('%PDF-1.4\n(interest rate 3%)\n(late fee $25)\n%%EOF', 'latin1');
    const text = extractRoughPdfText(buf);
    expect(text).toMatch(/interest rate 3%/);
    expect(text).toMatch(/late fee \$25/);
  });
});

describe('HeuristicPdfParserAdapter', () => {
  it('devuelve condiciones desde un PDF sintético', async () => {
    const adapter = new HeuristicPdfParserAdapter();
    const buf = Buffer.from(
      '%PDF-1.4\n(interest rate 4%)\n(mora $15)\n%%EOF',
      'latin1',
    );
    const conditions = await adapter.extractConditions(buf);
    expect(conditions.interestRate).toBe(4);
    expect(conditions.lateFee).toBe(15);
  });
});
