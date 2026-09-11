import { createHash, randomBytes } from 'node:crypto';
import type { InviteTokenPort } from '@/application/ports/inviteTokenPort';

type Stored = { email: string; tokenHash: string; expires: Date };

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export class InMemoryInviteTokenRepository implements InviteTokenPort {
  tokens: Stored[] = [];

  async create(email: string, expiresAt: Date): Promise<string> {
    const raw = randomBytes(16).toString('hex');
    this.tokens = this.tokens.filter((t) => t.email !== email.toLowerCase());
    this.tokens.push({
      email: email.toLowerCase(),
      tokenHash: hashToken(raw),
      expires: expiresAt,
    });
    return raw;
  }

  async consume(rawToken: string): Promise<string | null> {
    const tokenHash = hashToken(rawToken);
    const idx = this.tokens.findIndex((t) => t.tokenHash === tokenHash);
    if (idx < 0) return null;
    const row = this.tokens[idx]!;
    this.tokens.splice(idx, 1);
    if (row.expires.getTime() < Date.now()) return null;
    return row.email;
  }
}
