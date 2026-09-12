import { randomUUID } from 'node:crypto';

export function buildContractPdfObjectKey(filename: string): string {
  const safeBase =
    filename
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'contract.pdf';

  const withExt = safeBase.toLowerCase().endsWith('.pdf')
    ? safeBase
    : `${safeBase}.pdf`;

  return `contracts/${randomUUID()}-${withExt}`;
}
