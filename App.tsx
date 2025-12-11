import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Reports from './pages/Reports';
import { AppView, BankAccount, StockHolding, Transaction, User } from './types';
import { loadData, saveData, loginWithEmail, registerWithEmail, logoutUser } from './services/storageService';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { Wallet, Loader2, Mail, Lock, User as UserIcon, LogIn, ArrowRight, AlertTriangle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  
  // Login/Register Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Data State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<StockHolding[]>([]);

  // Auth Listener
  useEffect(() => {
    // If auth failed to init in firebaseConfig.ts, it will be undefined here.
    if (!auth) {
      console.error("Firebase Auth not initialized.");
      setConfigError(true);
      setIsLoading(false);
      return;
    }

    // Firebase Modular SDK auth listener
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
      // Don't block UI on load error, just show empty or default state
    }
  };

  // Persistence effect (Save to Firebase when state changes)
  useEffect(() => {
    if (user && !isLoading && !configError) {
      const timer = setTimeout(() => {
        saveData(user.id, { accounts, transactions, investments });
      }, 1000); // 1 second debounce
      return () => clearTimeout(timer);
    }
  }, [accounts, transactions, investments, user, isLoading, configError]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (configError || !auth) {
        setAuthError("系統設定錯誤：無法連接到認證服務");
        setIsLoading(false);
        return;
    }

    try {
      if (isRegistering) {
        if (!username) throw new Error("請輸入使用者名稱");
        await registerWithEmail(email, password, username);
      } else {
        await loginWithEmail(email, password);
      }
      // Successful login/register will trigger onAuthStateChanged
    } catch (error: any) {
      console.error("Auth Error:", error);
      let msg = "發生錯誤，請稍後再試";
      
      // Map Firebase Error Codes to User-Friendly Messages
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          msg = "帳號或密碼錯誤";
          break;
        case 'auth/email-already-in-use':
          msg = "此 Email 已被註冊";
          break;
        case 'auth/weak-password':
          msg = "密碼強度不足 (至少 6 位)";
          break;
        case 'auth/invalid-email':
          msg = "Email 格式不正確";
          break;
        case 'auth/operation-not-allowed':
          msg = "系統未啟用 Email/密碼登入功能 (請至 Firebase Console 開啟)";
          break;
        case 'auth/network-request-failed':
          msg = "網路連線失敗，請檢查您的網路";
          break;
        case 'auth/too-many-requests':
          msg = "嘗試次數過多，請稍後再試";
          break;
      }
      
      if (error.message === "請輸入使用者名稱") msg = error.message;
      if (error.message.includes("Auth 尚未初始化")) msg = "系統初始化失敗，請檢查 API Key";

      setAuthError(msg);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) await logoutUser();
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

  // Config Error Screen
  if (configError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">系統設定錯誤</h2>
          <p className="text-slate-600 mb-6">
            無法連接至 Firebase 服務。請確認環境變數 (API Key) 是否已正確設定。
          </p>
          <div className="text-xs text-slate-400 bg-slate-100 p-4 rounded text-left overflow-auto">
             Tips: Check .env file or CI secrets for VITE_FIREBASE_API_KEY.
          </div>
        </div>
      </div>
    );
  }

  // Login View
  if (!user || currentView === AppView.LOGIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-100 rounded-full">
              <Wallet size={40} className="text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">FinTrack AI</h1>
          <p className="text-center text-slate-500 mb-8">
            {isRegistering ? '註冊新帳號' : '登入您的帳戶'}
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="使用者名稱"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isRegistering}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email"
                placeholder="電子郵件"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password"
                placeholder="密碼"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg flex items-start gap-2">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/20"
            >
              {isRegistering ? (
                <><span>立即註冊</span><ArrowRight size={18}/></>
              ) : (
                <><span>登入系統</span><LogIn size={18}/></>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
              }}
              className="text-sm text-slate-500 hover:text-emerald-600 underline underline-offset-4"
            >
              {isRegistering ? '已有帳號？返回登入' : '還沒有帳號？立即註冊'}
            </button>
          </div>
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