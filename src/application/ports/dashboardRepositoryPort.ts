import type { CommunicationStatus, CommunicationType } from '@/core/entities/communication';
import type { DebtStatus } from '@/core/entities/debt';

export type RecentDebtRow = {
  id: string;
  amount: number;
  status: DebtStatus;
  debtorName: string;
  latestCommunication: { type: CommunicationType; status: CommunicationStatus } | null;
};

export type DashboardSnapshot = {
  communicationsSent: number;
  outstandingAmount: number;
  recoveredAmount: number;
  linkedDebtCount: number;
  contractCount: number;
  recentDebts: RecentDebtRow[];
};

export interface DashboardRepositoryPort {
  getSnapshot(filter: { contractId?: string }): Promise<DashboardSnapshot>;
}
