// copilotkit-backend/websocket-handler.js
const WebSocket = require('ws');

function setupWebSocketProxy(httpServer, finnhubApiKey) {
  if (!finnhubApiKey) {
    console.error("Finnhub API key not provided for WebSocket proxy. Live prices will not work.");
    return;
  }

  const wss = new WebSocket.Server({ server: httpServer, path: '/api/liveprices' });
  const finnhubUrl = `wss://ws.finnhub.io?token=${finnhubApiKey}`;
  let finnhubSocket;
  let clientSockets = new Set();
  // Define symbols to track here or manage them dynamically based on client requests
  const symbolsToTrack = ['OANDA:XAU_USD', 'OANDA:XAG_USD', 'OANDA:USD_ZAR', 'AAPL', 'MSFT', 'BINANCE:BTCUSDT']; // Added common stocks from original
  let currentSubscriptions = new Set();

  function connectToFinnhub() {
    console.log('Attempting to connect to Finnhub WebSocket...');
    finnhubSocket = new WebSocket(finnhubUrl);

    finnhubSocket.onopen = () => {
      console.log('Connected to Finnhub WebSocket.');
      // Subscribe to initial symbols
      symbolsToTrack.forEach(symbol => {
        if (!currentSubscriptions.has(symbol)) {
          finnhubSocket.send(JSON.stringify({'type':'subscribe', 'symbol': symbol}));
          currentSubscriptions.add(symbol);
          console.log(`Subscribed to ${symbol} on Finnhub.`);
        }
      });
      // If there are clients already connected, inform them
      clientSockets.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'status', message: 'Connected to Finnhub proxy' }));
        }
      });
    };

    finnhubSocket.onmessage = (event) => {
      // Relay message to all connected frontend clients
      const messageStr = event.data instanceof Buffer ? event.data.toString() : event.data;
      clientSockets.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    };

    finnhubSocket.onerror = (error) => {
      console.error('Finnhub WebSocket error:', error.message);
      clientSockets.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'error', message: 'Finnhub connection error.' }));
        }
      });
    };

    finnhubSocket.onclose = () => {
      console.log('Disconnected from Finnhub WebSocket. Attempting to reconnect...');
      currentSubscriptions.clear();
      clientSockets.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'status', message: 'Finnhub connection lost, attempting to reconnect...' }));
        }
      });
      setTimeout(connectToFinnhub, 5000); // Reconnect after 5 seconds
    };
  }

  connectToFinnhub(); // Initial connection

  wss.on('connection', (wsClient) => {
    console.log('Frontend client connected to WebSocket proxy.');
    clientSockets.add(wsClient);

    wsClient.send(JSON.stringify({ type: 'status', message: 'Connected to live price proxy.', tracking: symbolsToTrack }));

    // When a new client connects, if Finnhub is already connected,
    // re-subscribe to ensure the new client gets initial data.
    // Finnhub typically sends the last known price upon a new subscription.
    if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
        console.log('New client connected, re-triggering subscriptions to Finnhub for initial data.');
        symbolsToTrack.forEach(symbol => {
            finnhubSocket.send(JSON.stringify({'type':'subscribe', 'symbol': symbol}));
        });
    } else {
        wsClient.send(JSON.stringify({ type: 'status', message: 'Awaiting connection to Finnhub...' }));
    }

    wsClient.onmessage = (message) => {
      // Handle messages from client if needed (e.g., to change subscriptions dynamically)
      // For now, client-to-server messages are not processed beyond logging (which is now removed).
      // const messageStr = message instanceof Buffer ? message.toString() : message;
      // console.log('Received from client:', messageStr); // Removed for cleanup
      // Example: client wants to subscribe/unsubscribe to a symbol
      // const parsedMessage = JSON.parse(messageStr);
      // if (parsedMessage.type === 'subscribe' && parsedMessage.symbol) {
      //   if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN && !currentSubscriptions.has(parsedMessage.symbol)) {
      //     finnhubSocket.send(JSON.stringify({'type':'subscribe', 'symbol': parsedMessage.symbol}));
      //     currentSubscriptions.add(parsedMessage.symbol);
      //     symbolsToTrack.push(parsedMessage.symbol); // Add to list if dynamically managed
      //     wsClient.send(JSON.stringify({ type: 'status', message: `Subscribed to ${parsedMessage.symbol}`}));
      //   }
      // } // etc.
    };

    wsClient.onclose = () => {
      console.log('Frontend client disconnected.');
      clientSockets.delete(wsClient);
    };

    wsClient.onerror = (error) => {
      console.error('Client WebSocket error:', error.message);
    };
  });

  // The port is derived from the httpServer passed in, so this log is slightly simplified
  console.log(`WebSocket proxy setup complete, will listen on path /api/liveprices`);
  return wss;
}

module.exports = { setupWebSocketProxy };
