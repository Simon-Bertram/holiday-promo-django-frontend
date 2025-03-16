import React, { useCallback } from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthStoreProvider, useAuthStore } from "../auth-store-provider";

// A simple component that uses the auth store with a selector
function TestComponent() {
  // This is similar to how VerifyCodePage uses the store
  // We're not using the result, but we need to call the hook to test for infinite loops
  useAuthStore(useCallback((state) => state.loginWithMagicCode, []));

  return <div>Test Component</div>;
}

// A component that uses multiple selectors to test for potential issues
function MultiSelectorComponent() {
  // Using multiple selectors in the same component
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <div>
      <div>User: {user ? user.email : "No user"}</div>
      <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
    </div>
  );
}

// A component that simulates the VerifyCodePage behavior
function VerifyCodeSimulator() {
  const loginWithMagicCode = useAuthStore(
    useCallback((state) => state.loginWithMagicCode, [])
  );

  // Simulate a form submission
  const handleSubmit = async () => {
    try {
      await loginWithMagicCode({
        email: "test@example.com",
        code: "12345",
      });
    } catch {
      // Ignore errors in test
    }
  };

  return (
    <div>
      <button onClick={handleSubmit}>Verify Code</button>
    </div>
  );
}

describe("AuthStore Infinite Loop Tests", () => {
  beforeEach(() => {
    // Silence console errors during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should render component with auth store selector without infinite loops", () => {
    // This test will fail if there's an infinite loop
    render(
      <AuthStoreProvider>
        <TestComponent />
      </AuthStoreProvider>
    );

    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });

  test("should handle multiple selectors without infinite loops", () => {
    render(
      <AuthStoreProvider>
        <MultiSelectorComponent />
      </AuthStoreProvider>
    );

    expect(screen.getByText(/User:/)).toBeInTheDocument();
    expect(screen.getByText(/Authenticated:/)).toBeInTheDocument();
    expect(screen.getByText(/Loading:/)).toBeInTheDocument();
  });

  test("should handle VerifyCodePage-like behavior without infinite loops", async () => {
    render(
      <AuthStoreProvider>
        <VerifyCodeSimulator />
      </AuthStoreProvider>
    );

    const button = screen.getByText("Verify Code");

    // This would trigger an infinite loop if our fix doesn't work
    await act(async () => {
      button.click();
    });

    // If we get here without an error, the test passes
    expect(button).toBeInTheDocument();
  });
});
