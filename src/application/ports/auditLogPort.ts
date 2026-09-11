export type AuditEntry = {
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
};

export interface AuditLogPort {
  record(entry: AuditEntry): Promise<void>;
}

export const AUDIT_ACTIONS = {
  DEBTOR_REGISTERED: 'DEBTOR_REGISTERED',
  DEBTORS_BULK_UPLOADED: 'DEBTORS_BULK_UPLOADED',
  USER_CREATED: 'USER_CREATED',
  DEBT_STATUS_CHANGED: 'DEBT_STATUS_CHANGED',
  PASSWORD_SET_VIA_INVITE: 'PASSWORD_SET_VIA_INVITE',
} as const;
