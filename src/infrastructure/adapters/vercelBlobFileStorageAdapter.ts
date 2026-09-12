import { put } from '@vercel/blob';
import type { FileStoragePort, StoreFileInput, StoredFile } from '@/application/ports/fileStoragePort';
import { buildContractPdfObjectKey } from '@/infrastructure/adapters/contractPdfObjectKey';

export type VercelBlobPut = typeof put;

export type VercelBlobFileStorageConfig = {
  /** Token RW; por defecto `process.env.BLOB_READ_WRITE_TOKEN`. */
  token?: string;
  /** Inyectable para tests. */
  putImpl?: VercelBlobPut;
  /**
   * `public` (default): URL directa en documentUrl.
   * `private`: requiere proxy/auth para lectura; aún así se guarda la URL del blob.
   */
  access?: 'public' | 'private';
};

/**
 * Almacena PDFs en Vercel Blob (producción / preview con token).
 */
export class VercelBlobFileStorageAdapter implements FileStoragePort {
  private readonly putImpl: VercelBlobPut;
  private readonly token: string | undefined;
  private readonly access: 'public' | 'private';

  constructor(config: VercelBlobFileStorageConfig = {}) {
    this.putImpl = config.putImpl ?? put;
    this.token = config.token ?? process.env.BLOB_READ_WRITE_TOKEN;
    this.access = config.access ?? 'public';
  }

  async store(input: StoreFileInput): Promise<StoredFile> {
    const pathname = buildContractPdfObjectKey(input.filename);

    const blob = await this.putImpl(pathname, input.bytes, {
      access: this.access,
      contentType: input.contentType || 'application/pdf',
      token: this.token,
      addRandomSuffix: false,
    });

    return {
      key: pathname,
      url: blob.url,
    };
  }
}
