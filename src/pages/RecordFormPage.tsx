import React, { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  name: string;
  ticker: string;
  price?: number | null;
}

const RecordFormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    symbolName: '',
    ticker: '',
    tradeDate: '',       // ポジション取得日時
    tradeType: 'BUY',    // デフォルト値
    price: 0 as number | '',            // 価格
    reason: '',
    originPrice: null as number | null, // 取得時価格
    isPositionClose: false,
  });

  const [tickers] = useState<TickerItem[]>([]); // setTickers を削除

  useEffect(() => {
    // 必要に応じたフェッチ処理など
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // セレクトボックスで銘柄が選ばれた時の自動入力処理
    if (name === 'tickerSelector') {
      const selected = tickers.find(t => t.symbol === value) as TickerItem | undefined;
      if (selected) {
        const selectedPrice = (selected as any).price ?? formData.price;

        setFormData(prev => ({
          ...prev,
          ticker: selected.ticker || '',
          symbolName: selected.name || '',
          price: selectedPrice
        }));
      }
      return;
    }

    // 通常入力項目の更新処理
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">トレード記録・ポジション登録</h1>

      <form onSubmit={(e) => { e.preventDefault(); }}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">銘柄選択</label>
          <select
            name="tickerSelector"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">銘柄を選択してください</option>
            {tickers.map((t, idx) => (
              <option key={idx} value={t.symbol}>{t.name} ({t.ticker})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">銘柄名</label>
          <input
            type="text"
            name="symbolName"
            value={formData.symbolName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ティッカー</label>
          <input
            type="text"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ポジション取得日時 (tradeDate)</label>
          <input
            type="datetime-local"
            name="tradeDate"
            value={formData.tradeDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">価格 (price)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="isPositionClose"
            id="isPositionClose"
            checked={formData.isPositionClose}
            onChange={(e) => setFormData(prev => ({ ...prev, isPositionClose: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isPositionClose" className="text-sm font-medium">ポジションを決済する (Position Close)</label>
        </div>

        {formData.isPositionClose && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">ポジション取得時価格 (originPrice)</label>
            <input
              type="number"
              name="originPrice"
              value={formData.originPrice ?? ''}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="取得時の価格を入力"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">理由 / メモ</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録する
        </button>
      </form>
    </div>
  );
};

export default RecordFormPage;