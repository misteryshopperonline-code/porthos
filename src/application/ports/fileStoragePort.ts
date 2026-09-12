export type StoreFileInput = {
  bytes: Buffer;
  filename: string;
  contentType: string;
};

export type StoredFile = {
  url: string;
  key: string;
};

export interface FileStoragePort {
  store(input: StoreFileInput): Promise<StoredFile>;
}
