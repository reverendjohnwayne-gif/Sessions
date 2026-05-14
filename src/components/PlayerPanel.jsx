import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

function PlayerPanel({ playerName, apiKey, apiSecret, onScoreUpdate, theme }) {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeAmount, setTradeAmount] = useState('1000');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeMsg, setTradeMsg] = useState('');

  const HEADERS = {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': apiSecret,
    'accept': 'application/json',
    'content-type': 'application/json'
  };

  const fetchData = async () => {
    try {
      const accRes = await fetch('https://paper-api.alpaca.markets/v2/account', { headers: HEADERS });
      const accData = await accRes.json();
      if (accData.code) throw new Error(accData.message);
      setAccount(accData);
      onScoreUpdate(parseFloat(accData.portfolio_value) - 100000);

      const posRes = await fetch('https://paper-api.alpaca.markets/v2/positions', { headers: HEADERS });
      const posData = await posRes.json();
      setPositions(posData);

      if (posData.length > 0) {
        const symbols = posData.map(p => p.symbol).join(',');
        const start = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const chartRes = await fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${symbols}&timeframe=1Day&start=${start}`, { headers: HEADERS });
        const chartData = await chartRes.json();
        const formatted = {};
        if (chartData.bars) {
          for (const [sym, bars] of Object.entries(chartData.bars)) {
            formatted[sym] = bars.map(b => ({ value: parseFloat(b.c.toFixed(2)) }));
          }
        }
        setHistoricalData(formatted);
      }
      setLoading(false);
    } catch (err) {
      console.error(`[${playerName}] Error:`, err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [apiKey, apiSecret]);

  const handleTrade = async (side, symbol = tradeSymbol, amount = tradeAmount, qty = null) => {
    if (!symbol) return;
    setIsTrading(true);
    setTradeMsg('');
    const body = qty
      ? { symbol: symbol.toUpperCase(), qty: String(qty), side, type: 'market', time_in_force: 'day' }
      : { symbol: symbol.toUpperCase(), notional: String(amount), side, type: 'market', time_in_force: 'day' };
    try {
      const res = await fetch('https://paper-api.alpaca.markets/v2/orders', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.id) {
        setTradeMsg(`✅ ${side.toUpperCase()} order placed for ${symbol.toUpperCase()}`);
        setTradeSymbol('');
        setTimeout(fetchData, 2000);
      } else {
        setTradeMsg(`❌ ${data.message}`);
      }
    } catch (e) {
      setTradeMsg('❌ Trade failed: ' + e.message);
    }
    setIsTrading(false);
    setTimeout(() => setTradeMsg(''), 5000);
  };

  if (loading) {
    return (
      <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px'}}>
        <div style={{
          width:'40px', height:'40px', borderRadius:'50%',
          border:`3px solid ${theme.accent}`, borderTopColor:'transparent',
          animation:'spin 0.8s linear infinite',
        }}/>
        <p style={{color:'#64748b', fontSize:'0.85rem'}}>Connecting to Alpaca...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!account?.portfolio_value) {
    return <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171', fontSize:'0.875rem'}}>⚠ Could not connect to Alpaca. Check API keys.</div>;
  }

  const portfolioValue = parseFloat(account.portfolio_value);
  const buyingPower = parseFloat(account.buying_power);
  const totalProfit = portfolioValue - 100000;
  const todayProfit = parseFloat(account.equity) - parseFloat(account.last_equity);
  const atMax = positions.length >= 5;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'12px', height:'100%'}}>

      {/* Player Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h2 style={{fontSize:'1.4rem', fontWeight:800, color: theme.accent, letterSpacing:'0.05em'}}>{playerName}'s Arena</h2>
          <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'2px'}}>
            {totalProfit >= 0 ? <TrendingUp size={14} color="#4ade80"/> : <TrendingDown size={14} color="#f87171"/>}
            <span style={{fontSize:'0.8rem', fontWeight:700, color: totalProfit >= 0 ? '#4ade80' : '#f87171'}}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)} all time
            </span>
            <span style={{fontSize:'0.75rem', color:'#475569', marginLeft:'4px'}}>
              | Today: <span style={{color: todayProfit >= 0 ? '#4ade80' : '#f87171'}}>{todayProfit >= 0 ? '+' : ''}${todayProfit.toFixed(2)}</span>
            </span>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'0.65rem', color:'#475569', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'2px'}}>Buying Power</div>
          <div style={{fontSize:'1.1rem', fontWeight:800, color:'#e2e8f0'}}>${buyingPower.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px'}}>
        {[
          { label:'Portfolio Value', value:`$${portfolioValue.toLocaleString('en-US', {minimumFractionDigits:2})}` },
          { label:'Open Positions', value:`${positions.length} / 5` },
          { label:'Status', value: atMax ? '🔴 Full' : '🟢 Active' },
        ].map(stat => (
          <div key={stat.label} style={{
            background:'#111318', border:'1px solid rgba(255,255,255,0.05)',
            borderRadius:'8px', padding:'10px 12px',
          }}>
            <div style={{fontSize:'0.65rem', color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>{stat.label}</div>
            <div style={{fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0'}}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Trade Desk */}
      <div style={{
        background:'#111318',
        border:`1px solid ${theme.accent}22`,
        borderRadius:'10px',
        padding:'12px',
        display:'flex', flexDirection:'column', gap:'8px',
      }}>
        <div style={{fontSize:'0.65rem', color: theme.accent, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase'}}>⚡ Trade Desk</div>
        <div style={{display:'flex', gap:'8px'}}>
          <input
            type="text"
            placeholder="Ticker (e.g. AAPL)"
            value={tradeSymbol}
            onChange={e => setTradeSymbol(e.target.value.toUpperCase())}
            style={{
              flex:1, background:'#0a0c10', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'6px', color:'#e2e8f0', padding:'8px 12px',
              outline:'none', fontSize:'0.85rem', fontWeight:600,
            }}
          />
          <input
            type="number"
            placeholder="$"
            value={tradeAmount}
            onChange={e => setTradeAmount(e.target.value)}
            style={{
              width:'90px', background:'#0a0c10', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'6px', color:'#e2e8f0', padding:'8px 12px',
              outline:'none', fontSize:'0.85rem',
            }}
          />
          <button
            disabled={isTrading || atMax || !tradeSymbol}
            onClick={() => handleTrade('buy')}
            style={{
              background: (isTrading || atMax || !tradeSymbol) ? '#1e293b' : theme.accent,
              color:'white', border:'none', borderRadius:'6px',
              padding:'8px 16px', fontWeight:700, cursor: (isTrading || atMax || !tradeSymbol) ? 'not-allowed' : 'pointer',
              fontSize:'0.85rem', transition:'background 0.2s',
              boxShadow: (!isTrading && !atMax && tradeSymbol) ? `0 0 15px ${theme.glow}` : 'none',
            }}
          >BUY</button>
        </div>
        {atMax && <div style={{fontSize:'0.7rem', color:'#f87171'}}>⛔ Max 5 positions reached. Sell something first.</div>}
        {tradeMsg && <div style={{fontSize:'0.75rem', color: tradeMsg.startsWith('✅') ? '#4ade80' : '#f87171'}}>{tradeMsg}</div>}
      </div>

      {/* Positions */}
      <div style={{flex:1, overflowY:'auto', paddingRight:'4px', display:'flex', flexDirection:'column', gap:'8px'}}>
        {positions.length === 0 ? (
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#334155', gap:'8px', padding:'2rem 0'}}>
            <div style={{fontSize:'2rem'}}>📊</div>
            <p style={{fontSize:'0.85rem'}}>No positions yet. Fire a trade above!</p>
          </div>
        ) : positions.map(pos => {
          const isUp = parseFloat(pos.unrealized_pl) >= 0;
          const plPct = (parseFloat(pos.unrealized_plpc) * 100).toFixed(2);
          const chartData = historicalData[pos.symbol] || [];

          return (
            <div key={pos.symbol} style={{
              background:'#111318',
              border:`1px solid ${isUp ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)'}`,
              borderLeft:`3px solid ${isUp ? '#4ade80' : '#f87171'}`,
              borderRadius:'10px',
              padding:'12px',
              display:'flex',
              flexDirection:'column',
              gap:'8px',
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                {/* Symbol and Entry */}
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span style={{fontSize:'1.1rem', fontWeight:800, color:'#e2e8f0'}}>{pos.symbol}</span>
                    <span style={{
                      background: theme.badgeBg, color: theme.accent,
                      fontSize:'0.6rem', fontWeight:700, padding:'2px 6px',
                      borderRadius:'4px', letterSpacing:'0.05em', textTransform:'uppercase',
                    }}>BOT ACTIVE</span>
                  </div>
                  <div style={{fontSize:'0.7rem', color:'#475569', marginTop:'2px'}}>
                    {parseFloat(pos.qty).toFixed(4)} shs @ ${parseFloat(pos.avg_entry_price).toFixed(2)}
                  </div>
                </div>

                {/* Sparkline */}
                <div style={{width:'90px', height:'36px'}}>
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Tooltip
                          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', padding:'4px 8px' }}
                          labelStyle={{ display: 'none' }}
                          itemStyle={{ color: theme.chartColor }}
                          formatter={(v) => [`$${v}`, '']}
                        />
                        <Line type="monotone" dataKey="value" stroke={theme.chartColor} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Price / P&L */}
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'1rem', fontWeight:800, color:'#e2e8f0'}}>${parseFloat(pos.current_price).toFixed(2)}</div>
                  <div style={{fontSize:'0.75rem', fontWeight:700, color: isUp ? '#4ade80' : '#f87171'}}>
                    {isUp ? '+' : ''}{plPct}% | {isUp ? '+' : ''}${parseFloat(pos.unrealized_pl).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Sell Button */}
              <div style={{display:'flex', justifyContent:'flex-end'}}>
                <button
                  disabled={isTrading}
                  onClick={() => handleTrade('sell', pos.symbol, null, pos.qty)}
                  style={{
                    background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)',
                    color:'#f87171', borderRadius:'6px', padding:'4px 14px',
                    fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background='rgba(248,113,113,0.25)'}
                  onMouseLeave={e => e.target.style.background='rgba(248,113,113,0.1)'}
                >Sell All</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerPanel;
