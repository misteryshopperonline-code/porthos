import { describe, expect, it, vi } from 'vitest';
import { VercelBlobFileStorageAdapter } from '@/infrastructure/adapters/vercelBlobFileStorageAdapter';

describe('VercelBlobFileStorageAdapter', () => {
  it('sube el PDF con pathname contracts/… y access public', async () => {
    const putImpl = vi.fn().mockResolvedValue({
      url: 'https://abc.public.blob.vercel-storage.com/contracts/x.pdf',
      pathname: 'contracts/x.pdf',
    });

    const adapter = new VercelBlobFileStorageAdapter({
      token: 'vercel_blob_rw_test',
      putImpl: putImpl as never,
    });

    const stored = await adapter.store({
      bytes: Buffer.from('%PDF-1.4'),
      filename: 'Acuerdo Contado.pdf',
      contentType: 'application/pdf',
    });

    expect(stored.url).toContain('blob.vercel-storage.com');
    expect(stored.key).toMatch(/^contracts\/.+\.pdf$/i);
    expect(putImpl).toHaveBeenCalledOnce();
    const [pathname, body, opts] = putImpl.mock.calls[0]!;
    expect(pathname).toMatch(/^contracts\/.+\.pdf$/i);
    expect(Buffer.isBuffer(body)).toBe(true);
    expect(opts).toMatchObject({
      access: 'public',
      contentType: 'application/pdf',
      token: 'vercel_blob_rw_test',
      addRandomSuffix: false,
    });
  });
});
