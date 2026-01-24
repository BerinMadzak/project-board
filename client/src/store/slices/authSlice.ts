import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.log("Failed to load auth state from local storage:", error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

export const login = createAsyncThunk(
  "/auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
      }
      return rejectWithValue("Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "/auth/register",
  async (
    {
      email,
      password,
      username,
    }: { email: string; password: string; username: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/api/auth/register", {
        email,
        password,
        username,
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Registration failed",
        );
      }
      return rejectWithValue("Registration failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
