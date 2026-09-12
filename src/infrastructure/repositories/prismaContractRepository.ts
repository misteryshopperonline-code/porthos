import type { PrismaClient, Prisma } from '@prisma/client';
import type { ContractRepositoryPort, ContractSummary } from '@/application/ports/contractRepositoryPort';
import type {
  ContractDocument,
  ContractDocumentRepositoryPort,
} from '@/application/ports/contractDocumentRepositoryPort';
import type { ContractConditions } from '@/core/entities/contractConditions';
import { normalizeContractConditions } from '@/core/entities/contractConditions';
import type { TenantScope } from '@/core/tenant/scope';

function toDocument(row: {
  id: string;
  contractCode: string;
  documentUrl: string | null;
  conditions: Prisma.JsonValue | null;
  createdAt: Date;
}): ContractDocument {
  return {
    id: row.id,
    contractCode: row.contractCode,
    documentUrl: row.documentUrl,
    conditions: normalizeContractConditions(row.conditions),
    createdAt: row.createdAt,
  };
}

export class PrismaContractRepository
  implements ContractRepositoryPort, ContractDocumentRepositoryPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async listVisible(scope: TenantScope): Promise<ContractSummary[]> {
    if (scope.type === 'none') {
      return [];
    }

    const where = scope.type === 'contract' ? { id: scope.contractId } : {};

    return this.prisma.contract.findMany({
      where,
      select: { id: true, contractCode: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ContractDocument | null> {
    const row = await this.prisma.contract.findUnique({ where: { id } });
    return row ? toDocument(row) : null;
  }

  async listDocuments(scope: TenantScope): Promise<ContractDocument[]> {
    if (scope.type === 'none') {
      return [];
    }

    const where = scope.type === 'contract' ? { id: scope.contractId } : {};
    const rows = await this.prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDocument);
  }

  async updateAnalysis(
    id: string,
    input: { documentUrl: string; conditions: ContractConditions },
  ): Promise<ContractDocument> {
    const row = await this.prisma.contract.update({
      where: { id },
      data: {
        documentUrl: input.documentUrl,
        conditions: input.conditions as Prisma.InputJsonValue,
      },
    });
    return toDocument(row);
  }
}
