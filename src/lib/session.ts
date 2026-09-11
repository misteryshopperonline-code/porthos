import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { SessionUser } from '@/core/entities/user';

export async function getAppSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? null,
    role: session.user.role,
    contractId: session.user.contractId,
  };
}
