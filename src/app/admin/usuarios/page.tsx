import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RolesDashboard from "./RolesDashboard";

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const adminContractId = (session.user as any).contractId;

  if (role === 'OPERATOR') {
    redirect('/'); // Denegar acceso
  }

  // Carga de Usuarios basada en Roles
  let users: any[] = [];
  if (role === 'GLOBAL_ADMIN') {
    users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, contractId: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  } else if (role === 'CONTRACT_ADMIN' && adminContractId) {
    users = await prisma.user.findMany({
      where: { contractId: adminContractId },
      select: { id: true, email: true, name: true, role: true, contractId: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Cargar contratos activos para el selector UI (sólo para Global, los demás se auto-asignan)
  const allContracts = role === 'GLOBAL_ADMIN' 
    ? await prisma.contract.findMany({ select: { id: true, contractCode: true } })
    : [];

  return (
    <div className="max-w-7xl mx-auto relative z-10 w-full animate-fade-in">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Tablero de <span className="text-gradient">Usuarios</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
            {role === 'GLOBAL_ADMIN' ? 'Control de Accesos Global y Asignación de Roles.' : 'Gestión de sus operadores autorizados.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-500 rounded-lg text-sm font-semibold tracking-widest uppercase border border-brand-500/20">
          Usted es: {role.replace('_', ' ')}
        </div>
      </header>

      <RolesDashboard 
        users={users} 
        contracts={allContracts} 
        currentUserRole={role} 
        currentContractId={adminContractId} 
      />
    </div>
  );
}
