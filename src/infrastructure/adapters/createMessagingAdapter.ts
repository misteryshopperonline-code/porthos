import type { MessagingPort } from '@/application/ports/messagingPort';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';
import { ResendEmailMessagingAdapter } from '@/infrastructure/adapters/resendEmailMessagingAdapter';

/**
 * Elige el adaptador de mensajería según env.
 * - `RESEND_API_KEY` → Resend (email real)
 * - sin clave → console (dev / fallback)
 */
export function createMessagingAdapter(): MessagingPort {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() || 'Porthos <onboarding@resend.dev>';

  if (apiKey) {
    return new ResendEmailMessagingAdapter({ apiKey, from });
  }

  return new ConsoleMessagingAdapter();
}

export function messagingProviderLabel(): string {
  return process.env.RESEND_API_KEY?.trim() ? 'resend' : 'console';
}
