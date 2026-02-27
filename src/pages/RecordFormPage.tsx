import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRecord } from '../services/storage';
import type { TradeRecord } from '../types/TradeRecord';
import { v4 as uuidv4 } from 'uuid'; // ユニークID生成のため

const RecordFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<TradeRecord, 'id' | 'createdAt'>>({
    symbolName: '',
    ticker: '',
    tradeDate: '',
    tradeType: 'BUY', // デフォルト値
    price: 0,
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: TradeRecord = {
      ...formData,
      id: uuidv4(), // ユニークIDを生成
      createdAt: new Date().toISOString(),
    };
    addRecord(newRecord);
    navigate('/records');
  };

  return (
    <div>
      <h1>新規投資記録の追加</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
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
