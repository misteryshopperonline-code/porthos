import prisma from "@/lib/prisma";
import PortfolioManager from "./PortfolioManager";

export default async function DeudoresPage() {
  const contracts = await prisma.contract.findMany({
    select: { id: true, contractCode: true },
    orderBy: { createdAt: 'desc' }
  });

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
