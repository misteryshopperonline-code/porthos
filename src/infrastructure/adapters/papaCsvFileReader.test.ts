import { describe, expect, it } from 'vitest';
import { PapaCsvFileReader } from '@/infrastructure/adapters/papaCsvFileReader';

describe('PapaCsvFileReader', () => {
  it('parsea cabeceras a objetos', async () => {
    const reader = new PapaCsvFileReader();
    const csv = 'identification,firstName,lastName,amount\n1,Ana,Ruiz,10\n';
    const rows = await reader.parse(Buffer.from(csv), 'deudores.csv');
    expect(rows).toEqual([
      { identification: '1', firstName: 'Ana', lastName: 'Ruiz', amount: '10' },
    ]);
  });
});
