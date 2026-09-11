import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';
import { BulkUploadUseCase } from '@/application/useCases/bulkUploadUseCase';

const MAX_CSV_BYTES = 5 * 1024 * 1024;

export class BulkUploadForActorUseCase {
  constructor(private readonly bulkUpload: BulkUploadUseCase) {}

  async execute(
    actor: SessionUser | null,
    input: { fileBuffer: Buffer; fileName: string; contractId: string },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    const access = assertContractWrite(actorScope(actor), input.contractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    if (input.fileBuffer.byteLength > MAX_CSV_BYTES) {
      return { success: false as const, error: 'El archivo supera el límite de 5MB.' };
    }

    const result = await this.bulkUpload.execute(
      input.fileBuffer,
      input.fileName,
      input.contractId,
    );

    return {
      success: true as const,
      uploaded: result.success,
      failed: result.failed,
      errors: result.errors,
    };
  }
}
