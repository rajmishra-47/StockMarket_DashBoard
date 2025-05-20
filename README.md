# Stock Market Dashboard

![Stock Market Dashboard Screenshot](https://github.com/rajmishra-47/StockMarket_DashBoard/blob/main/SSDashboard.png)

## Overview

The **Stock Market Dashboard** is a modern, responsive web application designed to provide users with real-time and historical market insights. Using multiple trusted APIs, the dashboard offers a comprehensive view of the stock market's current status, sector performance, market news, and detailed data for key market indicators.

---

## Features

- **Market Sentiment Indicator:** Quickly see if the overall market is bullish or bearish, helping users gauge current market conditions at a glance.

- **Stock Market News:** Stay updated with the latest market news sourced from [MarketAux](https://api.marketaux.com/), featuring important headlines relevant to the day's market movement.

- **Sector Performance Overview:** Detailed performance metrics of all market sectors and individual sectors sourced from [Financial Modeling Prep](https://financialmodelingprep.com/). Data is presented with color-coded percentage changes to easily identify winners and losers.

- **Market Indicator Data:**
  - Key indicators include SPY 500, Gold (GLD), Nasdaq (QQQ), Bitcoin (BTC), Crude Oil (USO), and others.
  - Display includes current price, absolute and percentage changes.
  - Positive changes shown in green and negative in red for quick readability.

- **Historical Charting:**
  - Interactive OHLC (Open-High-Low-Close) charts powered by data from [Finnhub](https://finnhub.io/api/) and [Alpha Vantage](https://www.alphavantage.co/query).
  - Users can select market indicators to view historical price data.
  - Timeline manipulation with 1 Day, 1 Week, and 1 Month views.

- **User Interaction:**
  - Clickable symbols for market indicators to dynamically update the chart and data.
  - Clean, minimalist UI for intuitive navigation and quick access to vital market data.

---

## Technologies Used

- **Vite:** Fast and modern frontend build tool.
- **React:** Frontend UI library.
- **TypeScript (TSX):** For type-safe component development.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **shadcn/ui:** Accessible and customizable UI components built on Radix UI.
- **APIs:**
  - Market news: [MarketAux API](https://api.marketaux.com/)
  - Sector performance: [Financial Modeling Prep API](https://financialmodelingprep.com/)
  - OHLC data: [Finnhub API](https://finnhub.io/api/)
  - Historical market data: [Alpha Vantage API](https://www.alphavantage.co/query)

---

## Demo

Try out the live demo of the dashboard on Netlify:  
[https://relaxed-maamoul-26f95f.netlify.app](https://relaxed-maamoul-26f95f.netlify.app)

---

## Getting Started - Local Setup

Follow these steps to run the app locally on your machine:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm or yarn package manager
- API keys from the following services:
  - MarketAux
  - Financial Modeling Prep
  - Finnhub
  - Alpha Vantage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rajmishra-47/StockMarket_DashBoard.git
   cd StockMarket_DashBoard
