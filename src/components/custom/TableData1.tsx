import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StockData {
  symbol: string;
  close: number;
  change: number;
  percent_change: string;
}

interface ChartPoint {
  time: string;
  price: number;
}

const stockSymbols = ['SPY', 'QQQ', 'DIA', 'USO', 'GLD', 'SLV'];
const cryptoSymbols = ['BTC'];
const ALPHA_API_KEY = 'YHVUW56SKGJ1R8CM';

type TimeFrame = '1D' | '1W' | '1M';

export default function TableData1() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [getSymbol, setSymbol] = useState("SPY");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');

  
  useEffect(() => {
    const fetchQuote = async (symbol: string): Promise<StockData | null> => {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d0l2pb9r01qhb025up3gd0l2pb9r01qhb025up40`);
        const data = await res.json();
        if (!data || data.c === undefined) return null;

        return {
          symbol,
          close: data.c,
          change: data.d,
          percent_change: (data.dp).toFixed(2) + '%',
        };
      } catch (err) {
        console.error(`Error fetching stock ${symbol}`, err);
        return null;
      }
    };

    const fetchAllData = async () => {
      const stocks = await Promise.all(stockSymbols.map(fetchQuote));
      const cryptos = await Promise.all(cryptoSymbols.map(fetchQuote));
      const combined = [...stocks, ...cryptos].filter((d): d is StockData => d !== null);
      setStockData(combined);
    };

    fetchAllData();
  }, []);

  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        let data: any;
        if (timeFrame === '1D') {
          const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${getSymbol}&interval=1min&outputsize=compact&apikey=${ALPHA_API_KEY}`);
          data = await res.json();
          const timeSeries = data['Time Series (1min)'];
          if (!timeSeries) return;

          const chartPoints: ChartPoint[] = Object.entries(timeSeries).map(([time, val]: [string, any]) => ({
            time: time.slice(11, 16),
            price: parseFloat(val["4. close"]),
          }));

          chartPoints.sort((a, b) => a.time.localeCompare(b.time));
          setChartData(chartPoints);
        } else {
         
          const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${getSymbol}&outputsize=full&apikey=${ALPHA_API_KEY}`);
          data = await res.json();
          const timeSeries = data['Time Series (Daily)'];
          if (!timeSeries) return;

          
          let allDates = Object.keys(timeSeries).sort((a, b) => b.localeCompare(a));

          
          let slicedDates: string[];
          if (timeFrame === '1W') {
            slicedDates = allDates.slice(0, 7);
          } else { 
            slicedDates = allDates.slice(0, 30);
          }

          const chartPoints: ChartPoint[] = slicedDates
            .map(date => ({
              time: date.slice(5), 
              price: parseFloat(timeSeries[date]["4. close"]),
            }))
            .reverse(); 

          setChartData(chartPoints);
        }
      } catch (err) {
        console.error("Error fetching chart data", err);
      }
    };

    fetchChartData();
  }, [getSymbol, timeFrame]);

  const getColor = (value: number) => (value >= 0 ? 'text-green-600' : 'text-red-600');

  return (
    <div className='flex justify-center '>
  
      <div className="Tbl">
        <p className='font-bold text-left'>Markets</p>


        <Table className="w-100 h-120">
          <TableBody>
            {stockData.map((stock, index) => (
              <TableRow key={index} className="cursor-pointer" onClick={() => setSymbol(stock.symbol)}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{stock.close.toFixed(2)}</TableCell>
                <TableCell className={getColor(stock.change)}>
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)}
                </TableCell>
                <TableCell className={getColor(parseFloat(stock.percent_change))}>
                  {stock.percent_change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      
      <Card className="mt-6 w-full border-none shadow-none">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>{getSymbol} - {timeFrame} Chart</CardTitle>
          
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" interval="preserveStartEnd" minTickGap={10} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#006400" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex space-x-2 mt-4">
  {(['1D', '1W', '1M'] as TimeFrame[]).map((tf) => (
    <button
      key={tf}
      onClick={() => setTimeFrame(tf)}
      className={`px-4 py-1 rounded font-medium transition-colors duration-200 bg-blue-600 text-white ${
        timeFrame === tf ? 'ring-2 ring-white font-bold' : 'opacity-80'
      }`}
    >
      {tf}
    </button>
  ))}
</div>
        </CardContent>
      </Card>

    </div>
  );
}
