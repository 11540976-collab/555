import { BankAccount, StockHolding, Transaction, User } from "./types";

export const CATEGORIES = {
  expense: ['飲食', '交通', '居住', '娛樂', '購物', '醫療', '教育', '其他'],
  income: ['薪資', '獎金', '投資收益', '兼職', '其他']
};

export const INITIAL_USER: User = {
  id: 'u1',
  username: 'DemoUser',
  email: 'demo@example.com'
};

export const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'a1', userId: 'u1', name: '中國信託 - 薪轉戶', type: 'bank', balance: 150000, currency: 'TWD' },
  { id: 'a2', userId: 'u1', name: '現金錢包', type: 'cash', balance: 3500, currency: 'TWD' },
  { id: 'a3', userId: 'u1', name: '國泰世華 - 信用卡', type: 'credit_card', balance: -12000, currency: 'TWD' },
];

export const INITIAL_INVESTMENTS: StockHolding[] = [
  { id: 's1', userId: 'u1', symbol: '2330.TW', name: '台積電', quantity: 1000, averageCost: 550, currentPrice: 550, lastUpdated: new Date().toISOString() },
  { id: 's2', userId: 'u1', symbol: '0050.TW', name: '元大台灣50', quantity: 2000, averageCost: 120, currentPrice: 120, lastUpdated: new Date().toISOString() },
  { id: 's3', userId: 'u1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, averageCost: 150, currentPrice: 150, lastUpdated: new Date().toISOString() },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', userId: 'u1', accountId: 'a1', date: new Date().toISOString().split('T')[0], amount: 50000, type: 'income', category: '薪資', note: '三月薪水' },
  { id: 't2', userId: 'u1', accountId: 'a2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: 120, type: 'expense', category: '飲食', note: '午餐便當' },
  { id: 't3', userId: 'u1', accountId: 'a2', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], amount: 50, type: 'expense', category: '交通', note: '捷運' },
  { id: 't4', userId: 'u1', accountId: 'a3', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], amount: 2500, type: 'expense', category: '購物', note: 'Uniqlo 衣服' },
];
