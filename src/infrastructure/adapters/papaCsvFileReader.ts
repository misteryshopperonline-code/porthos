import type { FileReaderPort, FileRowData } from '@/application/ports/fileReaderPort';
import Papa from 'papaparse';

export class PapaCsvFileReader implements FileReaderPort {
  async parse(fileBuffer: Buffer, _fileName: string): Promise<FileRowData[]> {
    const text = fileBuffer.toString('utf8');
    const result = Papa.parse<FileRowData>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      throw new Error(result.errors[0]?.message || 'No se pudo leer el CSV.');
    }

    return result.data;
  }
}
