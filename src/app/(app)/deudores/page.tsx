import { redirect } from 'next/navigation';
import PortfolioManager from '@/components/PortfolioManager';
import { listVisibleContractsUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

export default async function DeudoresPage() {
  const actor = await getAppSession();
  if (!actor) {
    redirect('/login');
  }

  const contracts = await listVisibleContractsUseCase.execute(actor);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative z-10 w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Gestión de <span className="text-gradient">Portafolio</span>
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
          Registro individual y masivo de operaciones para la plataforma.
        </p>
      </header>

      <PortfolioManager contracts={contracts} />
    </div>
  );
}
