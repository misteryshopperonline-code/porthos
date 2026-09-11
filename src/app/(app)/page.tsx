import { redirect } from 'next/navigation';
import ContractSelector from '@/components/ContractSelector';
import DebtStatusActions from '@/app/(app)/components/DebtStatusActions';
import { getDashboardUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

function formatUsd(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string }>;
}) {
  const actor = await getAppSession();
  if (!actor) {
    redirect('/login');
  }

  const { contractId } = await searchParams;
  const result = await getDashboardUseCase.execute(actor, contractId);

  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  const { snapshot, contracts, canViewAll } = result;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Bienvenido a <span className="text-gradient">Porthos</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
            Vista general de la recuperación de cartera y campañas activas.
          </p>
        </div>
        <div className="md:mb-1">
          <ContractSelector contracts={contracts} allowAll={canViewAll} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-zinc-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Campaña Activa</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-zinc-800 dark:text-white">{snapshot.communicationsSent}</p>
            <p className="ml-2 text-sm text-brand-600 dark:text-brand-500 font-medium">Enviados</p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-dark-border/50 text-xs text-zinc-500 dark:text-gray-500">
            Comunicaciones y avisos preventivos
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-zinc-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Cartera pendiente</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-zinc-800 dark:text-white">{formatUsd(snapshot.outstandingAmount)}</p>
            <p className="ml-2 text-sm text-brand-600 dark:text-brand-500 font-medium">Vigente</p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-dark-border/50 text-xs text-zinc-500 dark:text-gray-500">
            Deudas PENDING y DEFAULTED
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-zinc-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Recuperado</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-zinc-800 dark:text-white">{formatUsd(snapshot.recoveredAmount)}</p>
            <p className="ml-2 text-sm text-zinc-500 dark:text-gray-400 font-medium">{snapshot.linkedDebtCount} deudas</p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-dark-border/50 text-xs text-zinc-500 dark:text-gray-500">
            Montos con estado PAID
          </div>
        </div>
      </div>

      <section className="mt-12 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-100 mb-6 flex items-center">
          <span className="w-2 h-6 bg-brand-500 rounded-full mr-3"></span> Actividad Reciente
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-dark-border">
            <thead className="bg-zinc-100 dark:bg-[#1e293b]/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest">Última Acción</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-dark-border">
              {snapshot.recentDebts.length > 0 ? snapshot.recentDebts.map((debt) => {
                const latestComm = debt.latestCommunication;
                return (
                  <tr key={debt.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-zinc-800 dark:text-gray-200">
                      {debt.debtorName}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        debt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-500 dark:border-yellow-500/20' :
                        debt.status === 'DEFAULTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/20' :
                        'bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:border-brand-500/20'
                      }`}>
                        {debt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-600 dark:text-gray-400 font-mono">
                      {formatUsd(debt.amount)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-600 dark:text-gray-400">
                      {latestComm ? (
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${latestComm.status === 'SENT' || latestComm.status === 'DELIVERED' ? 'bg-green-500 shadow-sm' : 'bg-blue-500'}`}></span>
                          {latestComm.type} - {latestComm.status}
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-gray-500 italic">No contactado</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <DebtStatusActions debtId={debt.id} status={debt.status} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-gray-500">
                    No hay información de deudas registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
