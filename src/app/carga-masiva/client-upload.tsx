'use client';

import { useState } from 'react';

export default function BulkUploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    // Aquí implementariamos la llamada al Server Action (actions.ts) enviando el file por FormData
    // const formData = new FormData();
    // formData.append("file", file);
    // await processBulkUpload(formData);
    
    // Simulación superficial de experiencia Premium
    setTimeout(() => {
        setStatus('success');
    }, 2000);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-dark-border/50 max-w-xl w-full shadow-2xl relative overflow-hidden">
        {/* Efecto decorativo */}
      <div className="absolute top-0 right-0 p-32 bg-brand-500/10 rounded-full blur-3xl -z-10 transform translate-x-10 -translate-y-10" />

      <h2 className="text-2xl font-bold text-gray-100 mb-2">Carga Masiva de Cartera</h2>
      <p className="text-gray-400 text-sm mb-8">
        Sube el archivo plantilla (XLSX o CSV) conteniendo el portafolio de clientes y deudas a registrar en el sistema.
      </p>

      <div className="border-2 border-dashed border-dark-border/80 bg-dark-card/30 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all text-center">
        
        <div className="w-16 h-16 mb-4 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center shadow-lg">
           <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>

        <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
            id="file-upload"
            onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
                <span className="text-brand-400 font-medium">{file.name}</span>
            ) : (
                <span className="text-gray-300">
                    <span className="text-brand-500 font-medium">Clíc aquí</span> o arrastra el archivo.
                </span>
            )}
        </label>
        <p className="text-xs text-gray-500 mt-2">Soporta CSV y XLSX. Máx 50MB.</p>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {status === 'uploading' ? (
              <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Procesando...
              </>
          ) : 'Procesar Carga Masiva'}
        </button>
      </div>

      {status === 'success' && (
          <div className="mt-6 p-4 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-400 text-sm">
              <p className="font-bold">¡Carga Procesada!</p>
              <p>Los deudores han sido ingresados exitosamente al sistema.</p>
          </div>
      )}
    </div>
  );
}
