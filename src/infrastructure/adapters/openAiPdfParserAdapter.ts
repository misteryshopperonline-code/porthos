import type { AiPdfParserPort } from '@/application/ports/aiPdfParserPort';
import type { ContractConditions } from '@/core/entities/contractConditions';
import { normalizeContractConditions } from '@/core/entities/contractConditions';
import {
  extractRoughPdfText,
  parseConditionsFromText,
} from '@/infrastructure/adapters/pdfTextExtraction';
import { HeuristicPdfParserAdapter } from '@/infrastructure/adapters/heuristicPdfParserAdapter';

export type OpenAiPdfParserConfig = {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
  fallback?: AiPdfParserPort;
};

/**
 * Envía un extracto del PDF a OpenAI (JSON) y normaliza condiciones.
 * Si la API falla, cae a la heurística.
 */
export class OpenAiPdfParserAdapter implements AiPdfParserPort {
  private readonly fetchImpl: typeof fetch;
  private readonly fallback: AiPdfParserPort;
  private readonly model: string;

  constructor(private readonly config: OpenAiPdfParserConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch.bind(globalThis);
    this.fallback = config.fallback ?? new HeuristicPdfParserAdapter();
    this.model = config.model ?? 'gpt-4o-mini';
  }

  async extractConditions(pdfBuffer: Buffer): Promise<ContractConditions> {
    const text = extractRoughPdfText(pdfBuffer);
    if (!text) {
      return this.fallback.extractConditions(pdfBuffer);
    }

    try {
      const response = await this.fetchImpl('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Eres un analista de contratos de cobranza. Extrae condiciones en JSON con claves opcionales: interestRate (number), lateFee (number), amount (number), dueDate (string ISO o legible), parties (string[]), summary (string breve en español).',
            },
            {
              role: 'user',
              content: `Texto aproximado del PDF del contrato:\n\n${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`[pdf-ia:openai] status=${response.status}`);
        return this.fallback.extractConditions(pdfBuffer);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        return this.fallback.extractConditions(pdfBuffer);
      }

      const parsed = JSON.parse(content) as unknown;
      const normalized = normalizeContractConditions(parsed);
      if (!normalized) {
        return {
          ...parseConditionsFromText(text),
          summary: 'La IA no devolvió condiciones útiles; se aplicó heurística parcial.',
        };
      }

      return normalized;
    } catch (error) {
      console.error('[pdf-ia:openai] error', error);
      return this.fallback.extractConditions(pdfBuffer);
    }
  }
}
