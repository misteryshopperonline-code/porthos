export interface ContractConditions {
  amount?: number;
  dueDate?: string;
  parties?: string[];
  interestRate?: number;
  [key: string]: any;
}

export interface AiPdfParserPort {
  /**
   * Extrae condiciones clave de un contrato PDF utilizando un modelo de IA entrenado.
   */
  extractConditions(pdfBuffer: Buffer): Promise<ContractConditions>;
}
