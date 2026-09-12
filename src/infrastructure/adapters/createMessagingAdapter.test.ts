import { afterEach, describe, expect, it } from 'vitest';
import { createMessagingAdapter, messagingProviderLabel } from '@/infrastructure/adapters/createMessagingAdapter';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';
import { ResendEmailMessagingAdapter } from '@/infrastructure/adapters/resendEmailMessagingAdapter';

describe('createMessagingAdapter', () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalFrom;
  });

  it('usa console sin RESEND_API_KEY', () => {
    delete process.env.RESEND_API_KEY;
    expect(createMessagingAdapter()).toBeInstanceOf(ConsoleMessagingAdapter);
    expect(messagingProviderLabel()).toBe('console');
  });

  it('usa Resend cuando hay API key', () => {
    process.env.RESEND_API_KEY = 're_live_xxx';
    process.env.EMAIL_FROM = 'Porthos <hello@porthos.test>';
    expect(createMessagingAdapter()).toBeInstanceOf(ResendEmailMessagingAdapter);
    expect(messagingProviderLabel()).toBe('resend');
  });
});
