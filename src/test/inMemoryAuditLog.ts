import type { AuditEntry, AuditLogPort } from '@/application/ports/auditLogPort';

export class InMemoryAuditLog implements AuditLogPort {
  entries: AuditEntry[] = [];

  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}
