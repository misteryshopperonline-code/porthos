import type { TenantScope } from '@/core/tenant/scope';

export type ContractSummary = {
  id: string;
  contractCode: string;
};

export interface ContractRepositoryPort {
  listVisible(scope: TenantScope): Promise<ContractSummary[]>;
}
