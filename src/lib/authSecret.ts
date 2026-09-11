export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production');
  }
  return 'porthos-dev-insecure-secret';
}
