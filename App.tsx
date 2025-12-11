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
import { Wallet, Loader2, Mail, Lock, User as UserIcon, LogIn, ArrowRight, AlertTriangle, Info, WifiOff, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
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
    // Check if Firebase is available. If not, switch to Demo Mode.
    if (!auth) {
      console.log("Firebase not configured. Switching to Demo/Offline Mode.");
      setIsDemoMode(true);
      checkLocalSession();
      setIsLoading(false);
      return;
    }

    // Firebase is available, listen for auth state
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
        // If no firebase user, check if we were previously in forced demo mode (unlikely mixed usage, but good for safety)
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

  const checkLocalSession = () => {
    const demoUserJson = localStorage.getItem('fintrack_demo_user');
    if (demoUserJson) {
      const demoUser = JSON.parse(demoUserJson);
      setUser(demoUser);
      handleLoadData(demoUser.id);
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.LOGIN);
    }
  };

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

  // Persistence effect
  useEffect(() => {
    if (user && !isLoading) {
      const timer = setTimeout(() => {
        saveData(user.id, { accounts, transactions, investments });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [accounts, transactions, investments, user, isLoading]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!username) throw new Error("請輸入使用者名稱");
        await registerWithEmail(email, password, username);
      } else {
        await loginWithEmail(email, password);
      }
      
      // If in Demo Mode (automatically detected), manually trigger state update
      if (isDemoMode) {
          const stored = localStorage.getItem('fintrack_demo_user');
          if (stored) {
              const u = JSON.parse(stored);
              setUser(u);
              await handleLoadData(u.id);
              setCurrentView(AppView.DASHBOARD);
          }
      }

    } catch (error: any) {
      console.error("Auth Error:", error);
      let msg = "發生錯誤，請稍後再試";
      
      if (error.code) {
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
                msg = "系統未啟用登入功能。請聯繫管理員或使用離線模式。";
                break;
            case 'auth/invalid-api-key':
                msg = "系統設定錯誤 (API Key 無效)。請使用離線模式。";
                break;
            case 'auth/network-request-failed':
                msg = "網路連線失敗，請檢查您的網路連線。";
                break;
        }
      }
      
      if (error.message === "請輸入使用者名稱") msg = error.message;
      setAuthError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleManualDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        setIsDemoMode(true);
        const demoUser: User = { 
            id: 'demo-guest', 
            username: '訪客 Guest', 
            email: 'guest@example.com' 
        };
        localStorage.setItem('fintrack_demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        handleLoadData(demoUser.id);
        setCurrentView(AppView.DASHBOARD);
        setIsLoading(false);
    }, 800);
  };

  const handleLogout = async () => {
    await logoutUser();
    // Clear user state
    setUser(null);
    setCurrentView(AppView.LOGIN);
    
    // If we were in manual demo mode, we stay in 'demo capable' mode but return to login screen
    // We don't necessarily reset isDemoMode to false unless we want to retry firebase
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
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in relative overflow-hidden">
          
          {isDemoMode && (
              <div className="absolute top-0 left-0 w-full bg-amber-100 text-amber-800 text-xs py-1 px-4 text-center font-medium flex justify-center items-center gap-2">
                  <WifiOff size={12} />
                  <span>離線體驗模式 (資料僅儲存於本機)</span>
              </div>
          )}

          <div className="flex justify-center mb-6 mt-4">
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
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg flex items-start gap-2 animate-pulse">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                    <span>{authError}</span>
                </div>
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
          
          <div className="mt-6 flex flex-col items-center space-y-4">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
              }}
              className="text-sm text-slate-500 hover:text-emerald-600 underline underline-offset-4"
            >
              {isRegistering ? '已有帳號？返回登入' : '還沒有帳號？立即註冊'}
            </button>

            {!isDemoMode && (
                <button 
                onClick={handleManualDemoLogin}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                >
                <WifiOff size={12} />
                <span>無法登入？使用離線體驗模式 (Skip Login)</span>
                </button>
            )}
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
          {isDemoMode && (
             <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
                <WifiOff size={16} />
                <span>目前為離線體驗模式，資料僅儲存於您的瀏覽器中。若需雲端同步，請檢查 Firebase 設定。</span>
             </div>
          )}
          
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