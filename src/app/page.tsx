import prisma from "@/lib/prisma";

export default async function Home() {
  const totalCommunications = await prisma.communication.count();
  const rawSum = await prisma.debt.aggregate({ _sum: { amount: true } });
  const totalRecovered = rawSum._sum.amount ? rawSum._sum.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00';
  const totalContracts = await prisma.contract.count();

  const recentDebts = await prisma.debt.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      debtor: true,
      communications: {
        orderBy: { sentAt: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative z-10">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Bienvenido a <span className="text-gradient">Porthos</span>
        </h1>
        <p className="mt-2 text-gray-400 text-lg">
          Vista general de la recuperación de cartera y campañas activas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        {/* Metricas Premium */}
        <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Campaña Activa</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-white">{totalCommunications}</p>
            <p className="ml-2 text-sm text-brand-500 font-medium">Enviados</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border/50 text-xs text-gray-500">
            Comunicaciones y avisos preventivos
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total de Deuda</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-white">{totalRecovered}</p>
            <p className="ml-2 text-sm text-brand-500 font-medium">Global</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border/50 text-xs text-gray-500">
            Impacto en cartera general
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Acuerdos Vía IA</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-white">{totalContracts}</p>
            <p className="ml-2 text-sm text-gray-400 font-medium">Contratos</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border/50 text-xs text-gray-500">
            Revisados con el modelo de lectura PDF
          </div>
        </div>
      </div>

      <section className="mt-12 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
          <span className="w-2 h-6 bg-brand-500 rounded-full mr-3"></span> Actividad Reciente
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden border border-dark-border/50 shadow-2xl">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-[#1e293b]/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Última Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {recentDebts.length > 0 ? recentDebts.map((debt) => {
                const latestComm = debt.communications[0];
                return (
                  <tr key={debt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-200">
                      {debt.debtor.firstName} {debt.debtor.lastName}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        debt.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' :
                        debt.status === 'DEFAULTED' ? 'bg-red-500/20 text-red-500 border-red-500/20' :
                        'bg-brand-500/20 text-brand-400 border-brand-500/20'
                      }`}>
                        {debt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                      ${debt.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                      {latestComm ? (
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${latestComm.status === 'SENT' || latestComm.status === 'DELIVERED' ? 'bg-green-500 shadow-sm' : 'bg-blue-500'}`}></span>
                          {latestComm.type} - {latestComm.status}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No contactado</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
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
