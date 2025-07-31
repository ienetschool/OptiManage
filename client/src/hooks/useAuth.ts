// Temporary authentication - always authenticated for testing dashboard pages
export function useAuth() {
  return {
    user: {
      id: "test-user",
      email: "admin@optistorepro.com",
      firstName: "Admin",
      lastName: "User"
    },
    isLoading: false,
    isAuthenticated: true,
  };
}
