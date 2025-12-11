import React, { useState } from 'react';
import { StockHolding } from '../types';
import { fetchStockPrices } from '../services/geminiService';
import { Plus, RefreshCcw, TrendingUp, Trash2 } from 'lucide-react';

interface InvestmentsProps {
  investments: StockHolding[];
  setInvestments: React.Dispatch<React.SetStateAction<StockHolding[]>>;
}

const Investments: React.FC<InvestmentsProps> = ({ investments, setInvestments }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState<Partial<StockHolding>>({
    symbol: '',
    name: '',
    quantity: 0,
    averageCost: 0
  });

  const handleUpdatePrices = async () => {
    setLoading(true);
    const prices = await fetchStockPrices(investments);
    
    if (Object.keys(prices).length > 0) {
      setInvestments(prev => prev.map(inv => ({
        ...inv,
        currentPrice: prices[inv.symbol] || inv.currentPrice,
        lastUpdated: new Date().toISOString()
      })));
    } else {
      alert("無法更新股價。請確認您的 API Key 是否正確。");
    }
    setLoading(false);
  };

  const handleAdd = () => {
    if (!newStock.symbol || !newStock.quantity) return;
    const stock: StockHolding = {
      id: Date.now().toString(),
      userId: 'u1',
      symbol: newStock.symbol.toUpperCase(),
      name: newStock.name || newStock.symbol,
      quantity: Number(newStock.quantity),
      averageCost: Number(newStock.averageCost),
      currentPrice: Number(newStock.averageCost), // Init with cost
      lastUpdated: new Date().toISOString()
    };
    setInvestments([...investments, stock]);
    setIsModalOpen(false);
    setNewStock({ symbol: '', name: '', quantity: 0, averageCost: 0 });
  };

  const handleDelete = (id: string) => {
    if(confirm('確定刪除此持股紀錄？')) {
        setInvestments(prev => prev.filter(i => i.id !== id));
    }
  }

  const totalCost = investments.reduce((sum, i) => sum + (i.averageCost * i.quantity), 0);
  const totalValue = investments.reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">股票投資組合</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleUpdatePrices}
            disabled={loading}
            className={`bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? '更新中...' : '更新即時股價 (AI)'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>新增持股</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">總市值</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">總投入成本</p>
          <h3 className="text-2xl font-bold text-slate-600">${totalCost.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">未實現損益</p>
          <div className="flex items-end space-x-2">
            <h3 className={`text-2xl font-bold ${totalPL >= 0 ? 'text-red-500' : 'text-green-600'}`}>
              {totalPL > 0 ? '+' : ''}{totalPL.toLocaleString()}
            </h3>
            <span className={`text-sm mb-1 font-medium ${totalPL >= 0 ? 'text-red-500' : 'text-green-600'}`}>
               ({totalPLPercent.toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">台股紅漲綠跌</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <tr>
                <th className="p-4 font-medium">代號 / 名稱</th>
                <th className="p-4 font-medium text-right">持有股數</th>
                <th className="p-4 font-medium text-right">平均成本</th>
                <th className="p-4 font-medium text-right">現價</th>
                <th className="p-4 font-medium text-right">市值</th>
                <th className="p-4 font-medium text-right">損益</th>
                <th className="p-4 font-medium text-center">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {investments.map(inv => {
                const marketVal = inv.quantity * inv.currentPrice;
                const pl = marketVal - (inv.quantity * inv.averageCost);
                const plPercent = ((inv.currentPrice - inv.averageCost) / inv.averageCost) * 100;
                
                return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                        <div className="font-bold text-slate-800">{inv.symbol}</div>
                        <div className="text-xs text-slate-500">{inv.name}</div>
                    </td>
                    <td className="p-4 text-right">{inv.quantity.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-600">${inv.averageCost.toLocaleString()}</td>
                    <td className="p-4 text-right font-medium text-slate-800">${inv.currentPrice.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-slate-800">${marketVal.toLocaleString()}</td>
                    <td className="p-4 text-right">
                        <div className={`font-bold ${pl >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {pl > 0 ? '+' : ''}{pl.toLocaleString()}
                        </div>
                        <div className={`text-xs ${pl >= 0 ? 'text-red-400' : 'text-green-500'}`}>
                        {plPercent.toFixed(2)}%
                        </div>
                    </td>
                    <td className="p-4 text-center">
                        <button onClick={() => handleDelete(inv.id)} className="text-slate-400 hover:text-red-500 p-2">
                            <Trash2 size={16} />
                        </button>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增持股</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">股票代號</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  value={newStock.symbol}
                  onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  placeholder="例如：2330.TW 或 AAPL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">股票名稱 (選填)</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newStock.name}
                  onChange={e => setNewStock({...newStock, name: e.target.value})}
                  placeholder="例如：台積電"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">股數</label>
                    <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newStock.quantity}
                    onChange={e => setNewStock({...newStock, quantity: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">平均成本</label>
                    <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newStock.averageCost}
                    onChange={e => setNewStock({...newStock, averageCost: Number(e.target.value)})}
                    />
                </div>
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

export default Investments;
