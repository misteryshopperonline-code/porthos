import { redirect } from 'next/navigation';
import RolesDashboard from './RolesDashboard';
import { listAdminUsersUseCase } from '@/composition/container';
import { getAppSession } from '@/lib/session';

export default async function AdminUsuariosPage() {
  const actor = await getAppSession();
  if (!actor) {
    redirect('/login');
  }

  const result = await listAdminUsersUseCase.execute(actor);
  if (!result.success) {
    redirect('/');
  }

  return (
    <div className="max-w-7xl mx-auto relative z-10 w-full animate-fade-in">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Tablero de <span className="text-gradient">Usuarios</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
            {actor.role === 'GLOBAL_ADMIN' ? 'Control de Accesos Global y Asignación de Roles.' : 'Gestión de sus operadores autorizados.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-500 rounded-lg text-sm font-semibold tracking-widest uppercase border border-brand-500/20">
          Usted es: {actor.role.replace('_', ' ')}
        </div>
      </header>

      <RolesDashboard
        users={result.users}
        contracts={result.contracts}
        currentUserRole={actor.role}
        currentContractId={actor.contractId}
      />
    </div>
  );
}
