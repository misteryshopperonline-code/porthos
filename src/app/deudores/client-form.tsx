'use client';

import { useState } from 'react';
// import { useFormState } from 'react-dom';  // In Next.js 14+ is typically used, but we'll use a standard onSubmit for better visual feedback control

export default function RegistroDeudorClient() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    
    // Al no tener instalado Next.js localmente, simulo la llamada para evitar bugs de useFormState
    const { createDebtorAction } = await import('./actions');
    const response = await createDebtorAction({}, formData);
    
    if (response?.error) {
      setMessage({ type: 'error', text: response.error });
    } else if (response?.success) {
      setMessage({ type: 'success', text: response.message || 'Exito' });
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="glass-panel p-8 rounded-2xl border border-dark-border/50 max-w-2xl shadow-xl w-full">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center">
          <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center mr-3 text-sm border border-brand-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">1</span>
          Añadir Nuevo Cliente / Deudor
        </h2>
        <p className="text-gray-400 mt-2 text-sm ml-11">
          Ingresa la información básica para registrar este deudor en el sistema de Porthos.
        </p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-brand-500/10 border-brand-500/20 text-brand-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Identificación (DNI/Cédula) *</label>
            <input 
              required
              name="identification" 
              type="text" 
              className="w-full bg-dark-card/50 border border-dark-border rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              placeholder="Ej. 0928374653"
            />
          </div>
          <div className="space-y-2">
             {/* Espacio para alinear si se requiere */}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Nombres *</label>
            <input 
              required
              name="firstName" 
              type="text" 
              className="w-full bg-dark-card/50 border border-dark-border rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              placeholder="Nombres completos"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Apellidos *</label>
            <input 
              required
              name="lastName" 
              type="text" 
              className="w-full bg-dark-card/50 border border-dark-border rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              placeholder="Apellidos completos"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input 
              name="email" 
              type="email" 
              className="w-full bg-dark-card/50 border border-dark-border rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Teléfono (WhatsApp)</label>
            <input 
              name="phone" 
              type="tel" 
              className="w-full bg-dark-card/50 border border-dark-border rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              placeholder="+593 999 999 999"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-dark-border flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrar Deudor'}
          </button>
        </div>
      </form>
    </div>
  );
}
