import React, { useState, useEffect } from 'react';
import type { TradeRecord } from '../types/TradeRecord';
import { saveRecordToGAS } from '../services/storage';

const RecordFormPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<TradeRecord, 'id' | 'createdAt'>>({
    symbolName: '',
    ticker: '',
    tradeDate: '',
    tradeType: 'BUY', // デフォルト値
    price: 0,
    reason: '',
  });

  // 追加：銘柄リストのステート
  const [tickers, setTickers] = useState<{ symbol: string, name: string }[]>([]);
  // 追加：起動時にスプシから銘柄リストを取得
  useEffect(() => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwyBJkk1V0chHEQNbpdoddQ9eoem2ygOQelP0cSrfSDE3Fo7H6-DzlfyLLUiOayY8E/exec'; // ChartShapeCheckerと同じURL
    fetch(GAS_URL)
      .then(res => res.json())
      .then(data => setTickers(data.tickers))
      .catch(err => console.error("銘柄取得失敗:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // 追加：セレクトボックスで銘柄が選ばれた時の自動入力処理
    if (name === 'tickerSelector') {
      const selected = tickers.find(t => t.symbol === value);
      if (selected) {
        setFormData(prev => ({ ...prev, ticker: selected.symbol, symbolName: selected.name }));
      }
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ページリロードを防止
    // FormDataを使用して入力値を取得
    const formData = new FormData(event.currentTarget);

    // TradeRecord型に合わせたオブジェクトを作成 
    const record: TradeRecord = {
      id: crypto.randomUUID(), // IDの生成例
      symbolName: formData.get('symbolName') as string,
      ticker: formData.get('ticker') as string,
      tradeDate: formData.get('tradeDate') as string,
      tradeType: formData.get('tradeType') as 'BUY' | 'SELL', // select要素などを想定
      price: Number(formData.get('price')),
      reason: formData.get('reason') as string,
      createdAt: new Date().toISOString(), // 現在時刻を文字列で保存
    };

    const success = await saveRecordToGAS(record);
    if (success) {
      alert("スプレッドシートに保存しました！");
    } else {
      alert("保存に失敗しました。");
    }
  };

  return (
    <div>
      <h1>新規投資記録の追加</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        {/* 追加：銘柄選択用ListBox */}
        <div>
          <label>銘柄リストから選択:</label>
          <select name="tickerSelector" onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- 銘柄を選択 --</option>
            {tickers.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol} ({t.name})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="symbolName">銘柄名:</label>
          <input
            type="text"
            id="symbolName"
            name="symbolName"
            value={formData.symbolName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="ticker">ティッカー:</label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="tradeDate">取引日付:</label>
          <input
            type="date"
            id="tradeDate"
            name="tradeDate"
            value={formData.tradeDate}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="tradeType">取引種別:</label>
          <select
            id="tradeType"
            name="tradeType"
            value={formData.tradeType}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label htmlFor="price">価格:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="reason">理由:</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          記録を保存
        </button>
      </form>
    </div>
  );
};

export default RecordFormPage;
