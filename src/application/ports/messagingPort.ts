export interface MessagingPort {
  sendSMS(to: string, message: string): Promise<boolean>;
  sendEmail(to: string, subject: string, bodyHTML: string): Promise<boolean>;
  sendWhatsApp(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<boolean>;
}

export type OutboundMessage = {
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  to: string;
  subject?: string;
  body: string;
  at: Date;
};
