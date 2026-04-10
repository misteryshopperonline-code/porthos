import RegistroDeudorClient from './client-form';

export const metadata = {
  title: 'Registro de Deudores | Porthos'
};

export default function DeudoresPage() {
  return (
    <div className="w-full animate-fade-in relative z-10 w-full flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Gestión Operativa de <span className="text-gradient">Cartera</span>
        </h1>
      </header>
      
      <RegistroDeudorClient />
    </div>
  );
}
