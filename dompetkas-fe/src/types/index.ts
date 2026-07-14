export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Wallet {
    id: number;
    user_id: number;
    name: string;
    balance: number;
    currency: string; //
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: 'income' | 'expense';
    budget_limit: number | null;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    wallet_id: number;
    category_id: number;
    amount: number;
    description: string | null;
    transaction_date: string;
    created_at: string;
    updated_at: string;
    wallet?: Wallet;
    category?: Category;
}