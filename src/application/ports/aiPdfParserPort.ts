import type { ContractConditions } from '@/core/entities/contractConditions';

export type { ContractConditions };

export interface AiPdfParserPort {
  /**
   * Extrae condiciones clave de un contrato PDF.
   */
  extractConditions(pdfBuffer: Buffer): Promise<ContractConditions>;
}
