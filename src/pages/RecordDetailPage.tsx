import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { TradeRecord } from '../types/TradeRecord';

const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<TradeRecord | undefined>(undefined);
  const [relatedRecords, setRelatedRecords] = useState<TradeRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const GAS_URL = 'https://script.google.com/macros/s/AKfycbwNp0te3WllYWonguzgZ4N06HLEhK3FtsTg13tW2gmShDOP-Oa2P8SkaIDTgCGtDxz6/exec';
      try {
        const res = await fetch(GAS_URL);
        const allRecords: TradeRecord[] = await res.json();

        // ローカル関数(getRecordById)を使わず、取得した全データから探す
        const found = allRecords.find(r => String(r.id) === String(id));
        console.log("GASから取得した詳細データ:", found);
        setRecord(found);

        if (found) {
          // 同一ティッカーの他のレコードも全データから絞り込む
          setRelatedRecords(allRecords.filter(r => r.ticker === found.ticker && r.id !== id));
        }
      } catch (err) {
        console.error("詳細取得エラー:", err);
      }
    };

    fetchData();
  }, [id]);

  if (!record) return <div>記録が見つかりません。</div>;

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
