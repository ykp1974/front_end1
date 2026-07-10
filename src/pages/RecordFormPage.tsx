import React, { useState, useEffect } from 'react';
import type { TradeRecord } from '../types/TradeRecord';
import { saveRecordToGAS } from '../services/storage';

const PREFIX_MAP = {
  "[w]": "ダブルボトム",
  "[m]": "移動平均線乖離",
  "[r]": "レンジブレイク",
  // 必要に応じて追加してください
};

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
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxJq7lYKUQ1t42Y0VSmM_6MZ2orwdAeCwgYZQeEMppfd8pIRJlOHJPpNPmRsOqiIuM/exec';
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
        // 末尾4桁のみとする
        const cleanTicker = selected.symbol.slice(-4);
        // 本日日付の取得 (yyyy-mm-dd 形式)
        const today = new Date().toISOString().split('T')[0];
        // 接頭句を特定 (例: "[w]")
        const prefix = Object.keys(PREFIX_MAP).find(p => remaining.startsWith(p));

        // 接頭句があればそれをreasonに、なければ空文字に
        const autoReason = prefix ? PREFIX_MAP[prefix] : '';
        setFormData(prev => ({
          ...prev,
          ticker: cleanTicker,
          symbolName: selected.name,
          tradeDate: today, // 日付自動入力
          reason: autoReason
        }));
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

  // 1. fetch関数の追加
  const fetchLatestPrice = async () => {
    if (!formData.ticker) return;

    // 公開されたCSVのURL
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1v4cTk72DuaaZNzQqfLVg5uxZoxwVpiuDCIihYrLnTXIrSys3_z50DhlEOhDdLScVeKOXs8zr6Zin/pub?gid=0&single=true&output=csv';

    try {
      const res = await fetch(CSV_URL);
      const text = await res.text();

      // CSVをパースして該当ティッカーを探す
      const rows = text.split('\n').map(row => row.split(','));
      // 行を検索（データ行が2行目以降と想定）
      const foundRow = rows.find(r => r[2] === formData.ticker);

      if (foundRow) {
        // "￥4,430.00" から "4430.00" に変換する処理
        const rawPrice = foundRow[3];
        const numericPrice = Number(rawPrice.replace(/[￥,]/g, ''));

        if (!isNaN(numericPrice)) {
          setFormData(prev => ({ ...prev, price: numericPrice }));
        } else {
          console.error("数値変換失敗:", rawPrice);
          alert("価格の数値変換に失敗しました");
        }
      }
    } catch (err) {
      console.error("価格取得失敗:", err);
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
          <button
            type="button"
            onClick={fetchLatestPrice} // ここで価格取得！
            style={{ padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >
            取得
          </button>
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
