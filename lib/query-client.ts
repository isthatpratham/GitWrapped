import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive refetching on public dashboard focus
      retry: 1,                    // Limit retries for cleaner error handling and rate limit safety
      staleTime: 1000 * 60 * 5,    // 5 minutes caching by default
    },
  },
});
