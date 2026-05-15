require('dotenv').config();
const Alpaca = require('@alpacahq/alpaca-trade-api');

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY_ID,
  secretKey: process.env.ALPACA_SECRET_KEY,
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
