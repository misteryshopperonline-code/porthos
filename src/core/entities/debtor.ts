export interface Debtor {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}
