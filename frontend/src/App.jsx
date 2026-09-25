import { useState, useEffect } from 'react'
import { Client } from "@gradio/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './App.css'

function App() {
  const [stockData, setStockData] = useState([])
  const [stats, setStats] = useState({ last_price: 0, stop_loss_5: 0, trailing_stop: 0 })
  const [ticker, setTicker] = useState('BUMI')
  const [loading, setLoading] = useState(false)

  // Daftar watchlist saham IHSG
  const watchlist = ['BUMI', 'ENRG', 'VKTR', 'BUVA', 'BELL', 'PADA']

  const fetchStock = async (selectedTicker) => {
    setLoading(true)
    try {
      // 2. Hubungkan secara spesifik ke nama Space Hugging Face kamu
      const client = await Client.connect("briansnjya/api-stocktracker");
      
      // 3. Panggil API dengan nama endpoint "stock" dan kirim argumen dalam bentuk array
      const result = await client.predict("stock", [selectedTicker]);
      
      // 4. Gradio client akan otomatis menunggu antrean selesai dan mengekstrak hasilnya
      const actualData = result.data[0];
      
      if (actualData && actualData.data && actualData.stats) {
        setStockData(actualData.data);
        setStats(actualData.stats);
        setTicker(selectedTicker);
      } else {
        console.error("Struktur JSON gagal diekstrak:", actualData);
      }
      
    } catch (error) {
      console.error("Gagal mengambil data saham:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStock('BUMI')
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>📈 Saham Tracker</h1>
      
      {/* Tombol Watchlist */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {watchlist.map(t => (
          <button 
            key={t} 
            onClick={() => fetchStock(t)} 
            style={{ 
              margin: '5px', 
              padding: '10px 20px', 
              backgroundColor: ticker === t ? '#10b981' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Memuat data pasar...</p>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Panel Kartu Statistik / Auto-Order */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3b82f6' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Harga Terakhir ({ticker})</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#f8fafc' }}>Rp{stats.last_price}</h2>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #ef4444' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Stop Loss (-5%)</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#ef4444' }}>Rp{stats.stop_loss_5}</h2>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10b981' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Trailing Stop (Puncak -3%)</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#10b981' }}>Rp{stats.trailing_stop}</h2>
            </div>
          </div>

          {/* Grafik Harga & MA-7 */}
          <div style={{ width: '100%', height: 420, backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#f8fafc', marginBottom: '20px' }}>Pergerakan Harga & MA-7 ({ticker})</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="price" name="Harga Close" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ma7" name="Moving Average (MA-7)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}

export default App