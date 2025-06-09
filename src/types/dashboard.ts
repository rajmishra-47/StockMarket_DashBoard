// src/types/dashboard.ts
export interface CopilotReadableDashboardMetrics {
  currentPortfolioValue: number;
  dayGainLossAmount: number;
  dayGainLossPercentage: number;
  totalReturnAmount: number;
  totalReturnPercentage: number;
  sp500Current: number;
  sp500Change: number;
  sp500ChangePercent: number;
  totalMarketVolume: number;
  portfolioYield: number;
}

export interface HistoricalDataItem {
  date: string;
  value: number;
  [key: string]: any; // Allow other properties if needed by charts
}

export interface WatchlistItem {
  ticker: string;
  currentPrice: number;
  dayChangeAbsolute?: number;
  dayChangePercent?: number;
  previousClose?: number;
  [key: string]: any;
}

export interface PortfolioAllocationItem {
  name: string; // e.g., stock ticker or asset class
  value: number; // e.g., percentage or monetary value
  [key: string]: any;
}

export interface IpoCalendarItem {
  symbol?: string;
  name: string;
  date: string;
  price?: string;
  [key: string]: any;
}

export interface LivePriceItem {
  [key: string]: string | number; // e.g., { "OANDA:XAU_USD": 1980.50 }
}

export interface CopilotReadableDashboardData {
  sp500HistoricalData: HistoricalDataItem[];
  watchlistData: WatchlistItem[];
  portfolioAllocationData: PortfolioAllocationItem[];
  ipoCalendarData: IpoCalendarItem[];
  livePrices: LivePriceItem;
  metrics: CopilotReadableDashboardMetrics;
}

// For Copilot Actions, as per the integration guide
export interface CopilotActionParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface CopilotActionConfig<T extends Record<string, any> = any> {
  name: string;
  description: string;
  parameters: CopilotActionParameter[];
  category?: string;
  initialState?: any;
  available?: "enabled" | "disabled" | "requires_confirmation";
  handler?: (args: T) => Promise<any | string | void> | any | string | void;
  render?: React.ComponentType<any> | ((props: { args: T; status: string; }) => React.ReactNode);
}
