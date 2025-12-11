import React, { useState } from 'react';
import { BankAccount, Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Search, Filter } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts, setTransactions, setAccounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense',
    category: CATEGORIES.expense[0],
    accountId: accounts[0]?.id || '',
    note: ''
  });

  const handleAdd = () => {
    if (!newTx.amount || !newTx.accountId) return;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      userId: 'u1',
      date: newTx.date!,
      amount: Number(newTx.amount),
      type: newTx.type as TransactionType,
      category: newTx.category!,
      accountId: newTx.accountId!,
      note: newTx.note || ''
    };

    // Update Transaction List
    setTransactions([transaction, ...transactions]);

    // Update Account Balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === transaction.accountId) {
        return {
          ...acc,
          balance: transaction.type === 'income' 
            ? acc.balance + transaction.amount 
            : acc.balance - transaction.amount
        };
      }
      return acc;
    }));

    setIsModalOpen(false);
    // Reset minimal fields
    setNewTx(prev => ({
        ...prev,
        amount: 0,
        note: ''
    }));
  };

  const filteredTransactions = transactions.filter(t => 
    filterType === 'all' ? true : t.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">財務紀錄</h2>
        <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full appearance-none pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
                >
                    <option value="all">所有類別</option>
                    <option value="income">收入</option>
                    <option value="expense">支出</option>
                </select>
                <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
            >
                <Plus size={18} />
                <span className="hidden sm:inline">記一筆</span>
                <span className="sm:hidden">新增</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <tr>
                <th className="p-4 font-medium">日期</th>
                <th className="p-4 font-medium">類別</th>
                <th className="p-4 font-medium">備註</th>
                <th className="p-4 font-medium">帳戶</th>
                <th className="p-4 font-medium text-right">金額</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 whitespace-nowrap">{t.date}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {t.category}
                        </span>
                    </td>
                    <td className="p-4 text-slate-800">{t.note}</td>
                    <td className="p-4 text-slate-500 text-sm">
                        {accounts.find(a => a.id === t.accountId)?.name || '未知帳戶'}
                    </td>
                    <td className={`p-4 text-right font-bold font-mono ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-400">沒有符合條件的紀錄</div>
            )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">新增交易紀錄</h3>
            
            <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                <button 
                    onClick={() => setNewTx({...newTx, type: 'expense', category: CATEGORIES.expense[0]})}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${newTx.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
                >
                    支出
                </button>
                <button 
                    onClick={() => setNewTx({...newTx, type: 'income', category: CATEGORIES.income[0]})}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${newTx.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                >
                    收入
                </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                    <input 
                        type="date" 
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={newTx.date}
                        onChange={e => setNewTx({...newTx, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">金額</label>
                    <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-right"
                        value={newTx.amount}
                        onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
                        placeholder="0"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
                <select 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newTx.category}
                    onChange={e => setNewTx({...newTx, category: e.target.value})}
                >
                    {(newTx.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">支付帳戶</label>
                <select 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newTx.accountId}
                    onChange={e => setNewTx({...newTx, accountId: e.target.value})}
                >
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newTx.note}
                  onChange={e => setNewTx({...newTx, note: e.target.value})}
                  placeholder="輸入備註事項..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
