import { describe, it, expect, vi } from "vitest";
import authReducer, { logout, setCredentials } from "../store/slices/authSlice";
import { login, register, validate } from "../store/slices/authSlice";

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

vi.mock("../services/socket", () => ({
  initSocket: vi.fn(),
}));

describe("authSlice reducer", () => {
  it("returns the initial state when given undefined", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
  });

  it("setCredentials sets user and marks authenticated", () => {
    const state = authReducer(
      initialState,
      setCredentials({ user: mockUser, token: "abc123" }),
    );

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

describe("authSlice — login thunk", () => {
  it("sets loading true on pending", () => {
    const state = authReducer(
      initialState,
      login.pending("", { email: "test@example.com", password: "password123" }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets user and token on fulfilled", () => {
    const state = authReducer(
      initialState,
      login.fulfilled({ user: mockUser, token: "abc123" }, "", {
        email: "test@example.com",
        password: "password123",
      }),
    );
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("abc123");
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it("sets error on rejected", () => {
    const state = authReducer(
      initialState,
      login.rejected(
        null,
        "",
        { email: "", password: "" },
        "Invalid credentials",
      ),
    );
    expect(state.error).toBe("Invalid credentials");
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("authSlice — register thunk", () => {
  it("sets loading true on pending", () => {
    const state = authReducer(
      initialState,
      register.pending("", { email: "", password: "", username: "" }),
    );
    expect(state.loading).toBe(true);
  });

  it("sets user and token on fulfilled", () => {
    const state = authReducer(
      initialState,
      register.fulfilled({ user: mockUser, token: "abc123" }, "", {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      }),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it("sets error on rejected", () => {
    const state = authReducer(
      initialState,
      register.rejected(
        null,
        "",
        { email: "", password: "", username: "" },
        "Email already in use",
      ),
    );
    expect(state.error).toBe("Email already in use");
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("authSlice — validate thunk", () => {
  it("sets loading true on pending", () => {
    const state = authReducer(initialState, validate.pending("", undefined));
    expect(state.loading).toBe(true);
  });

  it("sets user on fulfilled", () => {
    const state = authReducer(
      initialState,
      validate.fulfilled({ user: mockUser }, "", undefined),
    );
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it("clears auth state on rejected", () => {
    const loggedInState = {
      ...initialState,
      user: mockUser,
      token: "abc123",
      isAuthenticated: true,
    };
    const state = authReducer(
      loggedInState,
      validate.rejected(null, "", undefined, "Failed to validate token"),
    );
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe("Failed to validate token");
  });
});
