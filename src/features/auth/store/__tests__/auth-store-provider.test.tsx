import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthStoreProvider, useAuthStore } from "../auth-store-provider";
import { createAuthStore } from "../auth-store";

// Mock createAuthStore to return a controlled store
jest.mock("../auth-store", () => ({
  createAuthStore: jest.fn(),
}));

// Test component that uses the auth store
const TestComponent = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>
      <div data-testid="user-email">{user?.email || "No User"}</div>
    </div>
  );
};

// Test component that uses the auth store outside of provider (should throw)
const TestComponentWithoutProvider = () => {
  try {
    const user = useAuthStore((state) => state.user);
    return <div>{user?.email || "No User"}</div>;
  } catch (error) {
    return (
      <div data-testid="error-message">Error: {(error as Error).message}</div>
    );
  }
};

describe("AuthStoreProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementation of createAuthStore
    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }),
      setState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()), // Return unsubscribe function
      destroy: jest.fn(),
    }));
  });

  it("should provide auth store to components", () => {
    render(
      <AuthStoreProvider>
        <TestComponent />
      </AuthStoreProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not Authenticated"
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent("No User");
  });

  it("should throw error when useAuthStore is used outside provider", () => {
    render(<TestComponentWithoutProvider />);

    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Error: useAuthStore must be used within AuthStoreProvider"
    );
  });

  it("should handle hydration correctly", () => {
    // Test that the provider handles hydration by not rendering children until hydrated
    render(
      <AuthStoreProvider>
        <TestComponent />
      </AuthStoreProvider>
    );

    // After initial render, children should be visible (hydration happens in useEffect)
    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
  });

  it("should handle store initialization errors", () => {
    // Mock createAuthStore to throw an error
    (createAuthStore as jest.Mock).mockImplementation(() => {
      throw new Error("Store initialization failed");
    });

    // Wrap in try/catch because we expect an error
    expect(() => {
      render(
        <AuthStoreProvider>
          <TestComponent />
        </AuthStoreProvider>
      );
    }).toThrow("Store initialization failed");
  });

  it("should handle selector errors in useAuthStore", () => {
    // Mock a store with a state that will cause selector errors
    (createAuthStore as jest.Mock).mockImplementation(() => ({
      getState: () => null, // This will cause errors when selectors try to access properties
      setState: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
      destroy: jest.fn(),
    }));

    // Create a component that catches the error
    const ErrorCatchingComponent = () => {
      try {
        const user = useAuthStore((state) => state?.user);
        return <div>{user?.email || "No User"}</div>;
      } catch (error) {
        return (
          <div data-testid="selector-error">
            Selector Error: {(error as Error).message}
          </div>
        );
      }
    };

    render(
      <AuthStoreProvider>
        <ErrorCatchingComponent />
      </AuthStoreProvider>
    );

    // Check if the error is caught and displayed
    expect(screen.getByTestId("selector-error")).toBeInTheDocument();
  });
});
