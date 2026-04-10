export interface FileRowData {
  [key: string]: any;
}

export interface FileReaderPort {
  /**
   * Lee un archivo buffer (CSV/Excel) y devuelve un arreglo de objetos JSON estructurados
   */
  parse(fileBuffer: Buffer, fileName: string): Promise<FileRowData[]>;
}
