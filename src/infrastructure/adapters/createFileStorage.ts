import type { FileStoragePort } from '@/application/ports/fileStoragePort';
import { LocalPublicFileStorageAdapter } from '@/infrastructure/adapters/localPublicFileStorageAdapter';
import { VercelBlobFileStorageAdapter } from '@/infrastructure/adapters/vercelBlobFileStorageAdapter';

/**
 * - `BLOB_READ_WRITE_TOKEN` → Vercel Blob
 * - sin token → disco local `public/contracts` (dev)
 */
export function createFileStorage(): FileStoragePort {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    return new VercelBlobFileStorageAdapter({ token });
  }
  return new LocalPublicFileStorageAdapter();
}

export function fileStorageProviderLabel(): string {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() ? 'vercel-blob' : 'local';
}
