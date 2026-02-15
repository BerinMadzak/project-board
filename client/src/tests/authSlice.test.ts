import { describe, it, expect } from "vitest";
import authReducer, { logout, setCredentials } from "../store/slices/authSlice";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  username: "testuser",
  role: "MEMBER",
};

describe("authSlice reducer", () => {
  it("returns the initial state when given undefined", () => {
    const state = authReducer(undefined as any, { type: "@@INIT" });
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
  });

  it("setCredentials sets user and marks authenticated", () => {
    const state = authReducer(initialState, setCredentials({ user: mockUser, token: "abc123" }));

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("abc123");
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout clears user and token", () => {
    const loggedInState = {
      ...initialState,
      user: mockUser,
      token: "abc123",
      isAuthenticated: true,
    };

    const state = authReducer(loggedInState, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});