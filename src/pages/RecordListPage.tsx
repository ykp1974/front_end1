import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { TradeRecord } from '../types/TradeRecord';

const RecordListPage: React.FC = () => {
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // setRecords(loadRecords()); // 旧処理…LocalStorageから取得
    // データを取得する関数
    const fetchRecords = async () => {
      // あなたのGASウェブアプリURL（doGetが実装されているもの）
      const GAS_URL = 'https://script.google.com/macros/s/AKfycbz6UCNAyom5PzEySX60ocQ7yjltzYUWQmdM-wMpmDg07H_ZWWwhieTnymcl6nyi7JoZ/exec';

      try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error('データの取得に失敗しました');

        const data: TradeRecord[] = await response.json();
        setRecords(data);
      } catch (err) {
        console.error("読み込みエラー:", err);
        setError("記録の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div>
      <h1>投資記録一覧</h1>
      <Link to="/records/new" style={{ marginBottom: '20px', display: 'inline-block' }}>
        新規記録の追加
      </Link>
      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : records.length === 0 ? (
        <p>記録がありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>銘柄名</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>ティッカー</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>取引種別</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>日付</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>価格</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>詳細</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{record.symbolName}</td> {/* 名前表示 */}
                <td style={{ padding: '8px' }}>{record.ticker}</td>
                <td style={{ padding: '8px' }}>{record.tradeType}</td>
                <td style={{ padding: '8px' }}>{record.tradeDate}</td>
                <td style={{ padding: '8px' }}>{record.price?.toLocaleString()}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/records/${record.id}`}>詳細を見る</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecordListPage;
