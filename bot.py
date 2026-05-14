from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

# 1. Insert your API Keys here
API_KEY = 'PKAP5RKWRC7W25ZKABFH43VZQS'
SECRET_KEY = '9KvQUdXAaqjDthGTNkMPmg9Y7TSCMVz8VyoJmym9xT4r' # <-- Replace this with the hidden secret key from your dashboard!

# 2. Initialize the Paper Trading Client
trading_client = TradingClient(API_KEY, SECRET_KEY, paper=True)

# 3. Define our aggressive portfolio
symbols_to_buy = ['NVDA', 'TQQQ', 'MSTR']
dollar_amount_per_trade = 1000.00

print("Initializing Aggressive Paper Portfolio...")

for symbol in symbols_to_buy:
    try:
        # Create a market order to buy a fractional amount equivalent to $1,000
        order_details = MarketOrderRequest(
            symbol=symbol,
            notional=dollar_amount_per_trade, # Invest exactly $1,000
            side=OrderSide.BUY,
            time_in_force=TimeInForce.DAY
        )
        
        # Submit the order
        order = trading_client.submit_order(order_data=order_details)
        print(f"✅ Successfully placed order to buy $1000 of {symbol}")
        
    except Exception as e:
        print(f"❌ Failed to buy {symbol}: {e}")

print("Done! Check your Alpaca Dashboard to see your new positions.")
