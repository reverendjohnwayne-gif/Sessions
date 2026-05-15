import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

const API_KEY = import.meta.env.VITE_ALPACA_KEY_ID;
const SECRET_KEY = import.meta.env.VITE_ALPACA_SECRET_KEY;
const HEADERS = {
  'APCA-API-KEY-ID': API_KEY,
  'APCA-API-SECRET-KEY': SECRET_KEY,
  'accept': 'application/json'
};

function Dashboard() {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Account Balance
        const accRes = await fetch('https://paper-api.alpaca.markets/v2/account', { headers: HEADERS });
        const accData = await accRes.json();
        setAccount(accData);

        // Fetch Open Positions
        const posRes = await fetch('https://paper-api.alpaca.markets/v2/positions', { headers: HEADERS });
        const posData = await posRes.json();
        
        // Fetch Historical Data for charts (Last 30 Days)
        const symbols = ['NVDA', 'TQQQ', 'MSTR'].join(',');
        const dateOffset = (24*60*60*1000) * 30; // 30 days
        const start = new Date();
        start.setTime(start.getTime() - dateOffset);
        const startStr = start.toISOString();
        
        const chartRes = await fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${symbols}&timeframe=1Day&start=${startStr}`, { headers: HEADERS });
        const chartData = await chartRes.json();
        
        // Format chart data for Recharts
        const formattedCharts = {};
        if (chartData.bars) {
          for (const [symbol, bars] of Object.entries(chartData.bars)) {
            formattedCharts[symbol] = bars.map(b => ({ value: b.c })); // closing price
          }
        }
        
        setHistoricalData(formattedCharts);
        setPositions(posData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Alpaca Data:", err);
      }
    }
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-xl animate-pulse">Connecting to Alpaca...</p></div>;
  }

  const portfolioValue = parseFloat(account.portfolio_value);
  const initialValue = 100000; // Standard Alpaca paper starting balance
  const totalProfit = portfolioValue - initialValue;

  const getBotName = (symbol) => {
    if (symbol === 'NVDA') return 'Momentum RSI';
    if (symbol === 'TQQQ') return 'Trend Follower';
    if (symbol === 'MSTR') return 'Crypto Sentiment';
    return 'Manual Trade';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold mb-1">Live Paper Dashboard</h2>
            <span className="glass px-2 py-0.5 rounded text-xs font-bold" style={{color: '#4ade80', background: 'rgba(74, 222, 128, 0.2)'}}>CONNECTED</span>
          </div>
          <p className="text-sm text-secondary" style={{color: '#94a3b8'}}>Syncing directly with your real Alpaca Paper Account.</p>
        </div>
        <button className="glass-btn primary" style={{fontSize: '0.875rem'}}>+ Manual Trade</button>
      </div>

      {/* Summary Grid */}
      <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{padding: '1rem'}}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium" style={{color: '#94a3b8'}}>Total Buying Power</p>
              <h3 className="text-xl font-bold mt-1">${parseFloat(account.buying_power).toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="glass p-1.5 rounded-lg">
              <DollarSign size={16} color="#fbbf24" />
            </div>
          </div>
          <p className="text-xs text-secondary" style={{color: '#94a3b8'}}>Cash available to trade</p>
        </div>

        <div className="glass-card" style={{padding: '1rem'}}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium" style={{color: '#94a3b8'}}>Portfolio Value</p>
              <h3 className="text-xl font-bold mt-1">${portfolioValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="glass p-1.5 rounded-lg">
              <Activity size={16} color="#3b82f6" />
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs ${totalProfit >= 0 ? 'text-green' : 'text-red'}`} style={{color: totalProfit >= 0 ? '#4ade80' : '#f87171'}}>
            {totalProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', {minimumFractionDigits: 2})} all time</span>
          </div>
        </div>

        <div className="glass-card" style={{padding: '1rem'}}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium" style={{color: '#94a3b8'}}>Today's Return</p>
              <h3 className={`text-xl font-bold mt-1 ${parseFloat(account.equity) >= parseFloat(account.last_equity) ? 'text-green' : 'text-red'}`} 
                  style={{color: parseFloat(account.equity) >= parseFloat(account.last_equity) ? '#4ade80' : '#f87171'}}>
                ${Math.abs(parseFloat(account.equity) - parseFloat(account.last_equity)).toLocaleString('en-US', {minimumFractionDigits: 2})}
              </h3>
            </div>
            <div className="glass p-1.5 rounded-lg">
              {parseFloat(account.equity) >= parseFloat(account.last_equity) ? <TrendingUp size={16} color="#4ade80" /> : <TrendingDown size={16} color="#f87171" />}
            </div>
          </div>
          <p className="text-xs text-secondary" style={{color: '#94a3b8'}}>{positions.length} Active Positions</p>
        </div>
      </div>

      {/* Positions Grid - Compact View */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold mb-3 mt-2">Active Positions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {positions.length === 0 ? (
            <p className="col-span-3 text-center py-8 text-secondary" style={{color: '#94a3b8'}}>No active positions found. Waiting for market open or bots to execute.</p>
          ) : (
            positions.map(pos => {
              const currentPrice = parseFloat(pos.current_price);
              const avgEntry = parseFloat(pos.avg_entry_price);
              const isPositive = parseFloat(pos.unrealized_pl) >= 0;
              const chartData = historicalData[pos.symbol] || [];
              const chartColor = isPositive ? '#4ade80' : '#f87171';
              
              return (
                <div key={pos.symbol} className="glass p-3 rounded-xl flex flex-col" style={{minHeight: '220px'}}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-base font-bold">{pos.symbol}</h4>
                      <p className="text-[10px] truncate max-w-[100px]" style={{color: '#94a3b8'}}>{pos.qty} Shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${currentPrice.toFixed(2)}</p>
                      <p className="text-[11px] font-bold" style={{color: chartColor}}>
                        {isPositive ? '+' : ''}{parseFloat(pos.unrealized_plpc * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 my-1">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                          <Tooltip 
                            contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: chartColor }}
                            labelStyle={{ display: 'none' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={chartColor} 
                            strokeWidth={2} 
                            dot={false} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] text-secondary" style={{color: '#94a3b8'}}>No history</div>
                    )}
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center pt-2" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                    <span className="glass px-1.5 py-0.5 rounded text-[10px]" style={{color: '#94a3b8'}}>Bot: {getBotName(pos.symbol)}</span>
                    <span className="text-[10px]" style={{color: isPositive ? '#4ade80' : '#f87171'}}>${parseFloat(pos.unrealized_pl).toFixed(2)} P&L</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
