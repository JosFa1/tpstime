import { render, screen } from "@testing-library/react";
import ExtensionPromo from "./ExtensionPromo";

jest.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/" }) }), { virtual: true });
let mockSignedIn = true;
jest.mock("../contexts/AuthContext", () => ({ useAuth: () => ({ isAuthenticated: mockSignedIn }) }));

beforeEach(() => {
  mockSignedIn = true;
  window.matchMedia = jest.fn(() => ({ matches: false })) as any;
});

it("shows only the extension link on desktop without opening a notification", () => {
  render(<ExtensionPromo />);
  expect(screen.getByRole("link", { name: "Get the extension" })).toHaveAttribute("href", expect.stringContaining("chromewebstore.google.com"));
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("hides the link on touch devices and for signed-out users", () => {
  window.matchMedia = jest.fn(() => ({ matches: true })) as any;
  const view = render(<ExtensionPromo />);
  expect(screen.queryByRole("link")).toBeNull();
  view.unmount();
  window.matchMedia = jest.fn(() => ({ matches: false })) as any;
  mockSignedIn = false;
  render(<ExtensionPromo />);
  expect(screen.queryByRole("link")).toBeNull();
});
