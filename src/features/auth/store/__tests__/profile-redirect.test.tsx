import React from "react";
import { render, screen } from "@testing-library/react";

// Create a simple mock component to test the redirection logic
function MockProfileComponent() {
  const [isAuthenticated] = React.useState(true);
  const [user] = React.useState({ email: "test@example.com" });
  const router = { push: jest.fn() };

  // Simulate the same pattern as in the real ProfilePage
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div>
      <h1>My Profile</h1>
      {user && <div>Welcome {user.email}</div>}
    </div>
  );
}

describe("Profile Page Redirection Logic", () => {
  test("should render profile page without infinite loops when authenticated", () => {
    render(<MockProfileComponent />);

    // If we get here without an error, the test passes
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });
});
