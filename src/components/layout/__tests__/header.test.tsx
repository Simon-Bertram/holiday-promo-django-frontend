import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../header";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";

// Mock the auth store
jest.mock("@/features/auth/store/auth-store-provider", () => ({
  useAuthStore: jest.fn(),
}));

describe("Header", () => {
  // Mock implementation
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show login and register buttons when user is not authenticated", () => {
    // Mock unauthenticated state
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(<Header />);

    // Check for login and register buttons
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();

    // Verify logout button is not present
    expect(
      screen.queryByRole("button", { name: /logout/i })
    ).not.toBeInTheDocument();
  });

  it("should show logout button when user is authenticated", () => {
    // Mock authenticated state with a user
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          id: 123,
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          role: "USER",
        },
        isAuthenticated: true,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(<Header />);

    // Check for welcome message and logout button
    expect(screen.getByText(/welcome, test/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

    // Verify login and register buttons are not present
    expect(
      screen.queryByRole("button", { name: /login/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /register/i })
    ).not.toBeInTheDocument();
  });

  it("should call logout when logout button is clicked", () => {
    // Mock authenticated state
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          id: 123,
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          role: "USER",
        },
        isAuthenticated: true,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(<Header />);

    // Click the logout button
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    // Verify logout function was called
    expect(mockLogout).toHaveBeenCalled();
  });

  it("should show dashboard link for admin users", () => {
    // Mock authenticated state with admin role
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          id: 123,
          email: "admin@example.com",
          first_name: "Admin",
          last_name: "User",
          role: "ADMIN",
        },
        isAuthenticated: true,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(<Header />);

    // Check for dashboard link
    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /profile/i })
    ).not.toBeInTheDocument();
  });

  it("should show profile link for regular users", () => {
    // Mock authenticated state with regular user role
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: {
          id: 123,
          email: "user@example.com",
          first_name: "Regular",
          last_name: "User",
          role: "USER",
        },
        isAuthenticated: true,
        logout: mockLogout,
      };
      return selector(state);
    });

    render(<Header />);

    // Check for profile link
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /dashboard/i })
    ).not.toBeInTheDocument();
  });
});
