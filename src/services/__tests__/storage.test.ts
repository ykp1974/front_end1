import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadRecords,
  saveRecords,
  addRecord,
  getRecordById,
  getRecordsByTicker,
  deleteRecord,
  saveRecordToGAS,
} from '../storage';
import type { TradeRecord } from '../../types/TradeRecord';

const mockRecords: TradeRecord[] = [
  {
    id: '1',
    symbolName: 'Test Stock A',
    ticker: 'AAPL',
    tradeDate: '2026-08-01',
    tradeType: 'BUY',
    price: 150,
    reason: 'Good entry',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: '2',
    symbolName: 'Test Stock B',
    ticker: 'TSLA',
    tradeDate: '2026-08-02',
    tradeType: 'SELL',
    price: 700,
    reason: 'Target hit',
    createdAt: '2026-08-02T10:00:00Z',
  },
];

describe('storage.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('loadRecords', () => {
    it('should return empty array if no records in localStorage', () => {
      const records = loadRecords();
      expect(records).toEqual([]);
    });

    it('should load records from localStorage', () => {
      localStorage.setItem('investment_records', JSON.stringify(mockRecords));
      const records = loadRecords();
      expect(records).toEqual(mockRecords);
    });

    it('should return empty array and log error if JSON is invalid', () => {
      localStorage.setItem('investment_records', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const records = loadRecords();
      expect(records).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveRecords', () => {
    it('should save records to localStorage', () => {
      saveRecords(mockRecords);
      const data = localStorage.getItem('investment_records');
      expect(data).toBe(JSON.stringify(mockRecords));
    });
  });

  describe('addRecord', () => {
    it('should add a new record to localStorage and return updated list', () => {
      localStorage.setItem('investment_records', JSON.stringify([mockRecords[0]]));
      const updated = addRecord(mockRecords[1]);
      expect(updated).toEqual(mockRecords);
      
      const stored = JSON.parse(localStorage.getItem('investment_records') || '[]');
      expect(stored).toEqual(mockRecords);
    });
  });

  describe('getRecordById', () => {
    it('should return the correct record by ID', () => {
      localStorage.setItem('investment_records', JSON.stringify(mockRecords));
      const record = getRecordById('2');
      expect(record).toEqual(mockRecords[1]);
    });

    it('should return undefined if ID is not found', () => {
      localStorage.setItem('investment_records', JSON.stringify(mockRecords));
      const record = getRecordById('999');
      expect(record).toBeUndefined();
    });
  });

  describe('getRecordsByTicker', () => {
    it('should return records matching the ticker symbol', () => {
      localStorage.setItem('investment_records', JSON.stringify(mockRecords));
      const records = getRecordsByTicker('AAPL');
      expect(records).toEqual([mockRecords[0]]);
    });
  });

  describe('deleteRecord', () => {
    it('should remove the record with specified ID and return updated list', () => {
      localStorage.setItem('investment_records', JSON.stringify(mockRecords));
      const updated = deleteRecord('1');
      expect(updated).toEqual([mockRecords[1]]);

      const stored = JSON.parse(localStorage.getItem('investment_records') || '[]');
      expect(stored).toEqual([mockRecords[1]]);
    });
  });

  describe('saveRecordToGAS', () => {
    it('should send post request to GAS_BASE_URL and return true', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await saveRecordToGAS(mockRecords[0]);
      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should return false if fetch throws an error', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', fetchMock);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await saveRecordToGAS(mockRecords[0]);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
