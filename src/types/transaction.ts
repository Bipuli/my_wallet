export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;

  user_id: number;
  category_id: number;

  category?: {
    id: number;
    name: string;
  };

  created_at?: string;
  updated_at?: string;
}