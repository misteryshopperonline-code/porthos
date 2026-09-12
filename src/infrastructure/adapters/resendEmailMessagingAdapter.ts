import type { MessagingPort } from '@/application/ports/messagingPort';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';

export type ResendEmailConfig = {
  apiKey: string;
  from: string;
  /** Inyectable para tests; por defecto `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
  /** Canales no-email (SMS/WhatsApp) hasta conectar Twilio/Meta. */
  nonEmailFallback?: MessagingPort;
};

/**
 * Envía email vía API HTTP de Resend. SMS/WhatsApp delegan al fallback (console por defecto).
 */
export class ResendEmailMessagingAdapter implements MessagingPort {
  private readonly fetchImpl: typeof fetch;
  private readonly nonEmail: MessagingPort;

  constructor(private readonly config: ResendEmailConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch.bind(globalThis);
    this.nonEmail = config.nonEmailFallback ?? new ConsoleMessagingAdapter();
  }

  async sendEmail(to: string, subject: string, bodyHTML: string): Promise<boolean> {
    try {
      const response = await this.fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.from,
          to: [to],
          subject,
          html: bodyHTML,
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error(
          `[messaging:resend] failed status=${response.status} ${detail.slice(0, 200)}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('[messaging:resend] network error', error);
      return false;
    }
  }

  sendSMS(to: string, message: string): Promise<boolean> {
    return this.nonEmail.sendSMS(to, message);
  }

  sendWhatsApp(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<boolean> {
    return this.nonEmail.sendWhatsApp(to, templateId, variables);
  }
}
