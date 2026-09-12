import { describe, expect, it } from 'vitest';
import type { AuditLogPort } from '@/application/ports/auditLogPort';
import type {
  CommunicationRepositoryPort,
  CreateCommunicationInput,
} from '@/application/ports/communicationRepositoryPort';
import type { DebtRepositoryPort, DebtWithContact } from '@/application/ports/debtRepositoryPort';
import type { MessagingPort } from '@/application/ports/messagingPort';
import { DEBT_STATUS } from '@/core/entities/debt';
import { SendDebtReminderForActorUseCase } from '@/application/useCases/sendDebtReminderForActorUseCase';
import { actor } from '@/test/actors';

function debt(overrides: Partial<DebtWithContact> = {}): DebtWithContact {
  return {
    id: 'd1',
    contractId: 'contract-a',
    amount: 1500,
    status: DEBT_STATUS.PENDING,
    debtorName: 'Ana Pérez',
    debtorEmail: 'ana@example.com',
    ...overrides,
  };
}

class FakeDebts implements DebtRepositoryPort {
  constructor(private readonly row: DebtWithContact | null) {}
  async findById() {
    return this.row;
  }
  async findByIdWithContact() {
    return this.row;
  }
  async updateStatus() {
    throw new Error('not used');
  }
}

class FakeComms implements CommunicationRepositoryPort {
  created: CreateCommunicationInput[] = [];
  async listRecent() {
    return [];
  }
  async create(input: CreateCommunicationInput) {
    this.created.push(input);
    return { id: 'comm-1' };
  }
}

class FakeMessaging implements MessagingPort {
  emails: { to: string; subject: string }[] = [];
  fail = false;
  async sendEmail(to: string, subject: string) {
    this.emails.push({ to, subject });
    return !this.fail;
  }
  async sendSMS() {
    return true;
  }
  async sendWhatsApp() {
    return true;
  }
}

class FakeAudit implements AuditLogPort {
  entries: unknown[] = [];
  async record(entry: unknown) {
    this.entries.push(entry);
  }
}

describe('SendDebtReminderForActorUseCase', () => {
  it('envía email, persiste Communication SENT y audita', async () => {
    const debts = new FakeDebts(debt());
    const communications = new FakeComms();
    const messaging = new FakeMessaging();
    const audit = new FakeAudit();
    const useCase = new SendDebtReminderForActorUseCase(
      debts,
      communications,
      messaging,
      audit,
    );

    const result = await useCase.execute(actor(), { debtId: 'd1' });

    expect(result.success).toBe(true);
    expect(messaging.emails[0]?.to).toBe('ana@example.com');
    expect(communications.created[0]).toMatchObject({
      debtId: 'd1',
      type: 'EMAIL',
      status: 'SENT',
    });
    expect(audit.entries).toHaveLength(1);
  });

  it('rechaza si el deudor no tiene email', async () => {
    const useCase = new SendDebtReminderForActorUseCase(
      new FakeDebts(debt({ debtorEmail: null })),
      new FakeComms(),
      new FakeMessaging(),
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), { debtId: 'd1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/email/i);
    }
  });

  it('bloquea escritura fuera del contrato del actor', async () => {
    const useCase = new SendDebtReminderForActorUseCase(
      new FakeDebts(debt({ contractId: 'other' })),
      new FakeComms(),
      new FakeMessaging(),
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), { debtId: 'd1' });
    expect(result.success).toBe(false);
  });

  it('persiste FAILED si el proveedor de email falla', async () => {
    const communications = new FakeComms();
    const messaging = new FakeMessaging();
    messaging.fail = true;
    const useCase = new SendDebtReminderForActorUseCase(
      new FakeDebts(debt()),
      communications,
      messaging,
      new FakeAudit(),
    );

    const result = await useCase.execute(actor(), { debtId: 'd1' });
    expect(result.success).toBe(false);
    expect(communications.created[0]).toMatchObject({ status: 'FAILED' });
  });
});
