from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    # Ambil data saham IHSG dengan akhiran .JK
    stock = yf.Ticker(f"{ticker}.JK")
    hist = stock.history(period="1mo")
    
    # Hitung Moving Average 7 hari (MA-7)
    hist['MA7'] = hist['Close'].rolling(window=7).mean()
    
    data = []
    for date, row in hist.iterrows():
        # Handle jika nilai MA7 kosong di awal data
        ma7_val = round(row["MA7"], 2) if not pd.isna(row["MA7"]) else None
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "price": round(row["Close"], 2),
            "ma7": ma7_val
        })
        
    # Ambil harga terakhir dan hitung statistik Auto-Order
    last_price = float(hist['Close'].iloc[-1])
    highest_7d = float(hist['Close'].tail(7).max())
    
    stats = {
        "last_price": round(last_price, 2),
        "stop_loss_5": round(last_price * 0.95, 2),
        "trailing_stop": round(highest_7d * 0.97, 2)
    }
        
    return {
        "ticker": ticker, 
        "data": data,
        "stats": stats
    }