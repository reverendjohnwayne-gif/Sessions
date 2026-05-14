const Alpaca = require('@alpacahq/alpaca-trade-api');

const alpaca = new Alpaca({
  keyId: 'PKAP5RKWRC7W25ZKABFH43VZQS',
  secretKey: '9KvQUdXAaqjDthGTNkMPmg9Y7TSCMVz8VyoJmym9xT4r',
  paper: true
});

async function runAggressiveBot() {
  console.log("Initializing Aggressive Paper Portfolio...");
  
  const symbols = ['NVDA', 'TQQQ', 'MSTR'];
  const amount = 1000; // $1,000 per asset

  for (const symbol of symbols) {
    try {
      await alpaca.createOrder({
        symbol: symbol,
        notional: amount,
        side: 'buy',
        type: 'market',
        time_in_force: 'day'
      });
      console.log(`✅ Successfully placed order to buy $1000 of ${symbol}`);
    } catch (err) {
      console.error(`❌ Failed to buy ${symbol}:`, err.message);
    }
  }
  
  console.log("Done! Check your Alpaca Dashboard to see your new positions.");
}

runAggressiveBot();
