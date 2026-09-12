import { redirect } from 'next/navigation';
import ContractPdfUploadForm from '@/app/(app)/contratos/ContractPdfUploadForm';
import { listContractDocumentsForActorUseCase } from '@/composition/container';
import { aiPdfProviderLabel } from '@/infrastructure/adapters/createAiPdfParser';
import { fileStorageProviderLabel } from '@/infrastructure/adapters/createFileStorage';
import { getAppSession } from '@/lib/session';
import type { ContractConditions } from '@/core/entities/contractConditions';

function formatConditions(conditions: ContractConditions | null) {
  if (!conditions) return 'Sin análisis';
  const bits: string[] = [];
  if (conditions.interestRate != null) bits.push(`interés ${conditions.interestRate}%`);
  if (conditions.lateFee != null) bits.push(`mora $${conditions.lateFee}`);
  if (conditions.amount != null) bits.push(`monto $${conditions.amount}`);
  if (conditions.dueDate) bits.push(`vence ${conditions.dueDate}`);
  if (conditions.parties?.length) bits.push(`partes: ${conditions.parties.join(', ')}`);
  if (conditions.summary && bits.length === 0) return conditions.summary;
  if (conditions.summary) bits.push(conditions.summary);
  return bits.join(' · ') || 'Sin campos detectados';
}

export default async function ContratosPage() {
  const actor = await getAppSession();
  if (!actor) {
    redirect('/login');
  }

  const result = await listContractDocumentsForActorUseCase.execute(actor);
  if (!result.success) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-red-600 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  const provider = aiPdfProviderLabel();
  const storage = fileStorageProviderLabel();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative z-10 w-full space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Contratos <span className="text-gradient">PDF-IA</span>
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-gray-400 text-lg">
          Sube el PDF del contrato y extrae condiciones clave para cobranza.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-gray-500">
          Parser: <span className="font-mono">{provider}</span>
          {provider === 'heuristic'
            ? ' (configura OPENAI_API_KEY para análisis con modelo)'
            : ''}
          {' · '}
          Storage: <span className="font-mono">{storage}</span>
          {storage === 'local'
            ? ' (configura BLOB_READ_WRITE_TOKEN para Vercel Blob)'
            : ''}
        </p>
      </header>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Analizar PDF
        </h2>
        <ContractPdfUploadForm
          contracts={result.items.map((c) => ({
            id: c.id,
            contractCode: c.contractCode,
          }))}
        />
      </section>

      <section className="glass-panel rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-dark-border">
          <thead className="bg-zinc-100 dark:bg-[#1e293b]/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Documento
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Condiciones
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Creado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-dark-border">
            {result.items.length > 0 ? (
              result.items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm font-medium">{item.contractCode}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.documentUrl ? (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-zinc-400 italic">Sin PDF</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-gray-400 max-w-xl">
                    {formatConditions(item.conditions)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {item.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">
                  No hay contratos en tu alcance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
