export type RecentDebtRow = {
  id: string;
  amount: number;
  status: string;
  debtorName: string;
  latestCommunication: { type: string; status: string } | null;
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
