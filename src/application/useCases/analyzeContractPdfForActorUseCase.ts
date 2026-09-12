import type { AiPdfParserPort } from '@/application/ports/aiPdfParserPort';
import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { ContractDocumentRepositoryPort } from '@/application/ports/contractDocumentRepositoryPort';
import type { FileStoragePort } from '@/application/ports/fileStoragePort';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const PDF_MAGIC = Buffer.from('%PDF');

export class AnalyzeContractPdfForActorUseCase {
  constructor(
    private readonly contracts: ContractDocumentRepositoryPort,
    private readonly storage: FileStoragePort,
    private readonly parser: AiPdfParserPort,
    private readonly audit: AuditLogPort,
  ) {}

  async execute(
    actor: SessionUser | null,
    input: { contractId: string; filename: string; bytes: Buffer },
  ) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    if (!input.contractId) {
      return { success: false as const, error: 'Selecciona un contrato.' };
    }

    if (!input.bytes?.length) {
      return { success: false as const, error: 'El archivo PDF está vacío.' };
    }

    if (input.bytes.length > MAX_PDF_BYTES) {
      return { success: false as const, error: 'El PDF supera el límite de 5 MB.' };
    }

    if (!input.bytes.subarray(0, 4).equals(PDF_MAGIC)) {
      return { success: false as const, error: 'El archivo no parece un PDF válido.' };
    }

    const contract = await this.contracts.findById(input.contractId);
    if (!contract) {
      return { success: false as const, error: 'El contrato no existe.' };
    }

    const access = assertContractWrite(actorScope(actor), contract.id);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    const stored = await this.storage.store({
      bytes: input.bytes,
      filename: input.filename || `${contract.contractCode}.pdf`,
      contentType: 'application/pdf',
    });

    const conditions = await this.parser.extractConditions(input.bytes);
    const updated = await this.contracts.updateAnalysis(contract.id, {
      documentUrl: stored.url,
      conditions,
    });

    await this.audit.record({
      userId: actor.id,
      action: AUDIT_ACTIONS.CONTRACT_PDF_ANALYZED,
      details: {
        contractId: contract.id,
        documentUrl: stored.url,
        conditionKeys: Object.keys(conditions),
      },
    });

    return {
      success: true as const,
      contract: updated,
    };
  }
}
