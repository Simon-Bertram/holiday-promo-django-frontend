// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress React 18 console errors/warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18./.test(
      args[0]
    ) ||
    /Warning: The current testing environment is not configured to support act/.test(
      args[0]
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};
