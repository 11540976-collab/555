import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  LogOut 
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: '總覽 Dashboard', icon: LayoutDashboard },
    { view: AppView.ACCOUNTS, label: '銀行帳戶', icon: Wallet },
    { view: AppView.INVESTMENTS, label: '股市投資', icon: TrendingUp },
    { view: AppView.TRANSACTIONS, label: '財務紀錄', icon: CreditCard },
    { view: AppView.REPORTS, label: '收支報表', icon: PieChart },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          FinTrack AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">智慧財務管家</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.view 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>登出系統</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
