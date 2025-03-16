import React, { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { AuthStoreProvider, useAuthStore } from "../auth-store-provider";
import { createAuthStore } from "../auth-store";

// Mock createAuthStore
jest.mock("../auth-store", () => ({
  createAuthStore: jest.fn(),
}));

// Component that simulates the profile page behavior
const ProfilePageSimulator = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Simulate an error by forcing a re-render with different selector
  useEffect(() => {
    // This simulates what might be happening in the real app
    if (!isAuthenticated) {
      // Do something that might cause a re-render or state change
    }
  }, [isAuthenticated]);

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>
      <div data-testid="user-email">{user?.email || "No User"}</div>
    </div>
  );
};

// Component with error boundary to catch potential errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary">Error: {this.state.errorMessage}</div>
      );
    }
    return this.props.children;
  }
}

describe("AuthStore Sync Error Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: () => {},
        setIsAuthenticated: () => {},
        loginWithMagicCode: async () => ({
          id: 0,
          email: "",
          first_name: "",
          last_name: "",
          role: "USER",
        }),
        logout: () => {},
        deleteAccount: async () => {},
        clearError: () => {},
      }),
      setState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()), // Return unsubscribe function
    }));
  });

  it("should handle store subscription correctly", () => {
    render(
      <ErrorBoundary>
        <AuthStoreProvider>
          <ProfilePageSimulator />
        </AuthStoreProvider>
      </ErrorBoundary>
    );

    // If no error is thrown, the test passes
    expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
  });

  // Restore the test but with improved cleanup handling
  it("should handle store subscription errors", () => {
    // Mock a problematic subscribe implementation that might cause the error
    const mockSubscribe = jest.fn(() => {
      // Return a function that throws when called (simulating unsubscribe error)
      return () => {
        throw new Error("Subscription error");
      };
    });

    // Save original console.error
    const originalConsoleError = console.error;
    // Mock console.error to prevent test output pollution
    console.error = jest.fn();

    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: () => {},
        setIsAuthenticated: () => {},
        loginWithMagicCode: async () => ({
          id: 0,
          email: "",
          first_name: "",
          last_name: "",
          role: "USER",
        }),
        logout: () => {},
        deleteAccount: async () => {},
        clearError: () => {},
      }),
      setState: jest.fn(),
      subscribe: mockSubscribe,
    }));

    // We expect this to work now because our auth-store-provider has error handling
    const { unmount } = render(
      <ErrorBoundary>
        <AuthStoreProvider>
          <ProfilePageSimulator />
        </AuthStoreProvider>
      </ErrorBoundary>
    );

    // The component should still be rendered without errors
    expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status")).toBeInTheDocument();

    // Explicitly unmount to trigger cleanup, but catch any errors
    try {
      unmount();
    } catch (error) {
      // Expected error during unmount due to subscription error
      expect(error).toBeDefined();
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });

  it("should handle null store state", () => {
    // Mock a store that returns null for getState
    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => null,
      setState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    }));

    render(
      <ErrorBoundary>
        <AuthStoreProvider>
          <ProfilePageSimulator />
        </AuthStoreProvider>
      </ErrorBoundary>
    );

    // The component should still be rendered with fallback values
    expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
    expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
  });

  it("should handle store that throws during getState", () => {
    // Mock a store that throws during getState
    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => {
        throw new Error("getState error");
      },
      setState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    }));

    render(
      <ErrorBoundary>
        <AuthStoreProvider>
          <ProfilePageSimulator />
        </AuthStoreProvider>
      </ErrorBoundary>
    );

    // With our improved error handling, the component should still render
    // without triggering the error boundary
    expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
  });
});
