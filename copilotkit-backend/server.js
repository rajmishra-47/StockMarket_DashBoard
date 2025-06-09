require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CopilotRuntime } = require('@copilotkit/runtime');
const fetch = require('node-fetch');
const { setupWebSocketProxy } = require('./websocket-handler'); // Added

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// New GET endpoint for S&P 500 Historical Data
app.get('/api/data/sp500-historical', async (req, res) => {
  if (!process.env.MARKETSTACK_API_KEY) {
    return res.status(500).json({ error: "Marketstack API key not configured on backend." });
  }

  const todayForApi = new Date();
  const yearAgoForApi = new Date(new Date().setFullYear(todayForApi.getFullYear() - 1));
  const dateTo = todayForApi.toISOString().split('T')[0];
  const dateFrom = yearAgoForApi.toISOString().split('T')[0];
  const marketstackBaseUrl = 'http://api.marketstack.com/v1';
  const url = `${marketstackBaseUrl}/eod?access_key=${process.env.MARKETSTACK_API_KEY}&symbols=SPY&date_from=${dateFrom}&date_to=${dateTo}&limit=365&sort=ASC`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Marketstack API error:", apiResponse.status, errorText);
      return res.status(apiResponse.status).json({ error: `Marketstack API Error: ${apiResponse.status} - ${errorText}` });
    }
    const data = await apiResponse.json();
    const formattedData = (data?.data || []).map(item => ({
      date: item.date.split('T')[0],
      value: parseFloat((item.close || 0).toFixed(2))
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching S&P 500 historical data from Marketstack:", error);
    res.status(500).json({ error: "Failed to fetch S&P 500 historical data." });
  }
});

// New GET endpoint for Stock Quotes
app.get('/api/data/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  if (!process.env.FINNHUB_API_KEY) {
    return res.status(500).json({ error: "Finnhub API key not configured on backend." });
  }

  const finnhubBaseUrl = 'https://finnhub.io/api/v1';
  const url = `${finnhubBaseUrl}/quote?symbol=${symbol.toUpperCase()}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Finnhub API error for ${symbol}:`, apiResponse.status, errorText);
      return res.status(apiResponse.status).json({ error: `Finnhub API Error for ${symbol}: ${apiResponse.status} - ${errorText}` });
    }
    const quoteData = await apiResponse.json();

    const formattedQuote = {
      ticker: symbol.toUpperCase(),
      currentPrice: parseFloat((quoteData.c || 0).toFixed(2)),
      dayChangeAbsolute: parseFloat((quoteData.d || 0).toFixed(2)),
      dayChangePercent: parseFloat((quoteData.dp || 0).toFixed(2)),
      previousClose: parseFloat((quoteData.pc || 0).toFixed(2)),
      volume: quoteData.v || 0, // Add volume here
      timestamp: quoteData.t // Unix timestamp
    };
    res.json(formattedQuote);
  } catch (error) {
    console.error(`Error fetching quote for ${symbol} from Finnhub:`, error);
    res.status(500).json({ error: `Failed to fetch quote for ${symbol}.` });
  }
});

// New GET endpoint for IPO Calendar
app.get('/api/data/ipo-calendar', async (req, res) => {
  if (!process.env.FINNHUB_API_KEY) {
    return res.status(500).json({ error: "Finnhub API key not configured on backend." });
  }

  const finnhubBaseUrl = 'https://finnhub.io/api/v1';
  const todayForApi = new Date();
  // Fetch IPOs for the next 30 days (adjust as needed)
  const futureDateIPO = new Date(new Date().setDate(todayForApi.getDate() + 30));
  const fromDateIPO = todayForApi.toISOString().split('T')[0];
  const toDateIPO = futureDateIPO.toISOString().split('T')[0];

  const url = `${finnhubBaseUrl}/calendar/ipo?from=${fromDateIPO}&to=${toDateIPO}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const apiResponse = await fetch(url);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Finnhub API error for IPO Calendar:", apiResponse.status, errorText);
      return res.status(apiResponse.status).json({ error: `Finnhub API Error for IPO Calendar: ${apiResponse.status} - ${errorText}` });
    }
    const ipoData = await apiResponse.json();
    const formattedIpoData = (ipoData?.ipoCalendar || []).map(item => ({
        symbol: item.symbol,
        name: item.name,
        date: item.date,
        price: item.price
    }));
    res.json(formattedIpoData);
  } catch (error) {
    console.error("Error fetching IPO Calendar from Finnhub:", error);
    res.status(500).json({ error: "Failed to fetch IPO Calendar." });
  }
});


// CopilotKit Runtime Endpoint
app.post('/api/copilotkit', async (req, res) => {
  const copilotKit = new CopilotRuntime({
    actions: [
      {
        name: "searchInternet",
        description: "Performs a search on the internet for general information.",
        parameters: [
          { name: "query", type: "string", description: "The search query.", required: true }
        ],
        handler: async ({ query }) => {
          console.log("Backend searchInternet action called with query:", query);
          if (!process.env.TAVILY_API_KEY) {
            console.error("Tavily API key not set for backend searchInternet action.");
            return { error: "Search API key not configured on backend." };
          }
          try {
            console.log(`Simulating Tavily search for: ${query}`);
            return { searchResults: [{title: "Simulated Result", content: `Content for ${query}`}] };
          } catch (error) {
            console.error("Error during simulated Tavily search:", error);
            return { error: "Failed to perform simulated search." };
          }
        }
      }
    ]
  });

  try {
    const result = await copilotKit.response(req, new CopilotRuntime().handler(req.body));
    return res.status(200).send(result);
  } catch (error) {
    console.error("Error processing CopilotKit request:", error);
    return res.status(500).json({ error: "Error processing request" });
  }
});

// Simple root endpoint for testing if the server is up
app.get('/', (req, res) => {
  res.send('CopilotKit Backend is running!');
});

// Start the HTTP server
const httpServer = app.listen(port, () => {
  console.log(`CopilotKit backend listening at http://localhost:${port}`);
  // Setup WebSocket proxy after HTTP server starts
  setupWebSocketProxy(httpServer, process.env.FINNHUB_API_KEY);
});
