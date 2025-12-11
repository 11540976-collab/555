export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  name: string; // e.g., "CTBC Bank", "Wallet"
  type: 'bank' | 'cash' | 'credit_card';
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
}

export interface StockHolding {
  id: string;
  userId: string;
  symbol: string; // e.g., "2330.TW", "AAPL"
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number; // Updated via Gemini
  lastUpdated: string;
}

export interface FinancialData {
  accounts: BankAccount[];
  transactions: Transaction[];
  investments: StockHolding[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ACCOUNTS = 'ACCOUNTS',
  TRANSACTIONS = 'TRANSACTIONS',
  INVESTMENTS = 'INVESTMENTS',
  REPORTS = 'REPORTS',
  LOGIN = 'LOGIN'
}
