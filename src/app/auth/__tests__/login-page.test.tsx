import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../login/page";
import { useLoginFlow, LoginStage } from "@/features/auth/hooks/use-login-flow";

// Mock the useLoginFlow hook
jest.mock("@/features/auth/hooks/use-login-flow", () => ({
  useLoginFlow: jest.fn(),
  LoginStage: {
    EMAIL_ENTRY: "EMAIL_ENTRY",
    CAPTCHA_VERIFICATION: "CAPTCHA_VERIFICATION",
    MAGIC_CODE_SENT: "MAGIC_CODE_SENT",
  },
}));

describe("LoginPage", () => {
  // Mock implementation for useLoginFlow
  const mockHandleEmailSubmit = jest.fn();
  const mockHandleCaptchaChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (useLoginFlow as jest.Mock).mockReturnValue({
      stage: LoginStage.EMAIL_ENTRY,
      userEmail: "",
      isLoading: false,
      handleEmailSubmit: mockHandleEmailSubmit,
      handleCaptchaChange: mockHandleCaptchaChange,
    });
  });

  it("should render the email form in the initial stage", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Enter your email to begin")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  it("should render the CAPTCHA verification in the second stage", () => {
    // Mock the hook to return CAPTCHA_VERIFICATION stage
    (useLoginFlow as jest.Mock).mockReturnValue({
      stage: LoginStage.CAPTCHA_VERIFICATION,
      userEmail: "test@example.com",
      isLoading: false,
      handleEmailSubmit: mockHandleEmailSubmit,
      handleCaptchaChange: mockHandleCaptchaChange,
    });

    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Verify you're human")).toBeInTheDocument();
    expect(
      screen.getByText(/please complete the captcha verification/i)
    ).toBeInTheDocument();
  });

  it("should render the magic code sent message in the final stage", () => {
    // Mock the hook to return MAGIC_CODE_SENT stage
    (useLoginFlow as jest.Mock).mockReturnValue({
      stage: LoginStage.MAGIC_CODE_SENT,
      userEmail: "test@example.com",
      isLoading: false,
      handleEmailSubmit: mockHandleEmailSubmit,
      handleCaptchaChange: mockHandleCaptchaChange,
    });

    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(
      screen.getByText("Check your email for the verification code")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we've sent a 5-digit verification code/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter verification code/i })
    ).toBeInTheDocument();
  });

  it("should handle email submission", async () => {
    render(<LoginPage />);

    // Fill in the email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Wait for the form submission to complete
    await waitFor(() => {
      // The mock function is called with the form event, not just the email object
      expect(mockHandleEmailSubmit).toHaveBeenCalled();
      // Check that the first argument passed to the mock contains the email
      const firstCallArg = mockHandleEmailSubmit.mock.calls[0][0];
      expect(firstCallArg).toHaveProperty("email", "test@example.com");
    });
  });

  it("should show loading state when isLoading is true", () => {
    // Mock the hook to return loading state
    (useLoginFlow as jest.Mock).mockReturnValue({
      stage: LoginStage.EMAIL_ENTRY,
      userEmail: "",
      isLoading: true,
      handleEmailSubmit: mockHandleEmailSubmit,
      handleCaptchaChange: mockHandleCaptchaChange,
    });

    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /processing/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
  });

  it("should show the register link", () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/auth/register");
  });
});
