'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type ContractData = {
  id: string;
  contractCode: string;
};

export default function ContractSelector({ contracts }: { contracts: ContractData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentContractId = searchParams.get('contractId') || 'all';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      
      if (selectedId === 'all') {
        params.delete('contractId');
      } else {
        params.set('contractId', selectedId);
      }
      
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  if (!contracts || contracts.length === 0) return null;

  return (
    <div className="flex items-center space-x-3 py-2">
      <label htmlFor="contractFilter" className="text-sm font-semibold text-zinc-500 dark:text-gray-400 whitespace-nowrap">
        Portafolio / Contrato:
      </label>
      <select
        id="contractFilter"
        value={currentContractId}
        onChange={handleChange}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-gray-200 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 transition-colors cursor-pointer shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600 outline-none"
      >
        <option value="all">Ver cartera global (Todos)</option>
        {contracts.map((contract) => (
          <option key={contract.id} value={contract.id}>
            Referencia: {contract.contractCode}
          </option>
        ))}
      </select>
    </div>
  );
}
