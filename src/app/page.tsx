export default function Home() {
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
            <p className="text-4xl font-black text-white">1,432</p>
            <p className="ml-2 text-sm text-brand-500 font-medium">Enviados hoy</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border/50 text-xs text-gray-500">
            Mensajes Preventivos y de Concientización
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Recuperación Educativa</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-white">$84k</p>
            <p className="ml-2 text-sm text-brand-500 font-medium">+12% vs mes anterior</p>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border/50 text-xs text-gray-500">
            Impacto en cartera vencida
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-t border-l border-white/10 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Acuerdos Vía IA</h3>
          <div className="mt-3 flex items-baseline">
            <p className="text-4xl font-black text-white">342</p>
            <p className="ml-2 text-sm text-gray-400 font-medium">Contratos procesados</p>
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
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Deuda</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-200">Juan Pérez</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/20">
                    Acuerdo Activo
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">$1,200.00</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    WhatsApp Edu. Enviado
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-200">María Gómez</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                    Aviso Preventivo
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">$450.00</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    Email Enviado
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
