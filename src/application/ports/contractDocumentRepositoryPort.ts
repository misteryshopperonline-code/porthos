import type { ContractConditions } from '@/core/entities/contractConditions';
import type { TenantScope } from '@/core/tenant/scope';

export type ContractDocument = {
  id: string;
  contractCode: string;
  documentUrl: string | null;
  conditions: ContractConditions | null;
  createdAt: Date;
};

export interface ContractDocumentRepositoryPort {
  findById(id: string): Promise<ContractDocument | null>;
  listDocuments(scope: TenantScope): Promise<ContractDocument[]>;
  updateAnalysis(
    id: string,
    input: { documentUrl: string; conditions: ContractConditions },
  ): Promise<ContractDocument>;
}
