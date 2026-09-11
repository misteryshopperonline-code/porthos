import { createHash, randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import type { InviteTokenPort } from '@/application/ports/inviteTokenPort';

const INVITE_PREFIX = 'invite:';

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export class PrismaInviteTokenRepository implements InviteTokenPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(email: string, expiresAt: Date): Promise<string> {
    const raw = randomBytes(32).toString('base64url');
    const token = hashToken(raw);
    const identifier = `${INVITE_PREFIX}${email.toLowerCase()}`;

    await this.prisma.verificationToken.deleteMany({ where: { identifier } });
    await this.prisma.verificationToken.create({
      data: { identifier, token, expires: expiresAt },
    });

    return raw;
  }

  async consume(rawToken: string): Promise<string | null> {
    const token = hashToken(rawToken);
    const row = await this.prisma.verificationToken.findUnique({ where: { token } });
    if (!row || !row.identifier.startsWith(INVITE_PREFIX)) {
      return null;
    }
    if (row.expires.getTime() < Date.now()) {
      await this.prisma.verificationToken.delete({
        where: { identifier_token: { identifier: row.identifier, token: row.token } },
      });
      return null;
    }

    await this.prisma.verificationToken.delete({
      where: { identifier_token: { identifier: row.identifier, token: row.token } },
    });

    return row.identifier.slice(INVITE_PREFIX.length);
  }
}
