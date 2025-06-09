// SPDX-FileCopyrightText: Copyright (c) 2024-present unoptimized
//
// SPDX-License-Identifier: MIT
import { Globe } from "lucide-react";

interface SearchResultItem {
  title: string;
  url?: string; // Not always present in all search result types
  content?: string; // Or description, snippet, etc.
  source?: string; // e.g. "Google", "Wikipedia" - if available from API
  [key: string]: any; // Allow other properties
}

interface SearchResultsProps {
  results: SearchResultItem[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  if (!results || results.length === 0) {
    return <p className="text-sm text-gray-500">No search results to display.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Search Results:</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <a
              href={result.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-blue-500" />
                <h4 className="truncate text-base font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                  {result.title || "Untitled Result"}
                </h4>
              </div>
            </a>
            {result.content && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {result.content.substring(0, 150)}
                {result.content.length > 150 && "..."}
              </p>
            )}
            {result.source && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Source: {result.source}
                </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
