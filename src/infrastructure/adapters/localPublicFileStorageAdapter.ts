import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FileStoragePort, StoreFileInput, StoredFile } from '@/application/ports/fileStoragePort';
import { buildContractPdfObjectKey } from '@/infrastructure/adapters/contractPdfObjectKey';

/**
 * Guarda PDFs bajo `public/contracts` para servirlos estáticamente en Next.
 */
export class LocalPublicFileStorageAdapter implements FileStoragePort {
  constructor(
    private readonly publicDir = path.join(process.cwd(), 'public', 'contracts'),
    private readonly publicPathPrefix = '/contracts',
  ) {}

  async store(input: StoreFileInput): Promise<StoredFile> {
    await mkdir(this.publicDir, { recursive: true });

    const objectKey = buildContractPdfObjectKey(input.filename);
    const key = objectKey.replace(/^contracts\//, '');
    const absolute = path.join(this.publicDir, key);
    await writeFile(absolute, input.bytes);

    return {
      key: objectKey,
      url: `${this.publicPathPrefix}/${key}`,
    };
  }
}
