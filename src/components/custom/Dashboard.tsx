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

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const MARKETSTACK_API_KEY = process.env.NEXT_PUBLIC_MARKETSTACK_API_KEY;

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
    // Fetch S&P 500 Historical Data (Daily for 1 year)
    const fetchSP500Data = async () => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 365 * 24 * 60 * 60; // 1 year ago
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=^GSPC&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
        );
        const data = await response.json();
        if (data.s === "ok" && data.c) {
          const formattedData: HistoricalDataItem[] = data.t.map((timestamp: number, i: number) => ({
            date: new Date(timestamp * 1000).toLocaleDateString(),
            value: data.c[i],
          }));
          setSp500HistoricalData(formattedData);
          if (data.c.length > 0) {
            const current = data.c[data.c.length - 1];
            const previous = data.c[data.c.length - 2] || data.o[data.c.length -1]; // Fallback to open if no previous close
            setSp500Current(current);
            setSp500Change(current - previous);
            setSp500ChangePercent(((current - previous) / previous) * 100);
          }
        } else {
          console.error("Failed to fetch S&P 500 data or data is empty:", data);
        }
      } catch (error) {
        console.error("Error fetching S&P 500 data:", error);
      }
    };

    // Fetch Watchlist Data (Example: AAPL, MSFT, GOOGL)
    const fetchWatchlistData = async () => {
      const tickers = ["AAPL", "MSFT", "GOOGL"];
      const watchlistPromises = tickers.map(async (ticker) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
          );
          const data = await response.json();
          return {
            ticker,
            currentPrice: data.c,
            dayChangeAbsolute: data.d,
            dayChangePercent: data.dp,
            previousClose: data.pc,
          } as WatchlistItem);
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error);
          return { ticker, currentPrice: 0 } as WatchlistItem; // Return a default object on error
        }
      });
      const results: WatchlistItem[] = await Promise.all(watchlistPromises);
      setWatchlistData(results);
    };

    // Fetch Portfolio Allocation (Mock Data)
    const fetchPortfolioAllocation = () => {
      setPortfolioAllocationData([
        { name: "Technology", value: 40 },
        { name: "Healthcare", value: 20 },
        { name: "Finance", value: 15 },
        { name: "Consumer Goods", value: 15 },
        { name: "Other", value: 10 },
      ] as PortfolioAllocationItem[]);
    };

    // Fetch IPO Calendar (Upcoming week)
    const fetchIpoCalendar = async () => {
      const today = new Date();
      const nextWeek = new Date(today.setDate(today.getDate() + 7));
      const from = today.toISOString().split("T")[0];
      const to = nextWeek.toISOString().split("T")[0];
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
        );
        const data = await response.json();
        if (data && data.ipoCalendar) {
          setIpoCalendarData(
            data.ipoCalendar.slice(0, 5).map((ipo: any) => ({ // Limit to 5 for display
              symbol: ipo.symbol,
              name: ipo.name,
              date: ipo.date,
              price: ipo.price,
            } as IpoCalendarItem)),
          );
        } else {
          console.error("No IPO data found for the period.");
          setIpoCalendarData([] as IpoCalendarItem[]);
        }
      } catch (error) {
        console.error("Error fetching IPO calendar:", error);
        setIpoCalendarData([] as IpoCalendarItem[]);
      }
    };

    // Fetch Total Market Volume (Example using Marketstack for broader market data)
    // Note: Marketstack's free plan might not offer real-time total volume directly.
    // This is a conceptual example; you might need to adjust based on API capabilities.
    const fetchMarketVolume = async () => {
      try {
        // Using end-of-day data for major exchanges as a proxy.
        // Marketstack API structure: http://api.marketstack.com/v1/eod?access_key=YOUR_ACCESS_KEY&symbols=AAPL,MSFT
        // This example will sum volumes for a few major ETFs as a proxy for market volume.
        const majorETFs = ["SPY", "QQQ", "DIA"]; // SPDR S&P 500, Invesco QQQ, SPDR Dow Jones
        let totalVolume = 0;
        // Note: Marketstack free tier usually has limitations (e.g., specific exchanges, historical data only)
        // This is a simplified example. A real implementation might need a different approach or paid API.
        if (!MARKETSTACK_API_KEY) {
            console.warn("Marketstack API key not configured. Skipping market volume fetch.");
            setTotalMarketVolume(5.2e9); // Placeholder if no key
            return;
        }

        const responses = await Promise.all(
          majorETFs.map(etf =>
            fetch(`http://api.marketstack.com/v1/eod/latest?access_key=${MARKETSTACK_API_KEY}&symbols=${etf}`)
              .then(res => res.json())
          )
        );

        responses.forEach(response => {
          if (response.data && response.data.length > 0 && response.data[0].volume) {
            totalVolume += response.data[0].volume;
          } else {
            console.warn(`No volume data for a symbol in Marketstack response: `, response);
          }
        });

        if (totalVolume > 0) {
         setTotalMarketVolume(totalVolume);
        } else {
          // Fallback or if all calls failed
          console.warn("Could not fetch significant market volume data. Using placeholder.");
          setTotalMarketVolume(5.2e9); // Placeholder if calls fail or return no volume
        }

      } catch (error) {
        console.error("Error fetching market volume:", error);
        setTotalMarketVolume(5.2e9); // Placeholder on error
      }
    };


    // Fetch Portfolio Yield (Mock Data)
    const fetchPortfolioYield = () => {
      setPortfolioYield(2.5); // Example: 2.5%
    };

    // Simulate Portfolio Metrics Calculation
    const calculatePortfolioMetrics = () => {
      setCurrentPortfolioValue(125000);
      setDayGainLossAmount(1200);
      setDayGainLossPercentage(0.96);
      setTotalReturnAmount(25000);
      setTotalReturnPercentage(20);
    };


    fetchSP500Data();
    fetchWatchlistData();
    fetchPortfolioAllocation();
    fetchIpoCalendar();
    fetchMarketVolume();
    fetchPortfolioYield();
    calculatePortfolioMetrics();

    // Setup WebSocket for Live Prices (Example: Finnhub)
    // Ensure your Finnhub plan supports WebSocket access.
    if (FINNHUB_API_KEY) {
      const socket = new WebSocket(
        `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`,
      );

      socket.onopen = () => {
        console.log("Connected to Finnhub WebSocket");
        // Subscribe to desired symbols - these are examples
        socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }));
        socket.send(JSON.stringify({ type: "subscribe", symbol: "MSFT" }));
        socket.send(JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" }));
        socket.send(JSON.stringify({ type: "subscribe", symbol: "OANDA:XAU_USD" })); // Gold
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data as string);
        if (message.type === "trade" && message.data) {
          setLivePrices((prevPrices) => {
            const newPrices = { ...prevPrices };
            message.data.forEach((trade: any) => {
              newPrices[trade.s] = trade.p.toFixed(2);
            });
            return newPrices as LivePriceItem;
          });
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("Disconnected from Finnhub WebSocket");
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          // Unsubscribe if needed, though closing is usually enough
          socket.send(JSON.stringify({ type: "unsubscribe", symbol: "AAPL" }));
          socket.send(JSON.stringify({ type: "unsubscribe", symbol: "MSFT" }));
          socket.send(JSON.stringify({ type: "unsubscribe", symbol: "BINANCE:BTCUSDT" }));
          socket.send(JSON.stringify({ type: "unsubscribe", symbol: "OANDA:XAU_USD" }));
        }
        socket.close();
      };
    } else {
      console.warn("Finnhub API key not available for WebSocket connection.");
      // Set some mock live prices if WebSocket is not available
      setLivePrices({
        "AAPL": "170.00",
        "MSFT": "420.00",
        "BINANCE:BTCUSDT": "60000.00",
        "OANDA:XAU_USD": "2000.00",
      } as LivePriceItem);
    }
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
          {" "}
          {/* Ensure parent has defined height */}
          <AreaChart
            data={sp500HistoricalData}
            categories={["value"]}
            index="date"
            colors={["blue"]}
            valueFormatter={(val) => `$${val.toFixed(2)}`}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
            <CardDescription>Stocks you are tracking</CardDescription>
          </CardHeader>
          <CardContent>
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
            <ul className="divide-y divide-gray-200">
              {Object.entries(livePrices).map(([symbol, price]) => (
                <li key={symbol} className="flex justify-between py-2">
                  <span className="text-sm font-medium">{symbol}</span>
                  <span className="text-sm font-semibold">${price}</span>
                </li>
              ))}
            </ul>
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
            {ipoCalendarData.length > 0 ? (
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
              <p className="text-sm text-gray-500">No upcoming IPOs found for this week.</p>
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
