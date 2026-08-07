import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordDetailPage from '../RecordDetailPage';
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
    ticker: 'AAPL',
    tradeDate: '2026-08-02',
    tradeType: 'SELL',
    price: 160,
    reason: 'Take profit',
    createdAt: '2026-08-02T10:00:00Z',
  },
];

describe('RecordDetailPage.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading initially and display data after fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRecords,
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/records/1']}>
        <Routes>
          <Route path="/records/:id" element={<RecordDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Test Stock A (AAPL)' })).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Good entry')).toBeInTheDocument();
    
    // 同一ティッカーの関連レコードが表示されていることを確認
    expect(screen.getByText('Test Stock B')).toBeInTheDocument();
  });

  it('should calculate profit when user inputs current price', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRecords,
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/records/1']}>
        <Routes>
          <Route path="/records/:id" element={<RecordDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('現在値を入力');
    await user.type(input, '175');

    // 利益計算 (175 - 150 = 25)
    expect(screen.getByText('+25 円')).toBeInTheDocument();
  });
});
