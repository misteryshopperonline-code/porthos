import { describe, expect, it, vi } from 'vitest';
import { OpenAiPdfParserAdapter } from '@/infrastructure/adapters/openAiPdfParserAdapter';

describe('OpenAiPdfParserAdapter', () => {
  it('normaliza JSON de OpenAI', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                interestRate: 7,
                lateFee: 20,
                summary: 'Contrato demo',
              }),
            },
          },
        ],
      }),
    });

    const adapter = new OpenAiPdfParserAdapter({
      apiKey: 'sk-test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await adapter.extractConditions(
      Buffer.from('%PDF-1.4\n(interest rate placeholder)\n%%EOF', 'latin1'),
    );

    expect(result.interestRate).toBe(7);
    expect(result.lateFee).toBe(20);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('cae a heurística si OpenAI falla', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const adapter = new OpenAiPdfParserAdapter({
      apiKey: 'sk-test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await adapter.extractConditions(
      Buffer.from('%PDF-1.4\n(interest rate 9%)\n%%EOF', 'latin1'),
    );

    expect(result.interestRate).toBe(9);
  });
});
