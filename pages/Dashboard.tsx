import React, { useEffect, useState } from 'react';
import { BankAccount, StockHolding, Transaction, User } from '../types';
import { generateFinancialAdvice } from '../services/geminiService';
import { Sparkles, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  accounts: BankAccount[];
  transactions: Transaction[];
  investments: StockHolding[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, accounts, transactions, investments }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Calculations
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const netWorth = totalBalance + totalInvestmentValue;
  
  const currentMonth = new Date().getMonth();
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const getAdvice = async () => {
    setLoadingAdvice(true);
    const result = await generateFinancialAdvice(transactions);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  // Simple Chart Data
  const chartData = [
    { name: '收入', amount: monthlyIncome, fill: '#10b981' },
    { name: '支出', amount: monthlyExpense, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">早安, {user.username} 👋</h2>
          <p className="text-slate-500">這裡是您的財務概況</p>
        </div>
        <button 
          onClick={getAdvice}
          disabled={loadingAdvice}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Sparkles size={18} />
          <span>{loadingAdvice ? 'AI 分析中...' : 'AI 財務建議'}</span>
        </button>
      </header>

      {/* AI Advice Section */}
      {advice && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
          <h3 className="flex items-center space-x-2 text-indigo-800 font-bold mb-3">
            <Sparkles size={20} className="text-indigo-600" />
            <span>Gemini 財務分析</span>
          </h3>
          <div className="text-indigo-900 leading-relaxed whitespace-pre-line text-sm">
            {advice}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">總資產淨值</p>
              <h3 className="text-3xl font-bold text-slate-800">${netWorth.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
             <span className="text-slate-400">含銀行存款與股票現值</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">本月收入</p>
              <h3 className="text-3xl font-bold text-emerald-600">+${monthlyIncome.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">本月支出</p>
              <h3 className="text-3xl font-bold text-red-500">-${monthlyExpense.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-500">
              <ArrowDownRight size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">近期交易紀錄</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{t.category}</p>
                    <p className="text-xs text-slate-500">{t.date} • {t.note}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
                <div className="p-8 text-center text-slate-400">尚無交易紀錄</div>
            )}
          </div>
        </div>

        {/* Quick Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6">本月收支對比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
