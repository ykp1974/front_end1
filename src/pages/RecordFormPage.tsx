import React, { useState, useEffect } from 'react';
import type { TradeRecord } from '../types/TradeRecord';
import { saveRecordToGAS } from '../services/storage';
import { useLocation, Link } from 'react-router-dom'; // Link を追加
import { GAS_BASE_URL } from '../config/gasConfig';

type ChartTicker = {
  symbol: string;
  name: string;
  ticker: string;
};

const PREFIX_MAP: Record<string, string> = {
  "[w]": "ダブルボトム ",
  "[m]": "移動平均線乖離 ",
  "[r]": "レンジブレイク ",
  // 必要に応じて追加してください
};

const RecordFormPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<TradeRecord, 'id' | 'createdAt'>>({
    symbolName: '',
    ticker: '',
    tradeDate: '',
    tradeType: 'BUY', // デフォルト値
    price: '',
    reason: '',
    originPrice: null, // ★初期値
    isPositionClose: false,
  });

  // 追加：銘柄リストのステート
  const [tickers, setTickers] = useState<{ symbol: string, name: string }[]>([]);
  const location = useLocation();
  const prefill = location.state; // 遷移時に送ったデータがここに入ります
  const [isInitialized, setIsInitialized] = useState(false); // ★フラグを追加
  // ChartShapeChecker用のデータ状態を追加
  const [chartTickers, setChartTickers] = useState<ChartTicker[]>([]);

  // 起動時にスプシから銘柄リストを取得
  useEffect(() => {
    // DecisionLoggerGAS#doGet
    fetch(GAS_BASE_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // ログの内容に合わせて symbol と name を抽出（またはそのまま使う）
          // handleChangeのロジックが `t.symbol` を期待しているので合わせます
          const formattedTickers = data.map(item => ({
            symbol: item.ticker.toString(), // 9090 を文字列に変換
            name: item.symbolName
          }));
          setTickers(formattedTickers);
        }
      })
      .catch(err => console.error("銘柄取得失敗:", err));
  }, []);

  // ChartShapeCheckerから保存された銘柄情報を取得
  useEffect(() => {
    fetch(`${GAS_BASE_URL}?sheet=ChartShapeChecker`)
      .then(res => res.json())
      .then(data => {
        console.log("GASからのレスポンス:", data); // これで中身をデバッグします
        // data自体が配列ならそのまま使う、そうでなければ tickers プロパティを探す
        const list = Array.isArray(data) ? data : data.tickers;
        if (list && Array.isArray(list)) {
          const valid = list.filter((t: any) => t && t.symbol !== 'DEBUG_START');
          setChartTickers(valid);
        } else {
          console.error("データが配列形式ではありません");
        }
      }).catch(err => console.error("銘柄取得失敗:", err));
  }, []);

  useEffect(() => {
    if (prefill && !isInitialized) {
      // すでに初期化済みなら何もしない
      if (isInitialized) return;
      setFormData(prev => ({
        ...prev,
        symbolName: prefill.symbolName || '',
        ticker: prefill.ticker || '',
        tradeType: prefill.tradeType || 'BUY',
        price: prefill.price || '',
        tradeDate: prefill.tradeDate || '',
        originPrice: prefill.originPrice || null // ★受け取り
      }));
      setIsInitialized(true); // ★フラグを立てる
    }
  }, [prefill, isInitialized]);

  // 3. セレクトボックス変更時のハンドラ
  const handleChartTickerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSymbol = e.target.value;
    const selectedData = chartTickers.find(t => t.symbol === selectedSymbol);

    if (selectedData) {
      // 選択された銘柄情報をフォームに反映
      setFormData(prev => ({
        ...prev,
        symbolName: selectedData.name,
        ticker: selectedData.ticker // もしくは symbol
      }));
    }
  };

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
        const remaining = selected.symbol.slice(0, -4); // 例: "[w]大黒天物産"
        const prefix = Object.keys(PREFIX_MAP).find(p => remaining.startsWith(p));

        // 接頭句があればそれをreasonに、なければ空文字に
        const autoReason = prefix ? PREFIX_MAP[prefix] : '';
        setFormData(prev => ({
          ...prev,
          ticker: cleanTicker,
          symbolName: selected.name,
          tradeDate: today, // 日付自動入力
          reason: remaining + ":" + autoReason
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
    // const formData = new FormData(event.currentTarget);

    // TradeRecord型に合わせたオブジェクトを作成 
    const record: TradeRecord = {
      id: crypto.randomUUID(),
      symbolName: formData.symbolName, // ここでエラーが出なくなります
      ticker: formData.ticker,
      tradeDate: formData.tradeDate,
      tradeType: formData.tradeType,
      price: Number(formData.price),
      reason: formData.reason,
      createdAt: new Date().toISOString(),
      // ここでステートの値を参照
      isPositionClose: formData.isPositionClose,
      originPrice: formData.originPrice,
      profit: formData.originPrice ? Number(formData.price) - formData.originPrice : 0
    };

    const success = await saveRecordToGAS(record);
    if (success) {
      alert("スプレッドシートに保存しました！[saveRecordToGAS]");
    } else {
      alert("保存に失敗しました。");
    }
  };

  // 1. fetch関数の追加
  const fetchLatestPrice = async () => {
    if (!formData.ticker) return;

    // 公開されたCSVのURL
    // ★ここはGASデプロイ時に書き換えない！！★
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
      {/* ここに追加 */}
      <Link
        to="/records"
        style={{
          display: 'inline-block',
          marginBottom: '15px',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          textDecoration: 'none',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      >
        ← 一覧に戻る
      </Link>
      <h1>新規投資記録の追加</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        {/* 銘柄選択用ListBox - ChartShapeChecker由来 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ChartShapeChecker から呼び出し:</label>
          <select
            onChange={handleChartTickerSelect}
            className="w-full p-2 border rounded"
          >
            <option value="">-- 銘柄を選択して入力項目を埋める --</option>
            {chartTickers.map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} - {t.name}
              </option>
            ))}
          </select>
        </div>
        {/* 銘柄選択用ListBox */}
        <div>
          <label>銘柄リストから選択:</label>
          <select name="tickerSelector" onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- 銘柄を選択 --</option>
            {/* ここで ?. を使い、配列でない場合も考慮する */}
            {Array.isArray(tickers) && tickers?.map(t => (
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
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          {prefill ? (
            // ★ここが「決済取引」として登録するボタン
            <button
              type="submit"
              onClick={() => setFormData(prev => ({ ...prev, isPositionClose: true }))}
              style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              決済取引として登録（収支を記録）
            </button>
          ) : (
            <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
              記録を保存
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RecordFormPage;
