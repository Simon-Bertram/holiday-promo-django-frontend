import { createAuthStore } from "../store/auth-store";
import authService from "../../../shared/lib/api/services/auth-service";
import Cookies from "js-cookie";
import { User } from "../types/auth-types";

// Mock dependencies
jest.mock("../../../shared/lib/api/services/auth-service", () => ({
  verifyMagicCode: jest.fn(),
  logout: jest.fn(),
  deleteAccount: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("Auth Store", () => {
  let store: ReturnType<typeof createAuthStore>;

  // Create a mock user that matches the User interface
  const mockUser: User = {
    id: 123,
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    role: "USER",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = createAuthStore();
  });

  it("should initialize with default values", () => {
    const state = store.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set user", () => {
    store.getState().setUser(mockUser);
    expect(store.getState().user).toEqual(mockUser);
  });

  it("should set isAuthenticated", () => {
    store.getState().setIsAuthenticated(true);
    expect(store.getState().isAuthenticated).toBe(true);
  });

  it("should clear error", () => {
    // Set an error first
    store.setState({ error: "Test error" });
    expect(store.getState().error).toBe("Test error");

    // Clear the error
    store.getState().clearError();
    expect(store.getState().error).toBeNull();
  });

  describe("loginWithMagicCode", () => {
    it("should handle successful login", async () => {
      const mockResponse = {
        access: "access_token",
        refresh: "refresh_token",
        user: mockUser,
      };

      (authService.verifyMagicCode as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      await store
        .getState()
        .loginWithMagicCode({ email: "test@example.com", code: "12345" });

      // Check if tokens were stored in cookies
      expect(Cookies.set).toHaveBeenCalledWith(
        "access_token",
        "access_token",
        expect.any(Object)
      );
      expect(Cookies.set).toHaveBeenCalledWith(
        "refresh_token",
        "refresh_token",
        expect.any(Object)
      );

      // Check if user and authentication state were updated
      expect(store.getState().user).toEqual(mockUser);
      expect(store.getState().isAuthenticated).toBe(true);
      expect(store.getState().isLoading).toBe(false);
      expect(store.getState().error).toBeNull();
    });

    it("should handle login failure", async () => {
      const error = new Error("Invalid code");
      (authService.verifyMagicCode as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        store
          .getState()
          .loginWithMagicCode({ email: "test@example.com", code: "12345" })
      ).rejects.toThrow("Invalid code");

      // Check if error state was updated
      expect(store.getState().error).toBe("Invalid code");
      expect(store.getState().isLoading).toBe(false);
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("should clear user data and tokens", () => {
      // Set up initial authenticated state
      store.setState({ user: mockUser, isAuthenticated: true });

      // Perform logout
      store.getState().logout();

      // Check if cookies were removed
      expect(Cookies.remove).toHaveBeenCalledWith("access_token", {
        path: "/",
      });
      expect(Cookies.remove).toHaveBeenCalledWith("refresh_token", {
        path: "/",
      });

      // Check if auth service logout was called
      expect(authService.logout).toHaveBeenCalled();

      // Check if state was updated
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);
    });
  });

  describe("deleteAccount", () => {
    it("should handle successful account deletion", async () => {
      // Set up initial authenticated state
      store.setState({ user: mockUser, isAuthenticated: true });

      // Mock successful deletion
      (authService.deleteAccount as jest.Mock).mockResolvedValueOnce({
        message: "Account deleted",
      });

      // Perform account deletion
      await store.getState().deleteAccount();

      // Check if auth service deleteAccount was called
      expect(authService.deleteAccount).toHaveBeenCalled();

      // Check if state was updated
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);
      expect(store.getState().isLoading).toBe(false);
      expect(store.getState().error).toBeNull();
    });

    it("should handle account deletion failure", async () => {
      // Set up initial authenticated state
      store.setState({ user: mockUser, isAuthenticated: true });

      // Mock deletion failure
      const error = new Error("Failed to delete account");
      (authService.deleteAccount as jest.Mock).mockRejectedValueOnce(error);

      // Attempt account deletion
      await expect(store.getState().deleteAccount()).rejects.toThrow(
        "Failed to delete account"
      );

      // Check if error state was updated
      expect(store.getState().error).toBe("Failed to delete account");
      expect(store.getState().isLoading).toBe(false);

      // User should still be authenticated
      expect(store.getState().user).toEqual(mockUser);
      expect(store.getState().isAuthenticated).toBe(true);
    });
  });
});
