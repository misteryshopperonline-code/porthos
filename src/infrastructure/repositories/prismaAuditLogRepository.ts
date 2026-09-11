import type { Prisma, PrismaClient } from '@prisma/client';
import type { AuditEntry, AuditLogPort } from '@/application/ports/auditLogPort';

export class PrismaAuditLogRepository implements AuditLogPort {
  constructor(private readonly prisma: PrismaClient) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        details: entry.details
          ? (entry.details as Prisma.InputJsonValue)
          : undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  }
}
