import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  // Temporarily bypass authentication for testing
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 30000, // Reduced frequency
  });

  return {
    user: user || { id: 'temp', username: 'admin', email: 'admin@optistore.com' }, // Temporary user
    isLoading: false, // Skip loading state
    isAuthenticated: true, // Always authenticated for testing
  };
}
