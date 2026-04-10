import BulkUploadClient from './client-upload';

export const metadata = {
  title: 'Carga Masiva | Porthos'
};

export default function BulkUploadPage() {
  return (
    <div className="w-full animate-fade-in relative z-10 w-full flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Integración Masiva <span className="text-gradient">Automática</span>
        </h1>
      </header>
      
      <BulkUploadClient />
    </div>
  );
}
