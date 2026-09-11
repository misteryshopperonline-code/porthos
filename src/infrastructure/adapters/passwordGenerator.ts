import { randomBytes } from 'node:crypto';

export function generateTemporaryPassword(): string {
  return randomBytes(18).toString('base64url').slice(0, 16);
}
