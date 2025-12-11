import React, { useState } from 'react';
import { BankAccount } from '../types';
import { Plus, Trash2, Edit2, CreditCard, Landmark, Coins } from 'lucide-react';

interface AccountsProps {
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, setAccounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    name: '',
    type: 'bank',
    balance: 0,
    currency: 'TWD'
  });

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此帳戶嗎？所有相關交易紀錄將會保留，但帳戶將無法選取。')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleAdd = () => {
    if (!newAccount.name) return;
    const account: BankAccount = {
      id: Date.now().toString(),
      userId: 'u1',
      name: newAccount.name,
      type: newAccount.type as 'bank' | 'cash' | 'credit_card' || 'bank',
      balance: Number(newAccount.balance) || 0,
      currency: newAccount.currency || 'TWD'
    };
    setAccounts([...accounts, account]);
    setIsModalOpen(false);
    setNewAccount({ name: '', type: 'bank', balance: 0, currency: 'TWD' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark className="text-blue-500" />;
      case 'credit_card': return <CreditCard className="text-purple-500" />;
      default: return <Coins className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">我的帳戶</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>新增帳戶</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-shadow">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <button onClick={() => handleDelete(acc.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                {getIcon(acc.type)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{acc.name}</h3>
                <p className="text-xs text-slate-500 uppercase">{acc.type.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-slate-400">當前餘額</p>
              <p className={`text-2xl font-bold font-mono ${acc.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                {acc.currency} ${acc.balance.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增帳戶</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶名稱</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="例如：玉山銀行薪轉"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">類型</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newAccount.type}
                  onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
                >
                  <option value="bank">銀行帳戶</option>
                  <option value="cash">現金</option>
                  <option value="credit_card">信用卡</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">初始餘額</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={newAccount.balance}
                  onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})}
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
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                確認新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
