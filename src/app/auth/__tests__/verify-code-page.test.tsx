import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import VerifyCodePage from "../verify-code/page";
import { useAuthStore } from "@/features/auth/store/auth-store-provider";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/features/auth/store/auth-store-provider", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("VerifyCodePage", () => {
  // Mock implementations
  const mockPush = jest.fn();
  const mockSetUser = jest.fn();
  const mockSetIsAuthenticated = jest.fn();
  const mockLoginWithMagicCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock search params
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("test@example.com"),
    });

    // Mock auth store
    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        setUser: mockSetUser,
        setIsAuthenticated: mockSetIsAuthenticated,
        loginWithMagicCode: mockLoginWithMagicCode,
      };
      return selector(state);
    });
  });

  it("should render the verification form with email from URL", () => {
    render(<VerifyCodePage />);

    // Check if the form is rendered with the email from URL
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.value).toBe("test@example.com");

    // Check if the code input is rendered
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify code/i })
    ).toBeInTheDocument();
  });

  it("should handle successful verification for regular user", async () => {
    // Mock successful login
    mockLoginWithMagicCode.mockResolvedValueOnce({
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    });

    render(<VerifyCodePage />);

    // Fill in the code
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    // Wait for the verification to complete
    await waitFor(() => {
      expect(mockLoginWithMagicCode).toHaveBeenCalledWith({
        email: "test@example.com",
        code: "12345",
      });
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });

  it("should handle successful verification for admin user", async () => {
    // Mock successful login with admin role
    mockLoginWithMagicCode.mockResolvedValueOnce({
      id: "123",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
    });

    render(<VerifyCodePage />);

    // Fill in the code
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    // Wait for the verification to complete
    await waitFor(() => {
      expect(mockLoginWithMagicCode).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should handle verification errors", async () => {
    // Mock login error
    const error = new Error("Invalid code");
    mockLoginWithMagicCode.mockRejectedValueOnce(error);

    render(<VerifyCodePage />);

    // Fill in the code
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    // Wait for the verification to complete
    await waitFor(() => {
      expect(mockLoginWithMagicCode).toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
    });
  });

  it("should show loading state during verification", async () => {
    // Mock a delayed response to show loading state
    mockLoginWithMagicCode.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: "123",
            email: "test@example.com",
            name: "Test User",
            role: "USER",
          });
        }, 100);
      });
    });

    render(<VerifyCodePage />);

    // Fill in the code
    fireEvent.change(screen.getByLabelText(/verification code/i), {
      target: { value: "12345" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /verify code/i }));

    // Check for loading state
    expect(
      screen.getByRole("button", { name: /verifying/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verifying/i })).toBeDisabled();

    // Wait for the verification to complete
    await waitFor(() => {
      expect(mockLoginWithMagicCode).toHaveBeenCalled();
    });
  });
});
