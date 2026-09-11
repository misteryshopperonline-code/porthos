'use client';

import { useActionState, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { bulkUploadDebtorsAction, createDebtorAction } from './actions';
import type { ActionState } from '@/application/types/actionState';

type ContractData = { id: string; contractCode: string };

const initialState: ActionState = {};

export default function PortfolioManager({ contracts }: { contracts: ContractData[] }) {
  const [activeTab, setActiveTab] = useState<'individual' | 'masiva'>('individual');
  const [contractId, setContractId] = useState(contracts[0]?.id || '');
  const [createState, createAction, createPending] = useActionState(createDebtorAction, initialState);
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkUploadDebtorsAction, initialState);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxSize: 5 * 1024 * 1024,
    disabled: bulkPending || !contractId,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const formData = new FormData();
      formData.set('contractId', contractId);
      formData.set('file', file);
      bulkAction(formData);
    },
  });

  return (
    <div className="glass-panel p-8 rounded-2xl">
      <div className="border-b border-zinc-200 dark:border-white/10 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'individual' ? 'border-brand-500 text-brand-600 dark:text-brand-500' : 'border-transparent text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-300 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
          >
            Registro Individual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('masiva')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'masiva' ? 'border-brand-500 text-brand-600 dark:text-brand-500' : 'border-transparent text-zinc-500 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-300 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
          >
            Carga Masiva (CSV)
          </button>
        </nav>
      </div>

      <div className="mb-8 max-w-sm">
        <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Asignar Operación al Contrato:</label>
        <select
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-gray-200 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 outline-none shadow-sm cursor-pointer"
        >
          {contracts.length === 0 && <option value="">No hay contratos</option>}
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>{c.contractCode}</option>
          ))}
        </select>
      </div>

      {activeTab === 'individual' && (
        <form action={createAction} className="space-y-6 max-w-2xl animate-fade-in">
          <input type="hidden" name="contractId" value={contractId} />
          {createState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{createState.error}</p>
          )}
          {createState.success && (
            <p className="text-sm text-brand-600 dark:text-brand-400">{createState.message}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Identificación (ID)</label>
              <input name="identification" required type="text" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Monto de la deuda ($)</label>
              <input name="amount" required type="number" step="0.01" min="0.01" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Nombres</label>
              <input name="firstName" required type="text" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Apellidos</label>
              <input name="lastName" required type="text" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Correo</label>
              <input name="email" type="email" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Teléfono</label>
              <input name="phone" type="tel" className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <button
            type="submit"
            disabled={createPending || !contractId}
            className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors shadow-sm disabled:opacity-50"
          >
            {createPending ? 'Registrando...' : 'Añadir a Cartera'}
          </button>
        </form>
      )}

      {activeTab === 'masiva' && (
        <div className="animate-fade-in max-w-2xl">
          {bulkState.error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{bulkState.error}</p>
          )}
          {bulkState.success && (
            <p className="mb-4 text-sm text-brand-600 dark:text-brand-400">{bulkState.message}</p>
          )}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-zinc-900/50'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-sm text-zinc-600 dark:text-gray-300">
                <span className="font-semibold">Haz clic para subir un archivo .csv</span> o arrástralo y suéltalo aquí
              </p>
              <p className="text-xs text-zinc-500 dark:text-gray-500 mt-2 max-w-sm">
                Columnas: identification, firstName, lastName, amount, email, phone, dueDate. Máximo 5MB.
              </p>
              {bulkPending && <p className="text-sm text-brand-600">Procesando...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
