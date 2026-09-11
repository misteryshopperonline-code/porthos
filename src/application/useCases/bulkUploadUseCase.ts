import type { FileReaderPort } from '@/application/ports/fileReaderPort';
import type { DebtorRepositoryPort } from '@/application/ports/debtorRepositoryPort';

function defaultDueDate(): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

function parseAmount(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount;
}

export class BulkUploadUseCase {
  constructor(
    private readonly fileReader: FileReaderPort,
    private readonly debtorRepository: DebtorRepositoryPort,
  ) {}

  async execute(
    fileBuffer: Buffer,
    fileName: string,
    contractId: string,
  ): Promise<{ success: number; failed: number; errors: { record: unknown; error: string }[] }> {
    const records = await this.fileReader.parse(fileBuffer, fileName);

    let successCount = 0;
    let failedCount = 0;
    const errors: { record: unknown; error: string }[] = [];

    for (const record of records) {
      try {
        if (!record.identification || !record.firstName || !record.lastName) {
          throw new Error("Los campos 'identification', 'firstName', 'lastName' son requeridos en la plantilla.");
        }

        const amount = parseAmount(record.amount);
        if (amount === null) {
          throw new Error("El campo 'amount' es requerido y debe ser un número positivo.");
        }

        const dueDate = record.dueDate ? new Date(String(record.dueDate)) : defaultDueDate();
        if (Number.isNaN(dueDate.getTime())) {
          throw new Error("El campo 'dueDate' no es una fecha válida.");
        }

        await this.debtorRepository.upsertWithDebt(
          {
            identification: String(record.identification),
            firstName: String(record.firstName),
            lastName: String(record.lastName),
            email: record.email ? String(record.email) : null,
            phone: record.phone ? String(record.phone) : null,
          },
          {
            contractId,
            amount,
            dueDate,
          },
        );

        successCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          record: record.identification ?? record,
          error: error instanceof Error ? error.message : 'Error desconocido al volcar fila',
        });
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }
}
