export type TradeType = "BUY" | "SELL";

export type TradeRecord = {
  id: string;
  symbolName: string;
  ticker: string;
  tradeDate: string;
  tradeType: 'BUY' | 'SELL';
  price: number;
  reason: string;
  createdAt: string;
  originPrice?: number | null; // ?をつけると省略可能
  isPositionClose?: boolean;
  profit?: number;
};
