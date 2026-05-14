import { Key, ShieldCheck, AlertCircle } from 'lucide-react';

function Integrations() {
  const brokerages = [
    {
      id: 'alpaca',
      name: 'Alpaca Markets',
      description: 'The easiest and most developer-friendly API for stock and crypto trading.',
      status: 'connected',
      color: '#fbbf24'
    },
    {
      id: 'tradier',
      name: 'Tradier Brokerage',
      description: 'Powerful API with excellent support for options and equity trading.',
      status: 'disconnected',
      color: '#3b82f6'
    },
    {
      id: 'ibkr',
      name: 'Interactive Brokers',
      description: 'Advanced platform for international markets and complex derivatives.',
      status: 'disconnected',
      color: '#ef4444'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Brokerage Integrations</h2>
        <p className="text-secondary" style={{color: '#94a3b8'}}>Connect your accounts to enable automated swing trading.</p>
      </div>

      <div className="grid-dashboard">
        {brokerages.map(broker => (
          <div key={broker.id} className="glass-card flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl" style={{backgroundColor: broker.color, color: '#fff'}}>
                {broker.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{broker.name}</h3>
                {broker.status === 'connected' ? (
                  <span className="text-xs flex items-center gap-1" style={{color: '#4ade80'}}><ShieldCheck size={12}/> Connected</span>
                ) : (
                  <span className="text-xs flex items-center gap-1" style={{color: '#f87171'}}><AlertCircle size={12}/> Not Connected</span>
                )}
              </div>
            </div>
            
            <p className="text-sm mb-6 flex-1" style={{color: '#94a3b8'}}>{broker.description}</p>
            
            {broker.status === 'connected' ? (
              <button className="glass-btn danger w-full">Disconnect Account</button>
            ) : (
              <div className="space-y-3">
                <input type="text" placeholder="API Key" className="glass-input" />
                <input type="password" placeholder="API Secret" className="glass-input" />
                <button className="glass-btn primary w-full">
                  <Key size={16} /> Connect via API
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card mt-6">
        <h3 className="text-xl font-bold mb-4">Security Notice</h3>
        <p className="text-sm" style={{color: '#94a3b8'}}>
          Your API keys are encrypted and stored locally in your workspace. We never transmit your secrets to external servers outside of direct connections to your chosen brokerages. For best security, always create restricted API keys that only have permissions to trade and read data, but <strong>cannot withdraw funds</strong>.
        </p>
      </div>
    </div>
  );
}

export default Integrations;
