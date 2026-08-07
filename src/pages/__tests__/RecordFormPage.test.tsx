import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordFormPage from '../RecordFormPage';
import * as storage from '../../services/storage';

vi.mock('../../services/storage', () => ({
  saveRecordToGAS: vi.fn(),
}));

describe('RecordFormPage.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // fetchのモックを用意（初期表示時のGASおよびChartShapeCheckerからの銘柄読み込み用）
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('sheet=ChartShapeChecker')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ symbol: 'AAPL', name: 'Apple Inc.', ticker: 'AAPL' }],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ ticker: 'TSLA', symbolName: 'Tesla Inc.' }],
      });
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('should render form fields correctly', async () => {
    render(
      <MemoryRouter>
        <RecordFormPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '新規投資記録の追加' })).toBeInTheDocument();
    expect(screen.getByLabelText('銘柄名:')).toBeInTheDocument();
    expect(screen.getByLabelText('ティッカー:')).toBeInTheDocument();
    expect(screen.getByLabelText('取引日付:')).toBeInTheDocument();
    expect(screen.getByLabelText('取引種別:')).toBeInTheDocument();
    expect(screen.getByLabelText('価格:')).toBeInTheDocument();
    expect(screen.getByLabelText('理由:')).toBeInTheDocument();
  });

  it('should fill form and submit successfully', async () => {
    const user = userEvent.setup();
    const saveMock = vi.spyOn(storage, 'saveRecordToGAS').mockResolvedValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <RecordFormPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('銘柄名:'), 'Apple Inc.');
    await user.type(screen.getByLabelText('ティッカー:'), 'AAPL');
    await user.type(screen.getByLabelText('取引日付:'), '2026-08-07');
    await user.selectOptions(screen.getByLabelText('取引種別:'), 'BUY');
    await user.type(screen.getByLabelText('価格:'), '150');
    await user.type(screen.getByLabelText('理由:'), 'Strong support level');

    const submitBtn = screen.getByRole('button', { name: '記録を保存' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('スプレッドシートに保存しました！[saveRecordToGAS]');
    });
  });
});
