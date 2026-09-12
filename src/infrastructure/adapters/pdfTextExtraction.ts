/**
 * Extrae texto aproximado de un PDF leyendo literales `(...)` del stream.
 * Suficiente para demos/heurística; OpenAI mejora el resultado con ese texto.
 */
export function extractRoughPdfText(pdfBuffer: Buffer, maxChars = 12_000): string {
  const raw = pdfBuffer.toString('latin1');
  const parts: string[] = [];

  const parenLiterals = raw.match(/\((?:\\.|[^\\)]){2,400}\)/g) ?? [];
  for (const literal of parenLiterals) {
    const inner = literal
      .slice(1, -1)
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    if (/[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]/.test(inner)) {
      parts.push(inner);
    }
  }

  // Fallback: trozos ASCII legibles en el binario
  if (parts.length < 3) {
    const ascii = raw.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ0-9$%.,;:/\-]{4,}/g) ?? [];
    parts.push(...ascii.slice(0, 200));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

export function parseConditionsFromText(text: string): {
  interestRate?: number;
  lateFee?: number;
  amount?: number;
  dueDate?: string;
  parties?: string[];
  summary?: string;
} {
  const conditions: {
    interestRate?: number;
    lateFee?: number;
    amount?: number;
    dueDate?: string;
    parties?: string[];
    summary?: string;
  } = {};

  const interest =
    text.match(/interes(?:t|e)?(?:\s+rate)?[^0-9%]{0,20}(\d+(?:[.,]\d+)?)\s*%/i) ??
    text.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:de\s+)?interes/i);
  if (interest) {
    conditions.interestRate = Number(interest[1]!.replace(',', '.'));
  }

  const lateFee =
    text.match(/(?:mora|late\s*fee|penalizaci[oó]n)[^0-9$]{0,20}\$?\s*(\d+(?:[.,]\d+)?)/i) ??
    text.match(/\$\s*(\d+(?:[.,]\d+)?)\s*(?:de\s+)?mora/i);
  if (lateFee) {
    conditions.lateFee = Number(lateFee[1]!.replace(',', '.'));
  }

  const amount =
    text.match(/(?:monto|principal|capital|amount)[^0-9$]{0,20}\$?\s*(\d+(?:[.,]\d+)?)/i) ??
    text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (amount) {
    conditions.amount = Number(amount[1]!.replace(/,/g, ''));
  }

  const due =
    text.match(
      /(?:vencimiento|due\s*date|fecha\s+l[ií]mite)[^0-9]{0,20}(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    );
  if (due) {
    conditions.dueDate = due[1];
  }

  const partyMatches = [
    ...text.matchAll(/(?:parte|contratante|acredor|deudor|lender|borrower)[:\s]+([A-ZÁÉÍÓÚ][\wÁÉÍÓÚáéíóúñÑ .'-]{2,60})/gi),
  ];
  if (partyMatches.length > 0) {
    conditions.parties = [...new Set(partyMatches.map((m) => m[1]!.trim()))].slice(0, 6);
  }

  if (Object.keys(conditions).length > 0) {
    conditions.summary = `Condiciones extraídas del texto del PDF (${Object.keys(conditions).filter((k) => k !== 'summary').length} campos).`;
  }

  return conditions;
}
