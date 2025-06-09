require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CopilotRuntime } = require('@copilotkit/runtime');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

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
          // Placeholder for actual search logic using Tavily
          // This will be properly implemented when API keys are handled
          if (!process.env.TAVILY_API_KEY) {
            console.error("Tavily API key not set for backend searchInternet action.");
            return { error: "Search API key not configured on backend." };
          }
          // Simulate Tavily call for now
          try {
            // const tavily = new TavilyResearch(process.env.TAVILY_API_KEY);
            // const result = await tavily.search(query, { maxResults: 5 });
            // return { searchResults: result };
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

app.listen(port, () => {
  console.log(`CopilotKit backend listening at http://localhost:${port}`);
});
