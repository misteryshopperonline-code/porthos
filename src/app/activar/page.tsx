import { Suspense } from 'react';
import ActivarForm from './ActivarForm';

export default function ActivarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-sm text-zinc-500">
          Cargando...
        </div>
      }
    >
      <ActivarForm />
    </Suspense>
  );
}
