import { afterEach, describe, expect, it } from 'vitest';
import { createFileStorage, fileStorageProviderLabel } from '@/infrastructure/adapters/createFileStorage';
import { LocalPublicFileStorageAdapter } from '@/infrastructure/adapters/localPublicFileStorageAdapter';
import { VercelBlobFileStorageAdapter } from '@/infrastructure/adapters/vercelBlobFileStorageAdapter';

describe('createFileStorage', () => {
  const original = process.env.BLOB_READ_WRITE_TOKEN;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = original;
  });

  it('usa local sin token', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(createFileStorage()).toBeInstanceOf(LocalPublicFileStorageAdapter);
    expect(fileStorageProviderLabel()).toBe('local');
  });

  it('usa Vercel Blob con token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_xxx';
    expect(createFileStorage()).toBeInstanceOf(VercelBlobFileStorageAdapter);
    expect(fileStorageProviderLabel()).toBe('vercel-blob');
  });
});
