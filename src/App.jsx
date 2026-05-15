import { useState } from 'react';
import PlayerPanel from './components/PlayerPanel';

const ADAM_API_KEY = import.meta.env.VITE_ALPACA_KEY_ID;
const ADAM_SECRET = import.meta.env.VITE_ALPACA_SECRET_KEY;

// Player color themes
const ADAM_THEME = {
  accent: '#3b82f6',         // Blue
  glow: 'rgba(59,130,246,0.3)',
  chartColor: '#22d3ee',     // Cyan sparkline
  badgeBg: 'rgba(59,130,246,0.15)',
  barColor: '#3b82f6',
};

const JASON_THEME = {
  accent: '#f43f5e',         // Rose/Red
  glow: 'rgba(244,63,94,0.3)',
  chartColor: '#f43f5e',     // Rose sparkline
  badgeBg: 'rgba(244,63,94,0.15)',
  barColor: '#f43f5e',
};

function App() {
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const [p2Connected, setP2Connected] = useState(false);
  const [p2Key, setP2Key] = useState('');
  const [p2Secret, setP2Secret] = useState('');

  // Tug-of-War bar
  const p1Advantage = p1Score - p2Score;
  const cappedAdvantage = Math.max(-5000, Math.min(5000, p1Advantage));
  const p1Percentage = 50 + (cappedAdvantage / 5000) * 50;

  const p1Leading = p1Score >= p2Score;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{background:'#0a0c10', fontFamily:'Inter,sans-serif'}}>

      {/* ── Header / Scoreboard ── */}
      <header style={{
        background:'#111318',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'0 1.5rem',
        height:'82px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        gap:'1rem',
        flexShrink:0,
      }}>

        {/* Adam Label */}
        <div style={{display:'flex', alignItems:'center', gap:'10px', width:'22%'}}>
          {/* Heartbeat icon — green per request */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <div>
            <div style={{fontWeight:800, fontSize:'1.15rem', letterSpacing:'0.12em', color: ADAM_THEME.accent}}>ADAM</div>
            <div style={{fontSize:'0.7rem', color:'#64748b', letterSpacing:'0.05em'}}>Player 1</div>
          </div>
        </div>

        {/* VS / Tug-of-War */}
        <div style={{flex:1, maxWidth:'500px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
          {/* Scores */}
          <div style={{display:'flex', justifyContent:'space-between', width:'100%', paddingInline:'4px'}}>
            <span style={{fontSize:'0.8rem', fontWeight:700, color: p1Score >= 0 ? '#4ade80' : '#f87171'}}>
              {p1Score >= 0 ? '+' : ''}${p1Score.toFixed(2)}
            </span>
            <span style={{fontSize:'0.75rem', fontWeight:800, color:'#475569', letterSpacing:'0.15em'}}>VS</span>
            <span style={{fontSize:'0.8rem', fontWeight:700, color: p2Score >= 0 ? '#4ade80' : '#f87171'}}>
              {p2Score >= 0 ? '+' : ''}${p2Score.toFixed(2)}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{width:'100%', height:'14px', borderRadius:'99px', background: JASON_THEME.barColor, overflow:'hidden', position:'relative', boxShadow:`0 0 24px ${JASON_THEME.glow}, 0 0 10px ${JASON_THEME.glow}`}}>
            <div style={{
              width:`${p1Percentage}%`,
              height:'100%',
              background: ADAM_THEME.barColor,
              borderRadius:'99px',
              transition:'width 1s ease-out',
              boxShadow:`0 0 20px ${ADAM_THEME.glow}, 0 0 8px ${ADAM_THEME.glow}`,
            }}/>
            {/* Center tick */}
            <div style={{position:'absolute', top:0, bottom:0, left:'50%', width:'2px', background:'rgba(255,255,255,0.3)', transform:'translateX(-50%)'}}/>
          </div>

          {/* Leading label */}
          <div style={{fontSize:'0.65rem', color:'#475569', letterSpacing:'0.05em'}}>
            {p1Score === p2Score ? '⚖ TIED' : p1Leading ? '🔵 ADAM LEADS' : '🔴 JASON LEADS'}
          </div>
        </div>

        {/* Jason Label */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'10px', width:'22%'}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:800, fontSize:'1.15rem', letterSpacing:'0.12em', color: JASON_THEME.accent}}>JASON</div>
            <div style={{fontSize:'0.7rem', color:'#64748b', letterSpacing:'0.05em'}}>Challenger</div>
          </div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
      </header>

      {/* ── Split Screen ── */}
      <main style={{flex:1, display:'flex', overflow:'hidden'}}>

        {/* Adam's Side */}
        <div style={{
          width:'50%', height:'100%', padding:'1.25rem',
          borderRight:`1px solid rgba(59,130,246,0.12)`,
          borderTop:`2px solid ${ADAM_THEME.accent}`,
          boxShadow:`inset 0 0 60px rgba(59,130,246,0.03)`,
          overflow:'hidden',
        }}>
          <PlayerPanel
            playerName="Adam"
            apiKey={ADAM_API_KEY}
            apiSecret={ADAM_SECRET}
            onScoreUpdate={setP1Score}
            theme={ADAM_THEME}
          />
        </div>

        {/* Jason's Side */}
        <div style={{
          width:'50%', height:'100%', padding:'1.25rem',
          borderTop:`2px solid ${JASON_THEME.accent}`,
          boxShadow:`inset 0 0 60px rgba(244,63,94,0.03)`,
          overflow:'hidden',
        }}>
          {p2Connected ? (
            <PlayerPanel
              playerName="Jason"
              apiKey={p2Key}
              apiSecret={p2Secret}
              onScoreUpdate={setP2Score}
              theme={JASON_THEME}
            />
          ) : (
            <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <div style={{
                background:'#111318',
                border:`1px solid ${JASON_THEME.accent}22`,
                borderRadius:'16px',
                padding:'2.5rem',
                width:'100%',
                maxWidth:'420px',
                boxShadow:`0 0 40px ${JASON_THEME.glow}`,
                display:'flex',
                flexDirection:'column',
                gap:'1rem',
              }}>
                <div style={{textAlign:'center', marginBottom:'0.5rem'}}>
                  <div style={{marginBottom:'8px', display:'flex', justifyContent:'center'}}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Sword 1 - top-left to bottom-right */}
                      <line x1="3" y1="3" x2="21" y2="21" stroke={JASON_THEME.accent} strokeWidth="2.5" strokeLinecap="round"/>
                      <polygon points="3,3 3,7 7,3" fill={JASON_THEME.accent}/>
                      <line x1="18" y1="21" x2="21" y2="18" stroke={JASON_THEME.accent} strokeWidth="1.5" strokeLinecap="round"/>
                      {/* Sword 2 - top-right to bottom-left */}
                      <line x1="21" y1="3" x2="3" y2="21" stroke={ADAM_THEME.accent} strokeWidth="2.5" strokeLinecap="round"/>
                      <polygon points="21,3 17,3 21,7" fill={ADAM_THEME.accent}/>
                      <line x1="6" y1="21" x2="3" y2="18" stroke={ADAM_THEME.accent} strokeWidth="1.5" strokeLinecap="round"/>
                      {/* Center clash glow */}
                      <circle cx="12" cy="12" r="2.5" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:'4px'}}>Challenger Approaching</h3>
                  <p style={{fontSize:'0.82rem', color:'#64748b'}}>Jason — paste your Alpaca Paper API keys to enter the arena.</p>
                </div>

                <input
                  type="text"
                  placeholder="API Key"
                  className="input"
                  value={p2Key}
                  onChange={e => setP2Key(e.target.value)}
                  style={{background:'#0a0c10', border:`1px solid ${JASON_THEME.accent}44`, color:'#e2e8f0', borderRadius:'8px', padding:'0.65rem 1rem', outline:'none', fontSize:'0.875rem'}}
                />
                <input
                  type="password"
                  placeholder="Secret Key"
                  className="input"
                  value={p2Secret}
                  onChange={e => setP2Secret(e.target.value)}
                  style={{background:'#0a0c10', border:`1px solid ${JASON_THEME.accent}44`, color:'#e2e8f0', borderRadius:'8px', padding:'0.65rem 1rem', outline:'none', fontSize:'0.875rem'}}
                />

                <button
                  onClick={() => { if (p2Key && p2Secret) setP2Connected(true); }}
                  style={{
                    background: JASON_THEME.accent,
                    border:'none', borderRadius:'8px',
                    color:'white', padding:'0.75rem',
                    fontWeight:700, fontSize:'0.9rem',
                    cursor:'pointer',
                    opacity: 1,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    boxShadow:`0 0 24px ${JASON_THEME.glow}`,
                    transition:'all 0.2s',
                  }}
                >
                  ▶ Enter the Arena
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
