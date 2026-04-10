'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createUserAction } from './actions';

type UserDisplay = {
  id: string;
  email: string;
  name: string | null;
  role: string | any;
  contractId: string | null;
  createdAt: Date;
};

type ContractOpt = { id: string; contractCode: string };

export default function RolesDashboard({ 
  users, 
  contracts, 
  currentUserRole,
  currentContractId
}: { 
  users: UserDisplay[], 
  contracts: ContractOpt[],
  currentUserRole: string,
  currentContractId: string | null 
}) {
  const [showForm, setShowForm] = useState(false);
  // Next 14 standard server action binding
  const [state, formAction] = useFormState(createUserAction, null);

  const getRoleColor = (role: string) => {
    if (role === 'GLOBAL_ADMIN') return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (role === 'CONTRACT_ADMIN') return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Botonera superior */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
        >
          {showForm ? 'Cancelar Registro' : '+ Registrar Usuario'}
        </button>
      </div>

      {/* Formulario Ocultable */}
      {showForm && (
        <div className="glass-panel p-8 rounded-2xl animate-fade-in border border-brand-500/30">
          <h2 className="text-xl font-bold mb-6 text-zinc-800 dark:text-gray-100">Creación de Nuevo Rol</h2>
          
          {state?.error && (
             <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
               {state.error}
             </div>
          )}
          {state?.success && (
             <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
               {state.message}
             </div>
          )}

          <form action={formAction} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                <input name="name" required type="text" className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Correo Electrónico (Login ID)</label>
                <input name="email" required type="email" className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Asignar Rol</label>
                <select name="role" required className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
                  {currentUserRole === 'GLOBAL_ADMIN' && <option value="GLOBAL_ADMIN">GLOBAL_ADMIN</option>}
                  {currentUserRole === 'GLOBAL_ADMIN' && <option value="CONTRACT_ADMIN">CONTRACT_ADMIN</option>}
                  <option value="OPERATOR">OPERATOR</option>
                </select>
              </div>

               {currentUserRole === 'GLOBAL_ADMIN' ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">Contrato (Opcional para Globales)</label>
                  <select name="contractId" className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-lg p-2.5 w-full outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
                    <option value="">-- Sin Contrato --</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.contractCode}</option>)}
                  </select>
                </div>
               ) : (
                 // Operadores creados por Contract_Admin heredan la bóveda automáticamente
                 <input type="hidden" name="contractId" value={currentContractId || ''} />
               )}
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm px-8 py-2.5 transition-colors">
                Ejecutar Creación  →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-500 dark:text-gray-400">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-100/50 dark:bg-zinc-900/60 dark:text-gray-300 border-b border-zinc-200 dark:border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4">Usuario</th>
                <th scope="col" className="px-6 py-4">Jerarquía (Rol)</th>
                <th scope="col" className="px-6 py-4">Contrato Vinculado</th>
                <th scope="col" className="px-6 py-4">Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="bg-white/50 dark:bg-transparent border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{u.name || 'Sin Nombre'}</span>
                      <span className="text-xs text-zinc-400 font-normal">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(u.role)}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[150px]">
                    {u.contractId ? (contracts.find(cx=>cx.id === u.contractId)?.contractCode || u.contractId) : 'Global / Sin Bóveda'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
             <div className="text-center py-12 text-zinc-500 dark:text-gray-400">No hay usuarios visibles en tu bóveda jerárquica.</div>
          )}
        </div>
      </div>
    </div>
  );
}
