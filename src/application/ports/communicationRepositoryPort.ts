import type { CommunicationStatus, CommunicationType } from '@/core/entities/communication';
import type { TenantScope } from '@/core/tenant/scope';

export type CommunicationListItem = {
  id: string;
  type: CommunicationType;
  status: CommunicationStatus;
  content: string;
  sentAt: Date;
  debtorName: string;
  contractId: string;
  debtId: string;
  amount: number;
};

export type CreateCommunicationInput = {
  debtId: string;
  type: CommunicationType;
  status: CommunicationStatus;
  content: string;
};

export interface CommunicationRepositoryPort {
  listRecent(scope: TenantScope, limit?: number): Promise<CommunicationListItem[]>;
  create(input: CreateCommunicationInput): Promise<{ id: string }>;
}
