export const COMMUNICATION_TYPE = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
} as const;

export type CommunicationType =
  (typeof COMMUNICATION_TYPE)[keyof typeof COMMUNICATION_TYPE];

export const COMMUNICATION_STATUS = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
} as const;

export type CommunicationStatus =
  (typeof COMMUNICATION_STATUS)[keyof typeof COMMUNICATION_STATUS];
