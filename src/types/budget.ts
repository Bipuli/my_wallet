

export interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  user_id: number;
  category_id: number;
  created_at?: string;
  updated_at?: string;
}


export interface BudgetInput {
  amount: number;
  month: number;
  year: number;
  user_id: number;
  category_id: number;
}

export interface BudgetWithCategory extends Budget {
  categoryName: string;
  spent?: number;
}