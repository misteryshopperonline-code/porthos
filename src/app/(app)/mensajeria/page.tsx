import { redirect } from 'next/navigation';
import SendDebtReminderButton from '@/app/(app)/components/SendDebtReminderButton';
import {
  getDashboardUseCase,
  listCommunicationsForActorUseCase,
} from '@/composition/container';
import { messagingProviderLabel } from '@/infrastructure/adapters/createMessagingAdapter';
import { getAppSession } from '@/lib/session';

function formatUsd(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default async function MensajeriaPage() {
  const actor = await getAppSession();
  if (!actor) {
    redirect('/login');
  }

  const [result, dashboard] = await Promise.all([
    listCommunicationsForActorUseCase.execute(actor),
    getDashboardUseCase.execute(actor),
  ]);

  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  const openDebts =
    dashboard.success
      ? dashboard.snapshot.recentDebts.filter((d) => d.status !== 'PAID')
      : [];
  const provider = messagingProviderLabel();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative z-10 w-full space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Centro de <span className="text-gradient">Mensajería</span>
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
          Comunicaciones enviadas en tu alcance de contrato.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-gray-500">
          Proveedor email: <span className="font-mono">{provider}</span>
          {provider === 'console' ? ' (configura RESEND_API_KEY para envío real)' : ''}
        </p>
      </header>

      {openDebts.length > 0 && (
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Enviar recordatorio
          </h2>
          <ul className="divide-y divide-zinc-200 dark:divide-dark-border">
            {openDebts.map((debt) => (
              <li
                key={debt.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                    {debt.debtorName}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">
                    {formatUsd(debt.amount)} · {debt.status}
                  </p>
                </div>
                <SendDebtReminderButton debtId={debt.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-dark-border">
          <thead className="bg-zinc-100 dark:bg-[#1e293b]/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Canal</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Deudor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Monto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Contenido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-dark-border">
            {result.items.length > 0 ? (
              result.items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {item.sentAt.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{item.type}</td>
                  <td className="px-6 py-4 text-sm">{item.status}</td>
                  <td className="px-6 py-4 text-sm">{item.debtorName}</td>
                  <td className="px-6 py-4 text-sm font-mono">{formatUsd(item.amount)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-gray-400 max-w-md truncate">
                    {item.content}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">
                  No hay comunicaciones registradas en tu alcance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
