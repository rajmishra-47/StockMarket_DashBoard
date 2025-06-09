// SPDX-FileCopyrightText: Copyright (c) 2024-present unoptimized
//
// SPDX-License-Identifier: MIT
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart } from "@/components/ui/pie-chart";

import { SearchResults } from "@/components/generative-ui/SearchResults";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { CopilotReadableDashboardData, HistoricalDataItem, WatchlistItem, PortfolioAllocationItem, IpoCalendarItem, LivePriceItem, CopilotReadableDashboardMetrics } from "@/types/dashboard";

import {
  ArrowDownToDot,
  ArrowUpFromDot,
  CalendarDays,
  Info,
  Newspaper,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

// Interface definitions are now in "@/types/dashboard"
// Types will be applied to useState calls and function return/parameters as needed.

// const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY; // Removed, backend handles this
// const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY; // Removed, backend handles this

// Define a user's portfolio (example)
const userPortfolio = [
  { ticker: "AAPL", shares: 50, avgCost: 150 },
  { ticker: "MSFT", shares: 30, avgCost: 200 },
  { ticker: "GOOGL", shares: 20, avgCost: 1000 },
  // Add more holdings as needed
];

const Dashboard = () => {
  const [sp500HistoricalData, setSp500HistoricalData] = useState<
    HistoricalDataItem[]
  >([]);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState(0);
  const [dayGainLossAmount, setDayGainLossAmount] = useState(0);
  const [dayGainLossPercentage, setDayGainLossPercentage] = useState(0);
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [totalReturnPercentage, setTotalReturnPercentage] = useState(0);

  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([]);
  const [portfolioAllocationData, setPortfolioAllocationData] = useState<
    PortfolioAllocationItem[]
  >([]);
  const [ipoCalendarData, setIpoCalendarData] = useState<IpoCalendarItem[]>(
    [],
  );
  const [livePrices, setLivePrices] = useState<LivePriceItem>({});
  const [totalMarketVolume, setTotalMarketVolume] = useState(0);
  const [portfolioYield, setPortfolioYield] = useState(0);
  const [sp500Current, setSp500Current] = useState(0);
  const [sp500Change, setSp500Change] = useState(0);
  const [sp500ChangePercent, setSp500ChangePercent] = useState(0);

  // Error states
  const [sp500HistoricalError, setSp500HistoricalError] = useState<string | null>(null);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [ipoCalendarError, setIpoCalendarError] = useState<string | null>(null);
  const [livePricesError, setLivePricesError] = useState<string | null>(null);

  useCopilotReadable({
    description: "Current S&P 500 historical data.",
    value: sp500HistoricalData,
  });

  useCopilotReadable({
    description: "Current watchlist data.",
    value: watchlistData,
  });

  useCopilotReadable({
    description: "Current portfolio allocation data.",
    value: portfolioAllocationData,
  });

  useCopilotReadable({
    description: "Current IPO calendar data.",
    value: ipoCalendarData,
  });

  useCopilotReadable({
    description: "Current live prices.",
    value: livePrices,
  });

  useCopilotReadable({
    description: "Current portfolio metrics.",
    value: {
      currentPortfolioValue,
      dayGainLossAmount,
      dayGainLossPercentage,
      totalReturnAmount,
      totalReturnPercentage,
      sp500Current,
      sp500Change,
      sp500ChangePercent,
      totalMarketVolume,
      portfolioYield,
    },
  });

  useCopilotAction({
    name: "searchInternet",
    description: "Performs a search on the internet for general information.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query.",
        required: true,
      },
    ],
    handler: async ({ query }) => {
      // This action will be handled by the backend.
      // The frontend definition is for UI/UX purposes.
      console.log(
        `Frontend: searchInternet action called with query - ${query}. Forwarding to backend.`,
      );
      // Optionally, you can give immediate feedback to the user here.
      // The actual search logic is in the backend.
    },
    render: (props) => {
      if (props.status === "running") {
        return <p>Searching the internet...</p>;
      }
      if (props.status === "complete" && props.data) {
        return <SearchResults results={props.data.searchResults} />;
      }
      return null;
    },
  });

  useEffect(() => {
    // Fetch S&P 500 Historical Data (Daily for 1 year) - Now from backend
    const fetchSP500Data = async () => {
      setSp500HistoricalError(null); // Clear previous error
      try {
        const response = await fetch('/api/data/sp500-historical');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: `Failed to fetch S&P500 history: ${response.status}` }));
          throw new Error(errData?.error || `Failed to fetch S&P500 history: ${response.status}`);
        }
        const data: HistoricalDataItem[] = await response.json();
        setSp500HistoricalData(data);
        if (data.length > 0) {
          const current = data[data.length - 1].value;
          const previous = data.length > 1 ? data[data.length - 2].value : current;
          setSp500Current(current);
          setSp500Change(current - previous);
          setSp500ChangePercent(previous !== 0 ? ((current - previous) / previous) * 100 : 0);
        } else {
          console.warn("S&P 500 data from backend is empty.");
          // Optionally set a specific message if empty data is considered an error/issue
          // setSp500HistoricalError("S&P 500 data is currently unavailable.");
        }
      } catch (error) {
        console.error("Error fetching S&P500 historical data from backend:", error);
        setSp500HistoricalError((error as Error).message || "Failed to load S&P 500 trend data.");
        setSp500HistoricalData([]);
      }
    };

    // Fetch Watchlist Data, Portfolio Quotes, and SPY for market volume
    const fetchWatchlistAndPortfolioQuotes = async () => {
      setQuotesError(null); // Clear previous error
      let hadIndividualQuoteError = false;
      const watchlistTickers = ["GOOGL"];
      const portfolioTickers = userPortfolio.map(holding => holding.ticker);
      const allTickersToFetch = Array.from(new Set([...watchlistTickers, ...portfolioTickers, "SPY"]));

      const quotePromises = allTickersToFetch.map(async (ticker) => {
        try {
          const response = await fetch(`/api/data/quote/${ticker}`);
          if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: `Failed to fetch quote for ${ticker}: ${response.status}` }));
            throw new Error(errData?.error || `Failed to fetch quote for ${ticker}: ${response.status}`);
          }
          return await response.json() as WatchlistItem;
        } catch (error) {
          console.error(`Error fetching quote for ${ticker} from backend:`, error);
          hadIndividualQuoteError = true;
          return { ticker, error: true, message: (error as Error).message } as WatchlistItem;
        }
      });

      const fetchedQuotes: WatchlistItem[] = await Promise.all(quotePromises);

      if (hadIndividualQuoteError) {
        // Set a general quotes error if any individual quote failed, or aggregate messages
        setQuotesError("Some stock data may be missing or incomplete.");
      }

      // Process SPY data for market volume
      const spyData = fetchedQuotes.find(item => item.ticker === 'SPY' && !item.error);
      if (spyData && typeof spyData.volume === 'number') {
        setTotalMarketVolume(spyData.volume);
      }

      // Update watchlistData state (excluding portfolio items and SPY unless they are also in watchlistTickers)
      const actualWatchlistData = fetchedQuotes.filter(q => watchlistTickers.includes(q.ticker) && !q.error);
      setWatchlistData(actualWatchlistData);

      // Calculate Portfolio Metrics
      let calculatedPortfolioValue = 0;
      let previousDayPortfolioValue = 0;
      const validPortfolioQuotes = fetchedQuotes.filter(q => portfolioTickers.includes(q.ticker) && !q.error);

      userPortfolio.forEach(holding => {
        const quote = validPortfolioQuotes.find(q => q.ticker === holding.ticker);
        if (quote) {
          calculatedPortfolioValue += holding.shares * quote.currentPrice;
          previousDayPortfolioValue += holding.shares * quote.previousClose;
        } else {
          // If quote is missing for a holding, use its average cost for current value (or handle as error)
          // This maintains the holding in the portfolio value rather than ignoring it.
          // For day gain/loss, if previousClose is missing, this holding won't contribute to the change.
          console.warn(`Quote for portfolio holding ${holding.ticker} not found. Using avgCost for value calculation.`);
          calculatedPortfolioValue += holding.shares * holding.avgCost;
          // previousDayPortfolioValue might not be accurately calculable without previousClose.
          // One option is to assume no change if quote is missing, or fetch it separately if critical.
          // For simplicity here, if quote.previousClose is missing, it won't contribute to previousDayPortfolioValue sum.
        }
      });

      setCurrentPortfolioValue(calculatedPortfolioValue);

      if (previousDayPortfolioValue > 0) {
        const newDayGainLossAmount = calculatedPortfolioValue - previousDayPortfolioValue;
        setDayGainLossAmount(newDayGainLossAmount);
        setDayGainLossPercentage((newDayGainLossAmount / previousDayPortfolioValue) * 100);
      } else if (calculatedPortfolioValue > 0) { // Handle if previous day value is zero (e.g. new portfolio)
        setDayGainLossAmount(0); // Or calculatedPortfolioValue if you consider all of it as gain from 0
        setDayGainLossPercentage(0); // Or 100% if all gain
      } else {
        setDayGainLossAmount(0);
        setDayGainLossPercentage(0);
      }

      // Calculate Dynamic Portfolio Allocation
      if (calculatedPortfolioValue > 0) {
        const newPortfolioAllocationData = userPortfolio.map(holding => {
          const quote = validPortfolioQuotes.find(q => q.ticker === holding.ticker);
          const currentValue = holding.shares * (quote ? quote.currentPrice : holding.avgCost);
          return {
            name: holding.ticker,
            value: (currentValue / calculatedPortfolioValue) * 100, // Value as percentage
          };
        });
        setPortfolioAllocationData(newPortfolioAllocationData.filter(item => item.value > 0));
      } else {
        setPortfolioAllocationData([]);
      }
    };

    // This function is now effectively replaced by the logic within fetchWatchlistAndPortfolioQuotes
    const fetchPortfolioAllocation = () => {
      // console.log("Portfolio allocation is now dynamically calculated."); // Removed for cleanup
    };

    // Fetch IPO Calendar (Upcoming week) - Now from backend
    const fetchIpoCalendar = async () => {
      setIpoCalendarError(null); // Clear previous error
      try {
        const response = await fetch('/api/data/ipo-calendar');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: `Failed to fetch IPO calendar: ${response.status}` }));
          throw new Error(errData?.error || `Failed to fetch IPO calendar: ${response.status}`);
        }
        const data: IpoCalendarItem[] = await response.json();
        setIpoCalendarData(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching IPO Calendar from backend:", error);
        setIpoCalendarError((error as Error).message || "Failed to load IPO calendar data.");
        setIpoCalendarData([]);
      }
    };

    // Fetch Total Market Volume - This is now handled by fetching SPY quote in fetchWatchlistData
    const fetchMarketVolume = async () => {
      // This function is now a stub as its functionality is merged into fetchWatchlistData
      // by fetching SPY's volume.
      // If a separate, more complex market volume calculation was needed (e.g., summing multiple ETFs),
      // it would require its own backend endpoint and logic.
      console.log("Market volume is now derived from SPY quote in fetchWatchlistData.");
    };


    // Fetch Portfolio Yield (Mock Data)
    const fetchPortfolioYield = () => {
      setPortfolioYield(2.5); // Example: 2.5%
    };

    // This function is now effectively replaced by the logic within fetchWatchlistAndPortfolioQuotes
    const calculatePortfolioMetrics = () => {
      // console.log("Portfolio metrics (value, day gain/loss) are now dynamically calculated."); // Removed for cleanup
      // Static total return and yield will remain for now.
      setTotalReturnAmount(25000);
      setTotalReturnPercentage(20);
    };


    fetchSP500Data();
    fetchWatchlistAndPortfolioQuotes(); // Renamed and now handles portfolio
    fetchPortfolioAllocation(); // This is now just a console.log
    fetchIpoCalendar();
    fetchMarketVolume();
    fetchPortfolioYield();
    calculatePortfolioMetrics();

    // Setup WebSocket for Live Prices - Now through backend proxy
    // const VITE_BACKEND_WS_PORT = import.meta.env.VITE_BACKEND_WS_PORT || '3001';
    // const socketUrl = `ws://localhost:${VITE_BACKEND_WS_PORT}/api/liveprices`;
    // Using fixed port for now as import.meta.env is not directly usable in this environment without further setup for the agent
    const socketUrl = `ws://localhost:3001/api/liveprices`;
    const socket = new WebSocket(socketUrl);

    setLivePricesError(null); // Clear previous error on new attempt

    socket.onopen = () => {
      console.log("Connected to backend WebSocket proxy.");
      setLivePricesError(null); // Clear error on successful connection
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data as string);

      if (message.type === 'status') {
        console.log('Status from WebSocket proxy:', message.message);
        if (message.message.includes('Finnhub connection lost')) {
            setLivePricesError('Live price feed temporarily unavailable.');
        }
      } else if (message.type === 'error') {
        console.error('Error from WebSocket proxy:', message.message);
        setLivePricesError(message.message || 'Live price connection error.');
      } else if (message.type === "trade" && message.data) {
        setLivePrices((prevPrices) => {
          const newPrices = { ...prevPrices };
          message.data.forEach((trade: any) => {
            newPrices[trade.s] = trade.p.toFixed(2);
          });
          return newPrices as LivePriceItem;
        });
        setLivePricesError(null); // Clear error on successful data
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket proxy error:", error);
      setLivePricesError("Failed to connect to live price feed.");
    };

    socket.onclose = () => {
      console.log("Disconnected from backend WebSocket proxy.");
      // Consider setting an error or status message if the disconnection was unexpected
      // For now, only an explicit error from onerror or onmessage sets livePricesError
    };

    return () => {
      console.log("Closing frontend WebSocket connection to proxy.");
      socket.close();
    };
    // The old 'else' block for mock prices is removed as the proxy should always be available if backend is up.
    // If backend WS isn't up, it will just fail to connect.
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Portfolio Value
              <Wallet className="h-6 w-6 text-blue-500" />
            </CardTitle>
            <CardDescription>Total value of your investments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${currentPortfolioValue.toLocaleString()}
            </p>
            <div className="flex items-center text-sm text-green-500">
              {dayGainLossAmount >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownToDot className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span>
                {dayGainLossAmount >= 0 ? "+" : ""}
                {dayGainLossAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ({dayGainLossPercentage.toFixed(2)}%) Today
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Total Return: ${totalReturnAmount.toLocaleString()}{" "}
              ({totalReturnPercentage.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              S&P 500 Index
              <TrendingUp className="h-6 w-6 text-green-500" />
            </CardTitle>
            <CardDescription>Market benchmark performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${sp500Current.toFixed(2)}</p>
            <div className={`flex items-center text-sm ${sp500Change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {sp500Change >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownToDot className="mr-1 h-4 w-4" />
              )}
              <span>
                {sp500Change >= 0 ? "+" : ""}
                {sp500Change.toFixed(2)} ({sp500ChangePercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-xs text-gray-500">Last trading day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Total Market Volume
              <Users className="h-6 w-6 text-purple-500" />
            </CardTitle>
            <CardDescription>Overall trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(totalMarketVolume / 1e9).toFixed(2)}B
            </p>
            <p className="text-xs text-gray-500">
              Estimated volume across major exchanges
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            S&P 500 Performance (1 Year)
          </CardTitle>
          <CardDescription>
            Historical daily closing prices for the S&P 500 index.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          {sp500HistoricalError ? (
            <p className="text-red-500 text-center py-10">{sp500HistoricalError}</p>
          ) : sp500HistoricalData && sp500HistoricalData.length > 0 ? (
            <AreaChart
              data={sp500HistoricalData}
              categories={["value"]}
              index="date"
              colors={["blue"]}
              valueFormatter={(val) => `$${val.toFixed(2)}`}
            />
          ) : (
            <p className="text-center text-gray-500 py-10">S&P 500 historical data not available or loading...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
            <CardDescription>Stocks you are tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {quotesError && !watchlistData.length ? ( // Show general quotes error if watchlist is empty due to it
                <p className="text-red-500 text-center py-4">{quotesError}</p>
            ) : watchlistData.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {watchlistData.map((item) => (
                  <li key={item.ticker} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.ticker}</span>
                      <span className="font-semibold">
                        ${item.currentPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className={`text-sm ${ (item.dayChangePercent ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.dayChangeAbsolute?.toFixed(2)} (
                      {item.dayChangePercent?.toFixed(2)}%)
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No watchlist data available.</p>
            )}
            {quotesError && watchlistData.length > 0 && ( // Show error at bottom if some data loaded but other quotes failed
                 <p className="text-red-500 text-xs pt-2">{quotesError}</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Portfolio Allocation
              <Target className="h-6 w-6 text-orange-500" />
            </CardTitle>
            <CardDescription>Asset class distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <DonutChart
              data={portfolioAllocationData}
              category="value"
              index="name"
              colors={["blue", "green", "indigo", "yellow", "pink"]}
              variant="pie" // "pie" for actual pie chart if Donut is specific
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Live Prices
              <Newspaper className="h-6 w-6 text-teal-500" />
            </CardTitle>
            <CardDescription>Real-time market data</CardDescription>
          </CardHeader>
          <CardContent>
            {livePricesError ? (
              <p className="text-red-500 text-center py-4">{livePricesError}</p>
            ) : Object.keys(livePrices).length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {Object.entries(livePrices).map(([symbol, price]) => (
                  <li key={symbol} className="flex justify-between py-2">
                    <span className="text-sm font-medium">{symbol}</span>
                    <span className="text-sm font-semibold">${price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">Live prices connecting or unavailable...</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Upcoming IPOs
              <CalendarDays className="h-6 w-6 text-red-500" />
            </CardTitle>
            <CardDescription>
              Initial Public Offerings this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ipoCalendarError ? (
              <p className="text-red-500 text-center py-4">{ipoCalendarError}</p>
            ) : ipoCalendarData.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {ipoCalendarData.map((ipo, index) => (
                  <li key={ipo.symbol || index} className="py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {ipo.name} ({ipo.symbol || "N/A"})
                      </span>
                      <span className="text-sm text-gray-600">{ipo.date}</span>
                    </div>
                    {ipo.price && (
                      <p className="text-sm text-gray-500">
                        Expected Price: {ipo.price}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No upcoming IPOs found for this week.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              Key Metrics
              <Info className="h-6 w-6 text-yellow-500" />
            </CardTitle>
            <CardDescription>Other important indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Portfolio Yield:</span>
                <span className="font-semibold">{portfolioYield.toFixed(2)}%</span>
              </div>
              {/* Add more metrics here as needed */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
