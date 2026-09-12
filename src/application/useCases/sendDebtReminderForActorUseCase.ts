import type { AuditLogPort } from '@/application/ports/auditLogPort';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';
import type { CommunicationRepositoryPort } from '@/application/ports/communicationRepositoryPort';
import type { DebtRepositoryPort } from '@/application/ports/debtRepositoryPort';
import type { MessagingPort } from '@/application/ports/messagingPort';
import {
  COMMUNICATION_STATUS,
  COMMUNICATION_TYPE,
} from '@/core/entities/communication';
import type { SessionUser } from '@/core/entities/user';
import { actorScope, assertContractWrite } from '@/core/tenant/scope';

function formatUsd(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export class SendDebtReminderForActorUseCase {
  constructor(
    private readonly debts: DebtRepositoryPort,
    private readonly communications: CommunicationRepositoryPort,
    private readonly messaging: MessagingPort,
    private readonly audit: AuditLogPort,
  ) {}

  async execute(actor: SessionUser | null, input: { debtId: string }) {
    if (!actor) {
      return { success: false as const, error: 'No tienes una sesión activa para ejecutar esto.' };
    }

    const debt = await this.debts.findByIdWithContact(input.debtId);
    if (!debt) {
      return { success: false as const, error: 'La deuda no existe.' };
    }

    const access = assertContractWrite(actorScope(actor), debt.contractId);
    if (!access.ok) {
      return { success: false as const, error: access.error };
    }

    const email = debt.debtorEmail?.trim();
    if (!email) {
      return {
        success: false as const,
        error: 'El deudor no tiene email registrado.',
      };
    }

    const subject = 'Recordatorio de pago — Porthos';
    const bodyHTML = `<p>Hola ${debt.debtorName},</p>
<p>Te recordamos que tienes un saldo pendiente de <strong>${formatUsd(debt.amount)}</strong>.</p>
<p>Si ya realizaste el pago, ignora este mensaje.</p>
<p>— Equipo Porthos</p>`;

    const sent = await this.messaging.sendEmail(email, subject, bodyHTML);
    const content = `Recordatorio email a ${email}: ${formatUsd(debt.amount)}`;

    const created = await this.communications.create({
      debtId: debt.id,
      type: COMMUNICATION_TYPE.EMAIL,
      status: sent ? COMMUNICATION_STATUS.SENT : COMMUNICATION_STATUS.FAILED,
      content,
    });

    await this.audit.record({
      userId: actor.id,
      action: AUDIT_ACTIONS.DEBT_REMINDER_SENT,
      details: {
        debtId: debt.id,
        communicationId: created.id,
        contractId: debt.contractId,
        channel: COMMUNICATION_TYPE.EMAIL,
        delivered: sent,
      },
    });

    if (!sent) {
      return {
        success: false as const,
        error: 'No se pudo enviar el email. Revisa la configuración de mensajería.',
      };
    }

    return {
      success: true as const,
      communicationId: created.id,
      to: email,
    };
  }
}
