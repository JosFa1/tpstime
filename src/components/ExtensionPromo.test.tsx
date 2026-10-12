import { fireEvent, render, screen } from "@testing-library/react";
import ExtensionPromo from "./ExtensionPromo";

// Jest 27 cannot resolve react-router v7's package exports.
jest.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/" }) }), { virtual: true });
let mockSignedIn = true;
jest.mock("../contexts/AuthContext", () => ({ useAuth: () => ({ isAuthenticated: mockSignedIn }) }));

const showModal = jest.fn(function (this: any) {
  this.open = true;
});

const renderPromo = () => render(<ExtensionPromo />);

beforeEach(() => {
  localStorage.clear();
  mockSignedIn = true;
  showModal.mockClear();
  // jsdom has no <dialog> or media playback.
  (HTMLElement.prototype as any).showModal = showModal;
  (HTMLElement.prototype as any).close = function () {
    this.open = false;
  };
  HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = jest.fn();
  window.matchMedia = jest.fn(() => ({ matches: false })) as any;
});

it("opens once on a first visit, then only from the button", () => {
  renderPromo().unmount();
  expect(showModal).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("extensionPromoSeen")).toBe("1");

  renderPromo();
  expect(showModal).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Get the extension"));
  expect(showModal).toHaveBeenCalledTimes(2);
});

it("shows nothing on touch devices", () => {
  window.matchMedia = jest.fn(() => ({ matches: true })) as any;
  renderPromo();
  expect(showModal).not.toHaveBeenCalled();
  expect(screen.queryByText("Get the extension")).toBeNull();
});

it("waits until the user signs in", () => {
  mockSignedIn = false;
  renderPromo();
  expect(showModal).not.toHaveBeenCalled();
  expect(localStorage.getItem("extensionPromoSeen")).toBeNull();
});
