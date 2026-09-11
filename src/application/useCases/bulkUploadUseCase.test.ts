import { describe, expect, it } from 'vitest';
import { BulkUploadUseCase } from '@/application/useCases/bulkUploadUseCase';
import { BulkUploadForActorUseCase } from '@/application/useCases/bulkUploadForActorUseCase';
import type { FileReaderPort } from '@/application/ports/fileReaderPort';
import { InMemoryDebtorRepository } from '@/test/inMemoryDebtorRepository';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { actor } from '@/test/actors';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

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
    const useCase = new BulkUploadForActorUseCase(inner, new InMemoryAuditLog());

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
      new InMemoryAuditLog(),
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

  it('registra audit tras carga exitosa', async () => {
    const audit = new InMemoryAuditLog();
    const useCase = new BulkUploadForActorUseCase(
      new BulkUploadUseCase(
        new StaticFileReader([
          { identification: '1', firstName: 'A', lastName: 'B', amount: '10.5' },
        ]),
        new InMemoryDebtorRepository(),
      ),
      audit,
    );

    const result = await useCase.execute(actor(), {
      fileBuffer: Buffer.from('x'),
      fileName: 'ok.csv',
      contractId: 'contract-a',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.uploaded).toBe(1);
    }
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.DEBTORS_BULK_UPLOADED);
  });
});
