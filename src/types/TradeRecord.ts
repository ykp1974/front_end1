export type TradeType = "BUY" | "SELL";

export type TradeRecord = {
  id: string;
  symbolName: string;
  ticker: string;
  tradeDate: string;
  tradeType: TradeType;
  price: number;
  reason: string;
  createdAt: string;
};
