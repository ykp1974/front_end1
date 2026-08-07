import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordListPage from '../RecordListPage';
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
];

describe('RecordListPage.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading status initially', async () => {
    // 解決を遅らせるfetchモック
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <RecordListPage />
      </MemoryRouter>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should render records after successful fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRecords,
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <RecordListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Stock A')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render error message on fetch failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <RecordListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('記録の読み込みに失敗しました。')).toBeInTheDocument();
    });
  });
});
