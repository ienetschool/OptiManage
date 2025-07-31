// Simple authentication hook without automatic queries to prevent 401 spam
export function useAuth() {
  // Return mock authentication state to prevent infinite queries
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}
