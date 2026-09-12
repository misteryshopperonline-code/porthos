import type { AiPdfParserPort } from '@/application/ports/aiPdfParserPort';
import { HeuristicPdfParserAdapter } from '@/infrastructure/adapters/heuristicPdfParserAdapter';
import { OpenAiPdfParserAdapter } from '@/infrastructure/adapters/openAiPdfParserAdapter';

export function createAiPdfParser(): AiPdfParserPort {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    return new OpenAiPdfParserAdapter({ apiKey });
  }
  return new HeuristicPdfParserAdapter();
}

export function aiPdfProviderLabel(): string {
  return process.env.OPENAI_API_KEY?.trim() ? 'openai' : 'heuristic';
}
