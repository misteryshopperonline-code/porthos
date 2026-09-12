import { describe, expect, it } from 'vitest';
import type { AiPdfParserPort } from '@/application/ports/aiPdfParserPort';
import type { AuditLogPort } from '@/application/ports/auditLogPort';
import type {
  ContractDocument,
  ContractDocumentRepositoryPort,
} from '@/application/ports/contractDocumentRepositoryPort';
import type { FileStoragePort } from '@/application/ports/fileStoragePort';
import type { ContractConditions } from '@/core/entities/contractConditions';
import { AnalyzeContractPdfForActorUseCase } from '@/application/useCases/analyzeContractPdfForActorUseCase';
import { actor } from '@/test/actors';

function doc(overrides: Partial<ContractDocument> = {}): ContractDocument {
  return {
    id: 'contract-a',
    contractCode: 'CONT-1',
    documentUrl: null,
    conditions: null,
    createdAt: new Date(),
    ...overrides,
  };
}

class FakeDocs implements ContractDocumentRepositoryPort {
  constructor(private readonly row: ContractDocument | null) {}
  updated: { documentUrl: string; conditions: ContractConditions } | null = null;

  async findById(id: string) {
    return this.row?.id === id ? this.row : null;
  }
  async listDocuments() {
    return this.row ? [this.row] : [];
  }
  async updateAnalysis(id: string, input: { documentUrl: string; conditions: ContractConditions }) {
    this.updated = input;
    return doc({ id, documentUrl: input.documentUrl, conditions: input.conditions });
  }
}

class FakeStorage implements FileStoragePort {
  async store() {
    return { url: '/contracts/x.pdf', key: 'x.pdf' };
  }
}

class FakeParser implements AiPdfParserPort {
  async extractConditions() {
    return { interestRate: 5, lateFee: 50, summary: 'ok' };
  }
}

class FakeAudit implements AuditLogPort {
  entries: unknown[] = [];
  async record(entry: unknown) {
    this.entries.push(entry);
  }
}

function pdfBytes(extra = 'interest rate 5% late fee $50') {
  return Buffer.from(`%PDF-1.4\n(${extra})\n%%EOF`);
}

describe('AnalyzeContractPdfForActorUseCase', () => {
  it('almacena PDF, parsea condiciones y audita', async () => {
    const contracts = new FakeDocs(doc());
    const useCase = new AnalyzeContractPdfForActorUseCase(
      contracts,
      new FakeStorage(),
      new FakeParser(),
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), {
      contractId: 'contract-a',
      filename: 'demo.pdf',
      bytes: pdfBytes(),
    });

    expect(result.success).toBe(true);
    expect(contracts.updated?.documentUrl).toBe('/contracts/x.pdf');
    expect(contracts.updated?.conditions.interestRate).toBe(5);
  });

  it('rechaza archivos que no son PDF', async () => {
    const useCase = new AnalyzeContractPdfForActorUseCase(
      new FakeDocs(doc()),
      new FakeStorage(),
      new FakeParser(),
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), {
      contractId: 'contract-a',
      filename: 'x.txt',
      bytes: Buffer.from('hello'),
    });

    expect(result.success).toBe(false);
  });

  it('bloquea contrato fuera de alcance', async () => {
    const useCase = new AnalyzeContractPdfForActorUseCase(
      new FakeDocs(doc({ id: 'other' })),
      new FakeStorage(),
      new FakeParser(),
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), {
      contractId: 'other',
      filename: 'a.pdf',
      bytes: pdfBytes(),
    });

    expect(result.success).toBe(false);
  });
});
