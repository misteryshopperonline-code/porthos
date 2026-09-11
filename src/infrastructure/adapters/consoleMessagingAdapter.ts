import type { MessagingPort, OutboundMessage } from '@/application/ports/messagingPort';

/**
 * Adaptador de desarrollo / fallback: registra mensajes en memoria (y console).
 * Sustituible por Resend/SMTP/Twilio sin tocar use cases.
 */
export class ConsoleMessagingAdapter implements MessagingPort {
  readonly sent: OutboundMessage[] = [];

  async sendEmail(to: string, subject: string, bodyHTML: string): Promise<boolean> {
    this.sent.push({
      channel: 'EMAIL',
      to,
      subject,
      body: bodyHTML,
      at: new Date(),
    });
    console.info(`[messaging:email] to=${to} subject=${subject}`);
    return true;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    this.sent.push({ channel: 'SMS', to, body: message, at: new Date() });
    console.info(`[messaging:sms] to=${to}`);
    return true;
  }

  async sendWhatsApp(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<boolean> {
    this.sent.push({
      channel: 'WHATSAPP',
      to,
      subject: templateId,
      body: JSON.stringify(variables),
      at: new Date(),
    });
    console.info(`[messaging:whatsapp] to=${to} template=${templateId}`);
    return true;
  }
}
