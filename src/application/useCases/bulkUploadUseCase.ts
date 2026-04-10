import { FileReaderPort } from '../ports/fileReaderPort';
import { DebtorRepositoryPort } from '../ports/debtorRepositoryPort';

export class BulkUploadUseCase {
  constructor(
    private fileReader: FileReaderPort,
    private debtorRepository: DebtorRepositoryPort
  ) {}

  async execute(fileBuffer: Buffer, fileName: string): Promise<{ success: number; failed: number; errors: any[] }> {
    const records = await this.fileReader.parse(fileBuffer, fileName);
    
    let successCount = 0;
    let failedCount = 0;
    let errors = [];

    // Mapeo básico asumiendo que el archivo plantilla tiene columnas: identification, firstName, lastName, email, phone
    for (const record of records) {
      try {
         if(!record.identification || !record.firstName || !record.lastName) {
             throw new Error("Los campos 'identification', 'firstName', 'lastName' son requeridos en la plantilla.");
         }

         const existing = await this.debtorRepository.findByIdentification(String(record.identification));
         if(existing) {
             errors.push({ record: record.identification, error: "El deudor ya está registrado." });
             failedCount++;
             continue; // En una versión avanzada, aquí podríamos actualizar el registro en su lugar.
         }

         await this.debtorRepository.save({
            identification: String(record.identification),
            firstName: String(record.firstName),
            lastName: String(record.lastName),
            email: record.email ? String(record.email) : null,
            phone: record.phone ? String(record.phone) : null,
         });

         successCount++;
      } catch (e: any) {
         failedCount++;
         errors.push({ record, error: e.message || 'Error desconocido al volcar fila' });
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }
}
