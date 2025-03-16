import { renderHook, act } from "@testing-library/react";
import { useLoginFlow, LoginStage } from "../hooks/use-login-flow";
import { toast } from "sonner";
import { authService } from "../hooks/use-auth";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../hooks/use-auth", () => ({
  authService: {
    requestMagicCode: jest.fn(),
  },
}));

jest.mock("@/shared/lib/error", () => ({
  useAsyncOperation: jest.fn((operation, options) => ({
    execute: async (...args) => {
      try {
        const result = await operation(...args);
        options?.onSuccess?.(result, ...args);
        return result;
      } catch (error) {
        options?.onError?.(error, ...args);
        throw error;
      }
    },
    isLoading: false,
  })),
  useFormError: () => ({
    handleError: jest.fn(),
  }),
}));

describe("useLoginFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with EMAIL_ENTRY stage", () => {
    const { result } = renderHook(() => useLoginFlow());
    expect(result.current.stage).toBe(LoginStage.EMAIL_ENTRY);
  });

  it("should transition to CAPTCHA_VERIFICATION stage after email submission", async () => {
    const { result } = renderHook(() => useLoginFlow());

    await act(async () => {
      await result.current.handleEmailSubmit({ email: "test@example.com" });
    });

    expect(result.current.stage).toBe(LoginStage.CAPTCHA_VERIFICATION);
    expect(result.current.userEmail).toBe("test@example.com");
  });

  it("should transition to MAGIC_CODE_SENT stage after successful CAPTCHA verification", async () => {
    // Mock successful API response
    (authService.requestMagicCode as jest.Mock).mockResolvedValueOnce({
      message: "Magic code sent",
      email: "test@example.com",
    });

    const { result } = renderHook(() => useLoginFlow());

    // Set email first
    await act(async () => {
      await result.current.handleEmailSubmit({ email: "test@example.com" });
    });

    // Then verify CAPTCHA
    await act(async () => {
      await result.current.handleCaptchaChange("valid-token");
    });

    expect(result.current.stage).toBe(LoginStage.MAGIC_CODE_SENT);
    expect(toast.success).toHaveBeenCalledWith(
      "If your email exists in our system, a magic code has been sent to it"
    );
    expect(authService.requestMagicCode).toHaveBeenCalledWith({
      email: "test@example.com",
      captcha_token: "valid-token",
    });
  });

  it("should handle API errors gracefully", async () => {
    // Mock API error
    const error = new Error("API error");
    (authService.requestMagicCode as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLoginFlow());

    // Set email first
    await act(async () => {
      await result.current.handleEmailSubmit({ email: "test@example.com" });
    });

    // Then verify CAPTCHA
    await act(async () => {
      await result.current.handleCaptchaChange("valid-token");
    });

    // Should still transition to MAGIC_CODE_SENT for security reasons
    expect(result.current.stage).toBe(LoginStage.MAGIC_CODE_SENT);
    expect(toast.success).toHaveBeenCalledWith(
      "If your email exists in our system, a magic code has been sent to it"
    );
  });

  it("should not proceed if CAPTCHA token is null", async () => {
    const { result } = renderHook(() => useLoginFlow());

    // Set email first
    await act(async () => {
      await result.current.handleEmailSubmit({ email: "test@example.com" });
    });

    // Then try to verify with null token
    await act(async () => {
      await result.current.handleCaptchaChange(null);
    });

    // Should remain in CAPTCHA_VERIFICATION stage
    expect(result.current.stage).toBe(LoginStage.CAPTCHA_VERIFICATION);
    expect(authService.requestMagicCode).not.toHaveBeenCalled();
  });
});
