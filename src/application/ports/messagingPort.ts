export interface MessagingPort {
  sendSMS(to: string, message: string): Promise<boolean>;
  sendEmail(to: string, subject: string, bodyHTML: string): Promise<boolean>;
  sendWhatsApp(to: string, templateId: string, variables: Record<string, any>): Promise<boolean>;
}
