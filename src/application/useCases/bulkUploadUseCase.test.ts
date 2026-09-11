import { describe, expect, it } from 'vitest';
import { BulkUploadUseCase } from '@/application/useCases/bulkUploadUseCase';
import { BulkUploadForActorUseCase } from '@/application/useCases/bulkUploadForActorUseCase';
import type { FileReaderPort } from '@/application/ports/fileReaderPort';
import { InMemoryDebtorRepository } from '@/test/inMemoryDebtorRepository';
import { actor } from '@/test/actors';

class StaticFileReader implements FileReaderPort {
  constructor(private readonly rows: Record<string, unknown>[]) {}
  async parse() {
    return this.rows;
  }
}

describe('BulkUploadUseCase', () => {
  it('crea deuda con upsert y reporta filas inválidas', async () => {
    const repo = new InMemoryDebtorRepository();
    const reader = new StaticFileReader([
      { identification: '1', firstName: 'A', lastName: 'B', amount: '50' },
      { identification: '2', firstName: 'C', lastName: 'D' },
      { identification: '1', firstName: 'A', lastName: 'B', amount: '20' },
    ]);
    const useCase = new BulkUploadUseCase(reader, repo);

    const result = await useCase.execute(Buffer.from('csv'), 'file.csv', 'contract-a');

    expect(result.success).toBe(2);
    expect(result.failed).toBe(1);
    expect(repo.debtors).toHaveLength(1);
    expect(repo.debts).toHaveLength(2);
  });
});

describe('BulkUploadForActorUseCase', () => {
  it('exige sesión y contrato autorizado', async () => {
    const inner = new BulkUploadUseCase(
      new StaticFileReader([]),
      new InMemoryDebtorRepository(),
    );
    const useCase = new BulkUploadForActorUseCase(inner);

    const noSession = await useCase.execute(null, {
      fileBuffer: Buffer.from('x'),
      fileName: 'a.csv',
      contractId: 'contract-a',
    });
    expect(noSession.success).toBe(false);

    const forbidden = await useCase.execute(actor({ contractId: 'contract-a' }), {
      fileBuffer: Buffer.from('x'),
      fileName: 'a.csv',
      contractId: 'other',
    });
    expect(forbidden.success).toBe(false);
  });

  it('rechaza CSV mayores a 5MB', async () => {
    const useCase = new BulkUploadForActorUseCase(
      new BulkUploadUseCase(new StaticFileReader([]), new InMemoryDebtorRepository()),
    );
    const result = await useCase.execute(actor(), {
      fileBuffer: Buffer.alloc(5 * 1024 * 1024 + 1),
      fileName: 'big.csv',
      contractId: 'contract-a',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/5MB/);
    }
  });
});
