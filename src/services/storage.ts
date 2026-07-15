import type { TradeRecord } from '../types/TradeRecord';
import { GAS_BASE_URL } from '../config/gasConfig';

const LOCAL_STORAGE_KEY = 'investment_records';

// const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyWDeWXdvZnfJ2HeIo4lq4otf2Zx1353NKZWmIr7Wsh2XF-0OgRUqxIbj5S682l8iUI/exec';

export const saveRecordToGAS = async (record: TradeRecord): Promise<boolean> => {
  try {
    // 従来のLocalStorageにもバックアップとして残す場合は残す
    // localStorage.setItem(`record_${record.id}`, JSON.stringify(record));

    await fetch(GAS_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ record }),
      mode: 'no-cors', // ブラウザの制限を回避
      headers: {
        'Content-Type': 'text/plain', // プリフライトリクエストを回避
      },
    });

    // 戻り値を判断しない（no-corsのため）
    return true;
  } catch (error) {
    console.error('Network Error:', error);
    return false;
  }
};

/**
 * 全データ取得（GASから読み込む場合）
 */
export const fetchRecordsFromGAS = async (): Promise<TradeRecord[]> => {
  // 必要に応じて doGet(e) をGAS側に実装し、ここでfetchする
  return [];
};

/**
 * LocalStorageから全ての投資記録をロードする。
 * @returns TradeRecordの配列
 */
export const loadRecords = (): TradeRecord[] => {
  try {
    const serializedRecords = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedRecords === null) {
      return [];
    }
    return JSON.parse(serializedRecords) as TradeRecord[];
  } catch (error) {
    console.error("Failed to load records from LocalStorage", error);
    return [];
  }
};

/**
 * 投資記録の配列をLocalStorageに保存する。
 * @param records 保存するTradeRecordの配列
 */
export const saveRecords = (records: TradeRecord[]): void => {
  try {
    const serializedRecords = JSON.stringify(records);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedRecords);
  } catch (error) {
    console.error("Failed to save records to LocalStorage", error);
  }
};

/**
 * 新しい投資記録をLocalStorageに追加する。
 * @param newRecord 追加するTradeRecord
 * @returns 更新されたTradeRecordの配列
 */
export const addRecord = (newRecord: TradeRecord): TradeRecord[] => {
  const records = loadRecords();
  const updatedRecords = [...records, newRecord];
  saveRecords(updatedRecords);
  return updatedRecords;
};

/**
 * IDに基づいて特定の投資記録を取得する。
 * @param id 取得するレコードのID
 * @returns 見つかったTradeRecord、またはundefined
 */
export const getRecordById = (id: string): TradeRecord | undefined => {
  const records = loadRecords();
  return records.find(record => record.id === id);
};

/**
 * 特定のTickerシンボルの投資記録を全て取得する。
 * @param ticker 取得するレコードのTickerシンボル
 * @returns 見つかったTradeRecordの配列
 */
export const getRecordsByTicker = (ticker: string): TradeRecord[] => {
  const records = loadRecords();
  return records.filter(record => record.ticker === ticker);
};

// レコードを削除する関数（将来的に必要になる可能性を考慮して追加）
export const deleteRecord = (id: string): TradeRecord[] => {
  const records = loadRecords();
  const updatedRecords = records.filter(record => record.id !== id);
  saveRecords(updatedRecords);
  return updatedRecords;
};
