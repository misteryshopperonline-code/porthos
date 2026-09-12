import { describe, expect, it, vi } from 'vitest';
import { ResendEmailMessagingAdapter } from '@/infrastructure/adapters/resendEmailMessagingAdapter';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';

describe('ResendEmailMessagingAdapter', () => {
  it('envía email con Authorization y payload correctos', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    const adapter = new ResendEmailMessagingAdapter({
      apiKey: 're_test',
      from: 'ops@porthos.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const ok = await adapter.sendEmail(
      'deudor@example.com',
      'Recordatorio',
      '<p>Hola</p>',
    );

    expect(ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    expect(JSON.parse(init.body)).toEqual({
      from: 'ops@porthos.test',
      to: ['deudor@example.com'],
      subject: 'Recordatorio',
      html: '<p>Hola</p>',
    });
  });

  it('devuelve false si Resend responde error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    });

    const adapter = new ResendEmailMessagingAdapter({
      apiKey: 'bad',
      from: 'ops@porthos.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      adapter.sendEmail('a@b.com', 'x', '<p>y</p>'),
    ).resolves.toBe(false);
  });

  it('delega SMS/WhatsApp al fallback', async () => {
    const fallback = new ConsoleMessagingAdapter();
    const adapter = new ResendEmailMessagingAdapter({
      apiKey: 're_test',
      from: 'ops@porthos.test',
      fetchImpl: vi.fn() as unknown as typeof fetch,
      nonEmailFallback: fallback,
    });

    await adapter.sendSMS('+15551212', 'hola');
    await adapter.sendWhatsApp('+15551212', 'tpl', { name: 'Ana' });

    expect(fallback.sent).toHaveLength(2);
    expect(fallback.sent[0]?.channel).toBe('SMS');
    expect(fallback.sent[1]?.channel).toBe('WHATSAPP');
  });
});
