import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Reports from './pages/Reports';
import { AppView, BankAccount, StockHolding, Transaction, User } from './types';
import { loadData, saveData, loginWithGoogle, logoutUser } from './services/storageService';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Wallet, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<StockHolding[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const mappedUser: User = {
          id: fbUser.uid,
          username: fbUser.displayName || 'User',
          email: fbUser.email || ''
        };
        setUser(mappedUser);
        await handleLoadData(mappedUser.id);
        setCurrentView(AppView.DASHBOARD);
      } else {
        setUser(null);
        setCurrentView(AppView.LOGIN);
        setAccounts([]);
        setTransactions([]);
        setInvestments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoadData = async (userId: string) => {
    try {
      const data = await loadData(userId);
      setAccounts(data.accounts);
      setTransactions(data.transactions);
      setInvestments(data.investments);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  // Persistence effect (Save to Firebase when state changes)
  // Debounce could be added here for optimization, but kept simple for now
  useEffect(() => {
    if (user && !isLoading) {
      const timer = setTimeout(() => {
        saveData(user.id, { accounts, transactions, investments });
      }, 1000); // 1 second debounce
      return () => clearTimeout(timer);
    }
  }, [accounts, transactions, investments, user, isLoading]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      // Auth listener will handle the rest
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={48} className="text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">資料同步中...</p>
        </div>
      </div>
    );
  }

  // Login View
  if (!user || currentView === AppView.LOGIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-100 rounded-full">
              <Wallet size={40} className="text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">FinTrack AI</h1>
          <p className="text-slate-500 mb-8">雲端同步的智慧個人財務管家</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            <span>使用 Google 帳號登入</span>
          </button>
          
          <p className="mt-6 text-xs text-slate-400">
            資料將安全地儲存於 Google Firebase 雲端資料庫。<br/>
            AI 財務建議功能由 Gemini 提供。
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Layout
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              user={user} 
              accounts={accounts} 
              transactions={transactions} 
              investments={investments} 
            />
          )}
          {currentView === AppView.ACCOUNTS && (
            <Accounts accounts={accounts} setAccounts={setAccounts} />
          )}
          {currentView === AppView.TRANSACTIONS && (
            <Transactions 
              transactions={transactions} 
              accounts={accounts} 
              setTransactions={setTransactions} 
              setAccounts={setAccounts} 
            />
          )}
          {currentView === AppView.INVESTMENTS && (
            <Investments 
              investments={investments} 
              setInvestments={setInvestments} 
            />
          )}
          {currentView === AppView.REPORTS && (
            <Reports transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
