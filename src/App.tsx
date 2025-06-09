import React from 'react'; // Removed useState
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { Dashboard } from "@/components/custom/Dashboard";
import { CopilotActionConfig } from "@/types/dashboard"; // For defining actions
// SearchResults is used by Dashboard's internal useCopilotAction, not directly here.
// However, keeping it if global actions might render it in the future.
import { SearchResults } from "@/components/generative-ui/SearchResults";

import Navbar from './components/custom/Navbar';

import './App.css'; // Or your main app styles

function App() {
  // Define actions for Copilot as per the integration guide
  // Note: Currently, Dashboard.tsx defines its own 'searchInternet' action.
  // These global actions would be used if passed to CopilotKitProvider or a specific component.
  const dashboardActions: CopilotActionConfig<any>[] = [
    {
      name: "searchInternet",
      description: "Searches the internet for information based on a query.",
      parameters: [
        { name: "query", type: "string", description: "The query to search for.", required: true }
      ],
      // The render function in Dashboard.tsx's useCopilotAction will handle displaying SearchResults
      // So, we don't need to specify a render function here if the action is defined within Dashboard.
      // If this action were defined globally and passed to CopilotKitProvider, then a render here might be useful.
      // For actions defined directly within components (like in Dashboard.tsx), the component's render definition takes precedence.
    },
    // Add more custom actions here if needed for global context
  ];

  return (
    <CopilotKit runtimeUrl="http://localhost:3001/api/copilotkit">
      <div className="app-container flex flex-col h-screen"> {/* Modified for flex column layout */}
        <div className='text-left'>
          <Navbar />
        </div>

        <div className="flex flex-1 overflow-hidden"> {/* Flex row for sidebar and main content */}
          <main className="flex-grow p-4 overflow-auto">
            {/* The h1 title is removed as Dashboard might have its own */}
            <Dashboard
              // copilotReadableDescription, copilotReadableData, and copilotActions are managed within Dashboard.tsx
              // If we wanted to pass global actions, we would pass them here.
              // For now, Dashboard.tsx defines its own actions.
            />
          </main>
          <CopilotSidebar
            labels={{
              title: "Dashboard AI Assistant",
              initial: "Hello! Ask me about the data in the dashboard, or use actions like 'searchInternet'.",
            }}
            // defaultOpen={true} // Optional: for easier debugging
          />
        </div>
      </div>
    </CopilotKit>
  );
}

export default App;
