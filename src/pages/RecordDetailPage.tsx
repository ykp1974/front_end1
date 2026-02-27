import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecordById, getRecordsByTicker } from '../services/storage';
import type { TradeRecord } from '../types/TradeRecord';

const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<TradeRecord | undefined>(undefined);
  const [relatedRecords, setRelatedRecords] = useState<TradeRecord[]>([]);

  useEffect(() => {
    if (id) {
      const foundRecord = getRecordById(id);
      setRecord(foundRecord);

      if (foundRecord) {
        // 同一tickerの他のレコードを取得
        const allRecords = getRecordsByTicker(foundRecord.ticker);
        // 現在のレコードを除く
        setRelatedRecords(allRecords.filter(rec => rec.id !== id));
      }
    }
  }, [id]);

  if (!record) {
    return <div>記録が見つかりません。</div>;
  }

  return (
    <div>
      <h1>記録詳細</h1>
      <Link to="/records">一覧に戻る</Link>

      <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px 0' }}>
        <h2>{record.symbolName} ({record.ticker})</h2>
        <p><strong>取引種別:</strong> {record.tradeType}</p>
        <p><strong>取引日付:</strong> {record.tradeDate}</p>
        <p><strong>価格:</strong> {record.price.toLocaleString()}</p>
        <p><strong>理由:</strong> {record.reason}</p>
        <p><strong>記録日時:</strong> {new Date(record.createdAt).toLocaleString()}</p>
      </div>

      {relatedRecords.length > 0 && (
        <div>
          <h3>同一ティッカー ({record.ticker}) の他の記録</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>銘柄名</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>取引種別</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>日付</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>価格</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>詳細</th>
              </tr>
            </thead>
            <tbody>
              {relatedRecords.map((relRecord) => (
                <tr key={relRecord.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{relRecord.symbolName}</td>
                  <td style={{ padding: '8px' }}>{relRecord.tradeType}</td>
                  <td style={{ padding: '8px' }}>{relRecord.tradeDate}</td>
                  <td style={{ padding: '8px' }}>{relRecord.price.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>
                    <Link to={`/records/${relRecord.id}`}>詳細を見る</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecordDetailPage;
