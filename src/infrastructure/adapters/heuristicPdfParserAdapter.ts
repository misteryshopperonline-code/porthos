import type { AiPdfParserPort } from '@/application/ports/aiPdfParserPort';
import type { ContractConditions } from '@/core/entities/contractConditions';
import {
  extractRoughPdfText,
  parseConditionsFromText,
} from '@/infrastructure/adapters/pdfTextExtraction';

/**
 * Parser offline: regex sobre texto aproximado del PDF.
 * Activo cuando no hay OPENAI_API_KEY.
 */
export class HeuristicPdfParserAdapter implements AiPdfParserPort {
  async extractConditions(pdfBuffer: Buffer): Promise<ContractConditions> {
    if (pdfBuffer.length === 0) {
      return { summary: 'PDF vacío; no se extrajeron condiciones.' };
    }

    const text = extractRoughPdfText(pdfBuffer);
    const parsed = parseConditionsFromText(text);

    if (Object.keys(parsed).length === 0) {
      return {
        summary:
          'No se detectaron condiciones con heurística. Configura OPENAI_API_KEY para análisis con IA.',
      };
    }

    return parsed;
  }
}
